/**
 * Agent Communication Protocol
 * 
 * Implements secure, scalable inter-agent messaging for DAC ecosystem.
 * Provides message routing, delivery confirmation, and basic security.
 * 
 * Aligns with Phase 1.1.1: Week 3 - Communication Protocol Development
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Message Types
 */
export const MessageType = {
  REQUEST: 'request',
  RESPONSE: 'response',
  NOTIFICATION: 'notification',
  BROADCAST: 'broadcast'
};

/**
 * Message Priority Levels
 */
export const MessagePriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3
};

/**
 * Message Status
 */
export const MessageStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

/**
 * Communication Protocol Class
 * 
 * Handles message passing between agents with:
 * - Routing and delivery
 * - Message queuing and prioritization
 * - Delivery confirmation
 * - Rate limiting
 * - Basic encryption support hooks
 */
export class CommunicationProtocol extends EventEmitter {
  /**
   * Create a new Communication Protocol instance
   * 
   * @param {Object} config - Protocol configuration
   * @param {AgentRegistry} config.registry - Agent registry for routing
   * @param {number} [config.maxQueueSize] - Maximum queue size per agent
   * @param {number} [config.messageTimeout] - Message timeout in ms
   * @param {number} [config.rateLimitPerMinute] - Max messages per minute per agent
   */
  constructor(config = {}) {
    super();
    
    if (!config.registry) {
      throw new Error('CommunicationProtocol requires an AgentRegistry instance');
    }
    
    this.registry = config.registry;
    
    // Configuration
    this.config = {
      maxQueueSize: config.maxQueueSize || 100,
      messageTimeout: config.messageTimeout || 120000, // 120 seconds (2 minutes)
      rateLimitPerMinute: config.rateLimitPerMinute || 100,
      enableEncryption: config.enableEncryption || false,
      ...config
    };
    
    // Message storage
    this.messages = new Map(); // messageId -> message
    this.messageQueues = new Map(); // agentId -> message queue
    this.pendingResponses = new Map(); // messageId -> Promise resolve/reject
    
    // Rate limiting
    this.rateLimitCounters = new Map(); // agentId -> { count, resetTime }
    
    // Statistics
    this.stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalRateLimited: 0
    };
    
