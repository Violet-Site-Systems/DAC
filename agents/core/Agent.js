/**
 * Base Agent Class
 * 
 * Core implementation of DAC agents with shard-based organization.
 * Implements foundational agent lifecycle, identification, and state management.
 * 
 * Aligns with Phase 1.1.1: Foundational Agent Architecture Development
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Agent States
 * Defines the lifecycle states of an agent
 */
export const AgentState = {
  INITIALIZING: 'initializing',
  ACTIVE: 'active',
  PAUSED: 'paused',
  TERMINATING: 'terminating',
  TERMINATED: 'terminated',
  ERROR: 'error'
};

/**
 * Base Agent Class
 * 
 * All DAC agents inherit from this base class which provides:
 * - Unique identification with shard association
 * - Lifecycle management (spawn, pause, resume, terminate)
 * - Event-driven architecture for extensibility
 * - State management and monitoring
 */
export class Agent extends EventEmitter {
  /**
   * Create a new Agent
   * 
   * @param {Object} config - Agent configuration
   * @param {string} config.shardId - The DAC shard this agent belongs to
   * @param {string} [config.agentId] - Optional custom agent ID (auto-generated if not provided)
   * @param {string} [config.type] - Agent type identifier
   * @param {Object} [config.metadata] - Additional metadata for the agent
   */
  constructor(config = {}) {
    super();
    
    // Validate required config
    if (!config.shardId) {
      throw new Error('Agent must be associated with a shard (config.shardId required)');
    }

    // Core identification
    this.agentId = config.agentId || uuidv4();
    this.shardId = config.shardId;
    this.type = config.type || 'generic';
    
    // State management
    this.state = AgentState.INITIALIZING;
    this.metadata = {
      createdAt: new Date().toISOString(),
      lastStateChange: new Date().toISOString(),
      ...config.metadata
    };
    
    // Lifecycle tracking
    this.startTime = null;
    this.pauseTime = null;
    this.terminateTime = null;
    
    // Health monitoring
    this.lastHeartbeat = Date.now();
    this.heartbeatInterval = config.heartbeatInterval || 30000; // 30 seconds default
    
    // Logging
    this.logs = [];
    this.maxLogEntries = config.maxLogEntries || 1000;
    
    this._log('info', 'Agent initialized', { agentId: this.agentId, shardId: this.shardId });
  }

  /**
   * Get agent information
   * @returns {Object} Agent info object
   */
  getInfo() {
    return {
      agentId: this.agentId,
      shardId: this.shardId,
      type: this.type,
      state: this.state,
      metadata: this.metadata,
      uptime: this.getUptime(),
      lastHeartbeat: this.lastHeartbeat
    };
  }

  /**
   * Calculate agent uptime in milliseconds
   * @returns {number|null} Uptime in ms, or null if not started
   */
  getUptime() {
    if (!this.startTime) return null;
    const endTime = this.terminateTime || Date.now();
    return endTime - this.startTime;
  }

