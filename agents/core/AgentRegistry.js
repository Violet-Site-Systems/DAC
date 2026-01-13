/**
 * Agent Registry
 * 
 * Central registry for agent discovery and management within the DAC ecosystem.
 * Provides mechanisms for agents to register, discover each other, and manage
 * their lifecycle at the ecosystem level.
 * 
 * Aligns with Phase 1.1.1: Week 2 - Core Agent Implementation
 */

import { EventEmitter } from 'eventemitter3';

/**
 * Agent Registry Class
 * 
 * Manages the registration and discovery of agents across DAC shards.
 * Provides:
 * - Agent registration and deregistration
 * - Agent discovery by ID, shard, or type
 * - Health monitoring of registered agents
 * - Statistics and metrics
 */
export class AgentRegistry extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Storage for registered agents
    this.agents = new Map(); // agentId -> agent reference
    this.shardIndex = new Map(); // shardId -> Set of agentIds
    this.typeIndex = new Map(); // type -> Set of agentIds
    
    // Configuration
    this.config = {
      healthCheckInterval: config.healthCheckInterval || 60000, // 1 minute
      maxAgentsPerShard: config.maxAgentsPerShard || 1000,
      ...config
    };
    
    // Statistics
    this.stats = {
      totalRegistrations: 0,
      totalDeregistrations: 0,
      activeAgents: 0
    };
    
    // Start health monitoring
    this._startHealthMonitoring();
  }

  /**
   * Register an agent with the registry
   * 
   * @param {Agent} agent - Agent instance to register
   * @throws {Error} If agent is invalid or shard limit exceeded
   */
  register(agent) {
    // Validation
    if (!agent || !agent.agentId || !agent.shardId) {
      throw new Error('Invalid agent: must have agentId and shardId');
    }

    if (this.agents.has(agent.agentId)) {
      throw new Error(`Agent ${agent.agentId} is already registered`);
    }

    // Check shard limits
    const shardAgents = this.shardIndex.get(agent.shardId) || new Set();
    if (shardAgents.size >= this.config.maxAgentsPerShard) {
      throw new Error(`Shard ${agent.shardId} has reached maximum agent capacity`);
    }

    // Register the agent
    this.agents.set(agent.agentId, agent);
    
    // Update shard index
    shardAgents.add(agent.agentId);
    this.shardIndex.set(agent.shardId, shardAgents);
    
    // Update type index
    const typeAgents = this.typeIndex.get(agent.type) || new Set();
    typeAgents.add(agent.agentId);
    this.typeIndex.set(agent.type, typeAgents);
    
    // Update stats
    this.stats.totalRegistrations++;
    this.stats.activeAgents = this.agents.size;
    
    // Listen to agent lifecycle events
    this._attachAgentListeners(agent);
    
    // Emit registration event
    this.emit('register', {
      agentId: agent.agentId,
      shardId: agent.shardId,
      type: agent.type
    });

    return true;
  }

  /**
   * Deregister an agent from the registry
   * 
   * @param {string} agentId - ID of agent to deregister
   * @returns {boolean} True if agent was deregistered
   */
  deregister(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Remove from main storage
    this.agents.delete(agentId);
    
    // Remove from shard index
    const shardAgents = this.shardIndex.get(agent.shardId);
    if (shardAgents) {
      shardAgents.delete(agentId);
      if (shardAgents.size === 0) {
        this.shardIndex.delete(agent.shardId);
      }
    }
    
    // Remove from type index
    const typeAgents = this.typeIndex.get(agent.type);
    if (typeAgents) {
      typeAgents.delete(agentId);
      if (typeAgents.size === 0) {
        this.typeIndex.delete(agent.type);
      }
    }
    
    // Remove event listeners
    this._detachAgentListeners(agent);
    
    // Update stats
    this.stats.totalDeregistrations++;
    this.stats.activeAgents = this.agents.size;
    
    // Emit deregistration event
    this.emit('deregister', {
      agentId: agent.agentId,
      shardId: agent.shardId
    });

    return true;
  }

  /**
   * Get an agent by ID
   * 
   * @param {string} agentId - Agent ID to look up
   * @returns {Agent|null} Agent instance or null if not found
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents in a specific shard
   * 
   * @param {string} shardId - Shard ID to query
   * @returns {Array<Agent>} Array of agents in the shard
   */
  getAgentsByShard(shardId) {
    const agentIds = this.shardIndex.get(shardId);
    if (!agentIds) return [];
    
    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(agent => agent !== undefined);
  }

  /**
   * Get all agents of a specific type
   * 
   * @param {string} type - Agent type to query
   * @returns {Array<Agent>} Array of agents of the specified type
   */
  getAgentsByType(type) {
    const agentIds = this.typeIndex.get(type);
    if (!agentIds) return [];
    
    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(agent => agent !== undefined);
  }

  /**
   * Get all registered agents
   * 
   * @returns {Array<Agent>} Array of all agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Get all registered shard IDs
   * 
   * @returns {Array<string>} Array of shard IDs
   */
  getShardIds() {
    return Array.from(this.shardIndex.keys());
  }

  /**
   * Get all registered agent types
   * 
   * @returns {Array<string>} Array of agent types
   */
  getAgentTypes() {
    return Array.from(this.typeIndex.keys());
  }

  /**
   * Check if an agent is registered
   * 
   * @param {string} agentId - Agent ID to check
   * @returns {boolean} True if agent is registered
   */
  hasAgent(agentId) {
    return this.agents.has(agentId);
  }

  /**
   * Get registry statistics
   * 
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      totalShards: this.shardIndex.size,
      totalTypes: this.typeIndex.size,
      averageAgentsPerShard: this.shardIndex.size > 0 
        ? this.agents.size / this.shardIndex.size 
        : 0
    };
  }

  /**
   * Get agents by state
   * 
   * @param {string} state - Agent state to filter by
   * @returns {Array<Agent>} Agents in the specified state
   */
  getAgentsByState(state) {
    return this.getAllAgents().filter(agent => agent.state === state);
  }

  /**
   * Get unresponsive agents
   * 
   * @param {number} [threshold] - Maximum heartbeat age in ms
   * @returns {Array<Agent>} Unresponsive agents
   */
  getUnresponsiveAgents(threshold) {
    return this.getAllAgents().filter(agent => !agent.isResponsive(threshold));
  }

  /**
   * Perform health check on all registered agents
   * 
   * @returns {Object} Health check results
   */
  healthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      totalAgents: this.agents.size,
      healthy: 0,
      unhealthy: 0,
      unresponsive: 0,
      byState: {}
    };

    this.getAllAgents().forEach(agent => {
      // Count by state
      results.byState[agent.state] = (results.byState[agent.state] || 0) + 1;
      
      // Check responsiveness
      if (!agent.isResponsive()) {
        results.unresponsive++;
        results.unhealthy++;
      } else if (agent.state === 'error') {
        results.unhealthy++;
      } else if (agent.state === 'active') {
        results.healthy++;
      }
    });

    return results;
  }

  /**
   * Shutdown the registry and cleanup
   */
  async shutdown() {
    // Stop health monitoring
    this._stopHealthMonitoring();
    
    // Deregister all agents
    const agentIds = Array.from(this.agents.keys());
    for (const agentId of agentIds) {
      this.deregister(agentId);
    }
    
    this.emit('shutdown');
  }

  // Private methods

  /**
   * Attach event listeners to an agent
   * @private
   */
  _attachAgentListeners(agent) {
    agent.on('stateChange', (data) => {
      this.emit('agentStateChange', data);
    });
    
    agent.on('terminate', (data) => {
      // Auto-deregister terminated agents
      this.deregister(data.agentId);
    });
  }

  /**
   * Detach event listeners from an agent
   * @private
   */
  _detachAgentListeners(agent) {
    agent.removeAllListeners('stateChange');
    agent.removeAllListeners('terminate');
  }

  /**
   * Start periodic health monitoring
   * @private
   */
  _startHealthMonitoring() {
    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
    }
    
    this._healthCheckTimer = setInterval(() => {
      const results = this.healthCheck();
      this.emit('healthCheck', results);
      
      // Emit warning for unresponsive agents
      if (results.unresponsive > 0) {
        this.emit('unresponsiveAgents', {
          count: results.unresponsive,
          agents: this.getUnresponsiveAgents()
        });
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   * @private
   */
  _stopHealthMonitoring() {
    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
      this._healthCheckTimer = null;
    }
  }
}

export default AgentRegistry;
