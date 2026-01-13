/**
 * Example: Basic DAC Agent Framework Usage
 * 
 * Demonstrates the core functionality of the DAC Agent Framework:
 * - Creating and registering agents
 * - Agent lifecycle management
 * - Inter-agent communication
 * - Health monitoring
 */

import { initializeFramework, Agent, MessageType, MessagePriority } from '../core/index.js';

async function main() {
  console.log('=== DAC Agent Framework Example ===\n');

  // 1. Initialize the framework
  console.log('1. Initializing framework...');
  const { registry, protocol } = initializeFramework({
    registry: {
      healthCheckInterval: 10000, // 10 seconds for demo
      maxAgentsPerShard: 100
    },
    protocol: {
      rateLimitPerMinute: 50,
      messageTimeout: 5000 // 5 seconds for demo
    }
  });
  console.log('✓ Framework initialized\n');

  // 2. Create agents for a DAC shard
  console.log('2. Creating agents for DAC shard "community-001"...');
  
  const coordinatorAgent = new Agent({
    shardId: 'community-001',
    type: 'coordinator',
    metadata: {
      name: 'Coordinator Alpha',
      role: 'Task coordination and management'
    }
  });

  const workerAgent1 = new Agent({
    shardId: 'community-001',
    type: 'worker',
    metadata: {
      name: 'Worker 1',
      role: 'Data processing'
    }
  });

  console.log('✓ Created agents\n');

  // 3. Register agents with the registry
  console.log('3. Registering agents...');
  registry.register(coordinatorAgent);
  registry.register(workerAgent1);
  console.log('✓ All agents registered\n');

  // 4. Spawn (activate) agents
  console.log('4. Spawning agents...');
  await coordinatorAgent.spawn();
  await workerAgent1.spawn();
  console.log('✓ All agents spawned and active\n');

  // 5. Get agent info
  console.log('5. Agent information...');
  const info = coordinatorAgent.getInfo();
  console.log('Coordinator Info:');
  console.log(`  - Agent ID: ${info.agentId.substring(0, 8)}...`);
  console.log(`  - Shard ID: ${info.shardId}`);
  console.log(`  - Type: ${info.type}`);
  console.log(`  - State: ${info.state}`);
  console.log();

  // 6. Get registry statistics
  console.log('6. Registry statistics...');
  const stats = registry.getStats();
  console.log('Registry Stats:');
  console.log(`  - Active agents: ${stats.activeAgents}`);
  console.log(`  - Total shards: ${stats.totalShards}`);
  console.log();

  // 7. Cleanup
  console.log('7. Terminating agents...');
  await coordinatorAgent.terminate();
  await workerAgent1.terminate();
  console.log('✓ All agents terminated\n');

  await registry.shutdown();
  await protocol.shutdown();
  console.log('✓ Framework shutdown complete\n');

  console.log('=== Example completed successfully ===');
}

// Run the example
main().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
