# DAC Agent Framework

Core Agentic Infrastructure for Decentralized Autonomous Communities (DACs)

**Version**: 0.2.0

## Overview

This framework implements **Phase 1.1: Core Agentic Infrastructure** as defined in the DAC roadmap. It provides the foundational architecture for creating, managing, and coordinating autonomous agents within the DAC ecosystem, now with **ASI:One AI integration** for advanced AI-powered decision-making and orchestration.

## Features

### ✅ Completed (Phase 1.1.1 - Weeks 1-4)

- **Agent Architecture**: Base agent class with shard-based organization
- **Lifecycle Management**: Spawn, pause, resume, and terminate operations
- **Agent Registry**: Centralized discovery and registration system
- **Communication Protocol**: Inter-agent messaging with routing and delivery
- **Health Monitoring**: Heartbeat tracking and health check system
- **Event-Driven Design**: Extensible event system for all agent operations

### ✅ AI Integration (ASI:One Aethel)

- **Natural Language Processing**: AI-powered query and response capabilities
- **Multi-Agent Orchestration**: Coordinate multiple agents for complex tasks
- **Decision Support**: AI-assisted decision making with criteria analysis
- **Data Analysis**: Advanced data analysis with AI insights
- **Conversation History**: Context-aware conversations across queries
- **Token Usage Tracking**: Monitor and optimize API usage
- **Multiple AI Models**: Support for asi1-mini, asi1-fast, asi1-extended, and agentic variants

See [Aethel Integration Documentation](docs/AETHEL_INTEGRATION.md) for detailed information.

### 🚧 In Progress (Phase 1.1.2 - Weeks 5-7)

- **Wallet Infrastructure**: HD wallet generation and hardware wallet support
- **Self-Custody**: Secure key storage and asset management
- **Asset Tracking**: Multi-asset support (ASI, stakedASI, NFTs)

### ✅ Completed (Phase 1.1.2 - Weeks 5-6)

- **Wallet Infrastructure**: HD wallet generation with BIP-39/BIP-44
- **Simple Wallets**: Single key pair wallet support
- **Multi-sig Wallets**: Multi-signature wallet configuration
- **Key Management**: Secure encryption and key rotation
- **Asset Tracking**: Balance monitoring for multiple asset types
- **Transaction Management**: Transaction recording and status tracking
- **Asset Transfer**: Transfer protocols between wallets

## Architecture

```
agents/
├── core/
│   ├── Agent.js              # Base agent class
│   ├── AethelAgent.js        # ASI:One AI agent (NEW)
│   ├── AgentRegistry.js      # Agent discovery and registration
│   └── index.js              # Main exports
├── communication/
│   └── CommunicationProtocol.js  # Inter-agent messaging
├── config/
│   └── aethel.config.js      # ASI:One configuration (NEW)
├── custody/                  # Wallet and asset management
├── tests/                    # Test suites
├── docs/
│   ├── AETHEL_INTEGRATION.md # AI integration guide (NEW)
│   └── SECURITY_BEST_PRACTICES.md
└── examples/
    ├── basic-usage.js
    └── aethel-integration.js # AI integration example (NEW)
```

## Installation

```bash
cd agents
npm install
```