  /**
   * Spawn/Start the agent
   * Transitions agent from INITIALIZING to ACTIVE state
   */
  async spawn() {
    if (this.state !== AgentState.INITIALIZING && this.state !== AgentState.PAUSED) {
      throw new Error(`Cannot spawn agent in ${this.state} state`);
    }

    try {
      this._log('info', 'Spawning agent');
      this._changeState(AgentState.ACTIVE);
      this.startTime = Date.now();
      
      // Start heartbeat monitoring
      this._startHeartbeat();
      
      // Emit spawn event for hooks
      this.emit('spawn', { agentId: this.agentId });
      
      // Call lifecycle hook (can be overridden by subclasses)
      await this.onSpawn();
      
      this._log('info', 'Agent spawned successfully');
    } catch (error) {
      this._changeState(AgentState.ERROR);
      this._log('error', 'Failed to spawn agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Pause the agent
   * Temporarily suspends agent operations
   */
  async pause() {
    if (this.state !== AgentState.ACTIVE) {
      throw new Error(`Cannot pause agent in ${this.state} state`);
    }

    try {
      this._log('info', 'Pausing agent');
      this._changeState(AgentState.PAUSED);
      this.pauseTime = Date.now();
      
      // Stop heartbeat
      this._stopHeartbeat();
      
      this.emit('pause', { agentId: this.agentId });
      await this.onPause();
      
      this._log('info', 'Agent paused successfully');
    } catch (error) {
      this._changeState(AgentState.ERROR);
      this._log('error', 'Failed to pause agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Resume the agent from paused state
   */
  async resume() {
    if (this.state !== AgentState.PAUSED) {
      throw new Error(`Cannot resume agent in ${this.state} state`);
    }

    try {
      this._log('info', 'Resuming agent');
      this._changeState(AgentState.ACTIVE);
      this.pauseTime = null;
      
      // Restart heartbeat
      this._startHeartbeat();
      
      this.emit('resume', { agentId: this.agentId });
      await this.onResume();
      
      this._log('info', 'Agent resumed successfully');
    } catch (error) {
      this._changeState(AgentState.ERROR);
      this._log('error', 'Failed to resume agent', { error: error.message });
      throw error;
    }
  }

  /**
   * Terminate the agent
   * Gracefully shuts down the agent
   */
  async terminate() {
    if (this.state === AgentState.TERMINATED || this.state === AgentState.TERMINATING) {
      this._log('warn', 'Agent already terminated or terminating');
      return;
    }

    try {
      this._log('info', 'Terminating agent');
      this._changeState(AgentState.TERMINATING);
      
      // Stop heartbeat
      this._stopHeartbeat();
      
      this.emit('terminate', { agentId: this.agentId });
      await this.onTerminate();
      
      this._changeState(AgentState.TERMINATED);
      this.terminateTime = Date.now();
      
      this._log('info', 'Agent terminated successfully');
    } catch (error) {
      this._changeState(AgentState.ERROR);
      this._log('error', 'Failed to terminate agent cleanly', { error: error.message });
      throw error;
    }
  }

  /**
   * Update heartbeat timestamp
   * Should be called periodically to indicate agent is alive
   */
  heartbeat() {
    this.lastHeartbeat = Date.now();
    this.emit('heartbeat', { agentId: this.agentId, timestamp: this.lastHeartbeat });
  }

  /**
   * Check if agent is responsive (heartbeat within threshold)
   * @param {number} [threshold] - Maximum age of heartbeat in ms (default: 2x heartbeat interval)
   * @returns {boolean} True if agent is responsive
   */
  isResponsive(threshold = this.heartbeatInterval * 2) {
    return (Date.now() - this.lastHeartbeat) < threshold;
  }

  // Lifecycle hooks (to be overridden by subclasses)
  async onSpawn() {}
  async onPause() {}
  async onResume() {}
  async onTerminate() {}

  // Internal methods

  /**
   * Change agent state and emit event
   * @private
   */
  _changeState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.metadata.lastStateChange = new Date().toISOString();
    this.emit('stateChange', { agentId: this.agentId, oldState, newState });
  }

  /**
   * Start automatic heartbeat
   * @private
   */
  _startHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
    }
    this._heartbeatTimer = setInterval(() => {
      this.heartbeat();
    }, this.heartbeatInterval);
  }

  /**
   * Stop automatic heartbeat
   * @private
   */
  _stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  /**
   * Internal logging method
   * @private
   */
  _log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      agentId: this.agentId,
      shardId: this.shardId,
      state: this.state,
      ...data
    };
    
    this.logs.push(entry);
    
    // Limit log size
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }
    
    this.emit('log', entry);
  }

  /**
   * Get recent logs
   * @param {number} [count] - Number of recent logs to retrieve (default: all)
   * @param {string} [level] - Filter by log level
   * @returns {Array} Array of log entries
   */
  getLogs(count = this.logs.length, level = null) {
    let logs = this.logs;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-count);
  }
}

export default Agent;
