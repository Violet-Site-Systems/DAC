/**
 * DAC Agent Framework
 * Core Agentic Infrastructure for Decentralized Autonomous Communities
 * 
 * Main entry point for the agent framework.
 * Exports all core components for creating and managing DAC agents.
 */

import { Agent, AgentState } from './Agent.js';
import { AgentRegistry } from './AgentRegistry.js';
import { CommunicationProtocol, MessageType, MessagePriority, MessageStatus } from '../communication/CommunicationProtocol.js';

// Re-export all components
export { Agent, AgentState };
export { AgentRegistry };
export { CommunicationProtocol, MessageType, MessagePriority, MessageStatus };

// Version
export const VERSION = '0.1.0';

// Framework info
export const FRAMEWORK_INFO = {
  name: 'DAC Agent Framework',
  version: VERSION,
  description: 'Core Agentic Infrastructure for Decentralized Autonomous Communities',
  phase: 'Phase 1.1: Foundational Architecture'
};

/**
 * Initialize the DAC Agent Framework
 * 
 * @param {Object} config - Framework configuration
 * @returns {Object} Initialized framework components
 */
export function initializeFramework(config = {}) {
  // Create registry
  const registry = new AgentRegistry(config.registry);
  
  // Create communication protocol
  const protocol = new CommunicationProtocol({
    registry,
    ...config.protocol
  });
  
  return {
    registry,
    protocol,
    version: VERSION
  };
}

export default {
  Agent,
  AgentState,
  AgentRegistry,
  CommunicationProtocol,
  MessageType,
  MessagePriority,
  MessageStatus,
  VERSION,
  FRAMEWORK_INFO,
  initializeFramework
};