**New in v0.2.0**: ASI:One AI integration requires an API key. See [AI Integration Setup](#ai-integration-setup) below.

## AI Integration Setup

### Prerequisites

To use the ASI:One Aethel AI features, you'll need:

1. An ASI:One API key from [https://asi1.ai/dashboard](https://asi1.ai/dashboard)
2. Node.js >= 18.0.0

### Quick Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your API key to `.env`:
```env
ASI_ONE_API_KEY=your_api_key_here
```

3. Start using AI-powered agents:
```javascript
import { AethelAgent } from './core/index.js';
import { aethelConfig } from './config/aethel.config.js';

const aiAgent = new AethelAgent({
  shardId: 'my-dac-shard',
  apiKey: aethelConfig.apiKey,
  model: 'asi1-agentic'
});

await aiAgent.spawn();
const result = await aiAgent.query('Analyze governance proposals');
console.log(result.content);
```

**Full documentation**: [docs/AETHEL_INTEGRATION.md](docs/AETHEL_INTEGRATION.md)

## Quick Start

### 1. Initialize the Framework

```javascript
import { initializeFramework, Agent } from './core/index.js';

// Initialize framework with registry and protocol
const { registry, protocol } = initializeFramework({
  registry: {
    healthCheckInterval: 60000,
    maxAgentsPerShard: 1000
  },
  protocol: {
    rateLimitPerMinute: 100,
    messageTimeout: 30000
  }
});
```

### 2. Create and Register an Agent

```javascript
// Create a new agent for a DAC shard
const agent = new Agent({
  shardId: 'dac-shard-001',
  type: 'worker',
  metadata: {
    name: 'Worker Agent Alpha',
    capabilities: ['computation', 'data-processing']
  }
});

// Register with the framework
registry.register(agent);

// Spawn the agent to activate it
await agent.spawn();
```

### 3. Agent Communication

```javascript
// Create another agent
const agent2 = new Agent({
  shardId: 'dac-shard-001',
  type: 'coordinator'
});

registry.register(agent2);
await agent2.spawn();

// Send a message from agent to agent2
const response = await protocol.send({
  fromAgentId: agent.agentId,
  toAgentId: agent2.agentId,
  type: 'request',
  payload: { task: 'process-data', data: [1, 2, 3] }
});

// Listen for messages on agent2
agent2.on('message', async (message) => {
  console.log('Received message:', message);
  
  // Respond to the message
  await protocol.respond(message.messageId, {
    result: 'processed',
    output: [2, 4, 6]
  });
});
```

### 4. Broadcast to Shard

```javascript
// Broadcast a message to all agents in a shard
const result = await protocol.broadcast({
  fromAgentId: agent.agentId,
  shardId: 'dac-shard-001',
  payload: {
    announcement: 'New task available',
    priority: 'high'
  }
});

console.log(`Broadcast sent to ${result.sent} agents`);
```

### 5. Monitor Agent Health

```javascript
// Get health status of all agents
const health = registry.healthCheck();
console.log('Registry Health:', health);

// Listen for health events
registry.on('healthCheck', (results) => {
  if (results.unresponsive > 0) {
    console.warn(`${results.unresponsive} agents are unresponsive`);
  }
});

// Get agents by shard
const shardAgents = registry.getAgentsByShard('dac-shard-001');
console.log(`Shard has ${shardAgents.length} agents`);
```

## Core Concepts

### Agents

Agents are autonomous entities that:
- Belong to a specific DAC shard
- Have a unique identity (UUID)
- Maintain their own lifecycle state
- Can communicate with other agents
- Emit events for monitoring and hooks

**Agent States:**
- `initializing` - Agent is being created
- `active` - Agent is running normally
- `paused` - Agent is temporarily suspended
- `terminating` - Agent is shutting down
- `terminated` - Agent has shut down
- `error` - Agent encountered an error

### Shards

Shards are logical groupings of agents representing a DAC community:
- Each agent belongs to exactly one shard
- Shards can have multiple agents
- Inter-shard communication is supported
- Shard-level operations (broadcast, queries)

### Communication

The communication protocol provides:
- **Point-to-point messaging**: Direct agent-to-agent
- **Request-response**: Synchronous communication pattern
- **Broadcast**: One-to-many within a shard
- **Rate limiting**: Prevent message flooding
- **Message queuing**: Priority-based delivery
- **Delivery confirmation**: Track message status

**Message Types:**
- `request` - Expects a response
- `response` - Reply to a request
- `notification` - Fire-and-forget message
- `broadcast` - Message to multiple agents

## API Reference

### Agent Class

```javascript
constructor(config)
  - config.shardId: string (required)
  - config.agentId: string (optional, auto-generated)
  - config.type: string (optional)
  - config.metadata: object (optional)

Methods:
  - spawn(): Promise<void>
  - pause(): Promise<void>
  - resume(): Promise<void>
  - terminate(): Promise<void>
  - getInfo(): object
  - getUptime(): number
  - heartbeat(): void
  - isResponsive(threshold): boolean
  - getLogs(count, level): array

Events:
  - 'spawn' - Agent has spawned
  - 'pause' - Agent has paused
  - 'resume' - Agent has resumed
  - 'terminate' - Agent is terminating
  - 'stateChange' - State has changed
  - 'heartbeat' - Heartbeat sent
  - 'log' - Log entry created
  - 'message' - Message received
```

### AgentRegistry Class

```javascript
constructor(config)
  - config.healthCheckInterval: number (optional)
  - config.maxAgentsPerShard: number (optional)

Methods:
  - register(agent): boolean
  - deregister(agentId): boolean
  - getAgent(agentId): Agent|null
  - getAgentsByShard(shardId): array
  - getAgentsByType(type): array
  - getAllAgents(): array
  - getShardIds(): array
  - hasAgent(agentId): boolean
  - getStats(): object
  - healthCheck(): object
  - getUnresponsiveAgents(threshold): array
  - shutdown(): Promise<void>

Events:
  - 'register' - Agent registered
  - 'deregister' - Agent deregistered
  - 'agentStateChange' - Agent state changed
  - 'healthCheck' - Health check completed
  - 'unresponsiveAgents' - Unresponsive agents detected
```

### CommunicationProtocol Class

```javascript
constructor(config)
  - config.registry: AgentRegistry (required)
  - config.maxQueueSize: number (optional)
  - config.messageTimeout: number (optional)
  - config.rateLimitPerMinute: number (optional)

Methods:
  - send(params): Promise<object>
  - broadcast(params): Promise<object>
  - respond(messageId, payload): Promise<object>
  - getMessage(messageId): object|null
  - getMessages(agentId, filters): array
  - getQueuedMessages(agentId): array
  - getStats(): object
  - shutdown(): Promise<void>

Events:
  - 'messageSent' - Message sent
  - 'messageDelivered' - Message delivered
  - 'messageFailure' - Message failed
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run basic example
npm run example

# Run AI integration example (requires ASI_ONE_API_KEY)
npm run example:aethel
```

## Configuration

Configuration can be provided when initializing the framework:

```javascript
const config = {
  registry: {
    healthCheckInterval: 60000,      // Health check every 60 seconds
    maxAgentsPerShard: 1000          // Max 1000 agents per shard
  },
  protocol: {
    maxQueueSize: 100,               // Max 100 messages in queue
    messageTimeout: 30000,           // 30 second message timeout
    rateLimitPerMinute: 100,         // Max 100 messages per minute per agent
    enableEncryption: false          // Encryption (future feature)
  }
};

const { registry, protocol } = initializeFramework(config);
```

## Roadmap Alignment

This implementation completes the following roadmap items:

### ✅ Phase 1.1.1: Foundational Agent Architecture (Weeks 1-4)

- [x] Week 1: Architecture Design & Setup
  - [x] Agent architecture with shard-based organization
  - [x] Development environment setup
  - [x] Project repository structure
  - [x] Agent communication interfaces defined

- [x] Week 2: Core Agent Implementation
  - [x] Base agent class with shard identification
  - [x] Agent discovery mechanism
  - [x] Agent registration system
  - [x] Agent lifecycle management (spawn, pause, terminate)
  - [x] Logging and monitoring hooks

- [x] Week 3: Communication Protocol Development
  - [x] Inter-agent messaging protocol
  - [x] Message routing and delivery confirmation
  - [x] Inter-DAC communication bridge
  - [x] Rate limiting and anti-spam measures

- [x] Week 4: Testing & Documentation
  - [x] API documentation
  - [x] Developer guide
  - [x] Example usage

### 🚧 Phase 1.1.2: Self-Custody Mechanisms (Weeks 5-7) - Next Phase

## Contributing

This is part of the DAC project. See the main repository for contribution guidelines.

## License

See the main DAC repository for licensing information.

## Support

For questions or issues:
1. Check the [roadmap documentation](../roadmap_DAC_implementation_steps.md)
2. Review the [glossary](../glossary_DAC.md)
3. See the [documentation guide](../roadmap_documentation_guide.md)

---

**Phase:** 1.1 Core Agentic Infrastructure  
**Version:** 0.2.0  
**Status:** Week 1-4 Complete, Week 5-7 In Progress, AI Integration Complete  
**Last Updated:** January 2026