    // Start cleanup timer
    this._startCleanupTimer();
  }

  /**
   * Send a message from one agent to another
   * 
   * @param {Object} params - Message parameters
   * @param {string} params.fromAgentId - Sender agent ID
   * @param {string} params.toAgentId - Recipient agent ID
   * @param {string} params.type - Message type
   * @param {*} params.payload - Message payload
   * @param {number} [params.priority] - Message priority
   * @param {number} [params.timeout] - Custom timeout for this message
   * @returns {Promise<Object>} Response for REQUEST type, or delivery confirmation
   */
  async send(params) {
    const {
      fromAgentId,
      toAgentId,
      type = MessageType.NOTIFICATION,
      payload,
      priority = MessagePriority.NORMAL,
      timeout = this.config.messageTimeout
    } = params;

    // Validate sender and recipient
    if (!this.registry.hasAgent(fromAgentId)) {
      throw new Error(`Sender agent ${fromAgentId} not registered`);
    }
    
    if (!this.registry.hasAgent(toAgentId)) {
      throw new Error(`Recipient agent ${toAgentId} not registered`);
    }

    // Check rate limit
    if (this._isRateLimited(fromAgentId)) {
      this.stats.totalRateLimited++;
      throw new Error(`Agent ${fromAgentId} is rate limited`);
    }

    // Create message
    const message = {
      messageId: uuidv4(),
      fromAgentId,
      toAgentId,
      type,
      payload,
      priority,
      timestamp: Date.now(),
      status: MessageStatus.PENDING,
      timeout
    };

    // Store message
    this.messages.set(message.messageId, message);
    
    // Update rate limit counter
    this._incrementRateLimit(fromAgentId);
    
    // Queue message for delivery
    this._queueMessage(message);
    
    // Emit send event
    this.emit('messageSent', message);
    this.stats.totalSent++;

    // For REQUEST type, wait for response
    if (type === MessageType.REQUEST) {
      return this._waitForResponse(message);
    }
    
    // For other types, return immediately after queuing
    return { messageId: message.messageId, status: MessageStatus.SENT };
  }

  /**
   * Send a broadcast message to all agents in a shard
   * 
   * @param {Object} params - Broadcast parameters
   * @param {string} params.fromAgentId - Sender agent ID
   * @param {string} params.shardId - Target shard ID
   * @param {*} params.payload - Message payload
   * @param {number} [params.priority] - Message priority
   * @returns {Promise<Object>} Delivery summary
   */
  async broadcast(params) {
    const {
      fromAgentId,
      shardId,
      payload,
      priority = MessagePriority.NORMAL
    } = params;

    const agents = this.registry.getAgentsByShard(shardId);
    const results = {
      total: agents.length,
      sent: 0,
      failed: 0,
      messageIds: []
    };

    // Send to all agents in shard (except sender)
    for (const agent of agents) {
      if (agent.agentId === fromAgentId) continue;
      
      try {
        const result = await this.send({
          fromAgentId,
          toAgentId: agent.agentId,
          type: MessageType.BROADCAST,
          payload,
          priority
        });
        results.sent++;
        results.messageIds.push(result.messageId);
      } catch (error) {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Respond to a request message
   * 
   * @param {string} requestMessageId - ID of the request message
   * @param {*} payload - Response payload
   * @returns {Promise<Object>} Delivery confirmation
   */
  async respond(requestMessageId, payload) {
    const requestMessage = this.messages.get(requestMessageId);
    
    if (!requestMessage) {
      throw new Error(`Request message ${requestMessageId} not found`);
    }
    
    if (requestMessage.type !== MessageType.REQUEST) {
      throw new Error('Can only respond to REQUEST type messages');
    }

    // Send response
    const result = await this.send({
      fromAgentId: requestMessage.toAgentId,
      toAgentId: requestMessage.fromAgentId,
      type: MessageType.RESPONSE,
      payload: {
        requestMessageId,
        data: payload
      }
    });

    // Resolve pending promise
    const pending = this.pendingResponses.get(requestMessageId);
    if (pending) {
      pending.resolve(payload);
      this.pendingResponses.delete(requestMessageId);
    }

    return result;
  }

  /**
   * Get message by ID
   * 
   * @param {string} messageId - Message ID
   * @returns {Object|null} Message or null if not found
   */
  getMessage(messageId) {
    return this.messages.get(messageId) || null;
  }

  /**
   * Get messages for an agent
   * 
   * @param {string} agentId - Agent ID
   * @param {Object} [filters] - Optional filters
   * @returns {Array<Object>} Array of messages
   */
  getMessages(agentId, filters = {}) {
    let messages = Array.from(this.messages.values())
      .filter(msg => msg.toAgentId === agentId || msg.fromAgentId === agentId);
    
    if (filters.type) {
      messages = messages.filter(msg => msg.type === filters.type);
    }
    
    if (filters.status) {
      messages = messages.filter(msg => msg.status === filters.status);
    }
    
    if (filters.direction === 'received') {
      messages = messages.filter(msg => msg.toAgentId === agentId);
    } else if (filters.direction === 'sent') {
      messages = messages.filter(msg => msg.fromAgentId === agentId);
    }
    
    return messages;
  }

  /**
   * Get pending messages in queue for an agent
   * 
   * @param {string} agentId - Agent ID
   * @returns {Array<Object>} Queued messages
   */
  getQueuedMessages(agentId) {
    const queue = this.messageQueues.get(agentId);
    return queue ? Array.from(queue) : [];
  }

  /**
   * Get protocol statistics
   * 
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      totalMessages: this.messages.size,
      activeQueues: this.messageQueues.size,
      pendingResponses: this.pendingResponses.size
    };
  }

  /**
   * Shutdown the protocol and cleanup
   */
  async shutdown() {
    // Stop cleanup timer
    this._stopCleanupTimer();
    
    // Reject all pending responses
    for (const [messageId, pending] of this.pendingResponses) {
      pending.reject(new Error('Protocol shutting down'));
    }
    this.pendingResponses.clear();
    
    // Clear all queues
    this.messageQueues.clear();
    
    this.emit('shutdown');
  }

  // Private methods

  /**
   * Queue a message for delivery
   * @private
   */
  _queueMessage(message) {
    const agentId = message.toAgentId;
    
    if (!this.messageQueues.has(agentId)) {
      this.messageQueues.set(agentId, []);
    }
    
    const queue = this.messageQueues.get(agentId);
    
    // Check queue size limit
    if (queue.length >= this.config.maxQueueSize) {
      message.status = MessageStatus.FAILED;
      this.stats.totalFailed++;
      throw new Error(`Message queue full for agent ${agentId}`);
    }
    
    // Add to queue
    queue.push(message);
    
    // Sort by priority
    queue.sort((a, b) => b.priority - a.priority);
    
    // Deliver immediately (in real implementation, this might be async/batched)
    setImmediate(() => this._deliverMessage(message));
  }

  /**
   * Deliver a message to the recipient
   * @private
   */
  _deliverMessage(message) {
    const agent = this.registry.getAgent(message.toAgentId);
    
    if (!agent) {
      message.status = MessageStatus.FAILED;
      this.stats.totalFailed++;
      this.emit('messageFailure', message);
      return;
    }

    // Update status
    message.status = MessageStatus.DELIVERED;
    this.stats.totalDelivered++;
    
    // Remove from queue
    const queue = this.messageQueues.get(message.toAgentId);
    if (queue) {
      const index = queue.findIndex(m => m.messageId === message.messageId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
    
    // Emit delivery event (agent can listen to this)
    this.emit('messageDelivered', message);
    
    // Notify recipient agent
    agent.emit('message', message);
  }

  /**
   * Wait for response to a request message
   * @private
   */
  _waitForResponse(message) {
    return new Promise((resolve, reject) => {
      // Store promise handlers
      this.pendingResponses.set(message.messageId, { resolve, reject });
      
      // Set timeout
      setTimeout(() => {
        if (this.pendingResponses.has(message.messageId)) {
          this.pendingResponses.delete(message.messageId);
          message.status = MessageStatus.EXPIRED;
          reject(new Error('Request timeout'));
        }
      }, message.timeout);
    });
  }

  /**
   * Check if agent is rate limited
   * @private
   */
  _isRateLimited(agentId) {
    const counter = this.rateLimitCounters.get(agentId);
    
    if (!counter) return false;
    
    const now = Date.now();
    if (now > counter.resetTime) {
      // Reset counter
      this.rateLimitCounters.delete(agentId);
      return false;
    }
    
    return counter.count >= this.config.rateLimitPerMinute;
  }

  /**
   * Increment rate limit counter for agent
   * @private
   */
  _incrementRateLimit(agentId) {
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute
    
    const counter = this.rateLimitCounters.get(agentId);
    
    if (!counter || now > counter.resetTime) {
      this.rateLimitCounters.set(agentId, { count: 1, resetTime });
    } else {
      counter.count++;
    }
  }

  /**
   * Start cleanup timer for expired messages
   * @private
   */
  _startCleanupTimer() {
    this._cleanupTimer = setInterval(() => {
      const now = Date.now();
      
      // Clean up expired messages
      for (const [messageId, message] of this.messages) {
        if (now - message.timestamp > message.timeout * 2) {
          this.messages.delete(messageId);
        }
      }
      
      // Clean up expired rate limit counters
      for (const [agentId, counter] of this.rateLimitCounters) {
        if (now > counter.resetTime) {
          this.rateLimitCounters.delete(agentId);
        }
      }
    }, 60000); // Run every minute
  }

  /**
   * Stop cleanup timer
   * @private
   */
  _stopCleanupTimer() {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
      this._cleanupTimer = null;
    }
  }
}

export default CommunicationProtocol;
