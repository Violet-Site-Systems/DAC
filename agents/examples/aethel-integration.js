/**
 * Example: ASI:One Aethel AI Integration
 * 
 * Demonstrates the integration of ASI:One AI capabilities with the DAC Agent Framework:
 * - Creating and spawning AethelAgent
 * - AI-powered queries with context
 * - Complex analysis and reasoning
 * - Decision support
 * - Agent-to-agent communication
 * - Multi-agent orchestration
 * - Conversation history management
 * - Health monitoring and token tracking
 */

import { initializeFramework, AethelAgent } from '../core/index.js';
import { aethelConfig } from '../config/aethel.config.js';

async function main() {
  console.log('=== ASI:One Aethel AI Integration Example ===\n');

  // 1. Initialize the DAC framework
  console.log('1. Initializing DAC framework...');
  const { registry, protocol } = initializeFramework({
    registry: {
      healthCheckInterval: 30000,
      maxAgentsPerShard: 100
    },
    protocol: {
      rateLimitPerMinute: 50,
      messageTimeout: 10000
    }
  });
  console.log('✓ Framework initialized\n');

  // 2. Create and spawn AethelAgent
  console.log('2. Creating Aethel AI Agent...');
  const aethelAgent = new AethelAgent({
    shardId: 'dac-community-001',
    apiKey: aethelConfig.apiKey,
    endpoint: aethelConfig.endpoint,
    model: aethelConfig.model,
    temperature: aethelConfig.temperature,
    maxTokens: aethelConfig.maxTokens,
    maxHistory: aethelConfig.maxHistory,
    minRequestInterval: aethelConfig.minRequestInterval,
    metadata: {
      name: 'Aethel AI Assistant',
      role: 'AI-powered decision support and orchestration'
    }
  });

  // Register with framework
  registry.register(aethelAgent);

  // Setup event listeners
  aethelAgent.on('aethel-ready', (data) => {
    console.log('   🤖 Aethel agent ready:', data.model);
  });

  aethelAgent.on('query-complete', (data) => {
    console.log('   ✓ Query completed');
  });

  aethelAgent.on('query-error', (data) => {
    console.error('   ✗ Query error:', data.error);
  });

  aethelAgent.on('token-usage', (data) => {
    console.log(`   📊 Tokens used - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}`);
  });

  // Spawn the agent
  await aethelAgent.spawn();
  console.log('✓ Aethel agent spawned and ready\n');

  // 3. Simple query with context
  console.log('3. Simple query with DAC context...');
  try {
    const queryResult = await aethelAgent.query(
      'What are the key considerations for governance in a decentralized autonomous community?',
      {
        systemPrompt: 'You are an expert in decentralized governance and autonomous systems.',
        dacContext: {
          communitySize: 1000,
          governanceModel: 'quadratic-voting',
          focus: 'sustainability'
        },
        shardContext: {
          shardId: 'dac-community-001',
          region: 'global',
          specialization: 'environmental-stewardship'
        }
      }
    );
    
    console.log('   Response:', queryResult.content.substring(0, 200) + '...');
    console.log('   Model:', queryResult.model);
    console.log('   Tokens:', queryResult.usage?.total_tokens || 'N/A');
    console.log('✓ Simple query completed\n');
  } catch (error) {
    console.error('✗ Simple query failed:', error.message, '\n');
  }

  // 4. Complex analysis with reasoning
  console.log('4. Complex data analysis...');
  try {
    const analysisData = {
      communityMetrics: {
        activeMembers: 850,
        proposalsThisMonth: 12,
        votingParticipation: 0.67,
        treasuryBalance: '125000 ASI'
      },
      recentActivity: [
        { type: 'proposal', outcome: 'approved', participation: 0.72 },
        { type: 'proposal', outcome: 'rejected', participation: 0.65 },
        { type: 'proposal', outcome: 'approved', participation: 0.68 }
      ]
    };

    const analysisResult = await aethelAgent.analyze(
      analysisData,
      'community-health-assessment',
      { max_tokens: 1500 }
    );

    console.log('   Analysis Type:', analysisResult.analysisType);
    console.log('   Key Findings:', analysisResult.content.substring(0, 200) + '...');
    console.log('✓ Analysis completed\n');
  } catch (error) {
    console.error('✗ Analysis failed:', error.message, '\n');
  }

  // 5. Decision making support
  console.log('5. Decision support system...');
  try {
    const options = [
      'Increase voting period from 3 to 5 days',
      'Implement reputation-weighted voting',
      'Add mandatory discussion period before voting'
    ];

    const criteria = {
      priority: 'Maximize participation while maintaining decision quality',
      constraints: ['Must be implementable within 2 weeks', 'Budget under 5000 ASI'],
      considerations: ['Technical complexity', 'Community acceptance', 'Long-term impact']
    };

    const decisionResult = await aethelAgent.decide(options, criteria, {
      dacContext: {
        currentVotingPeriod: 3,
        averageParticipation: 0.67
      }
    });

    console.log('   Decision Analysis:', decisionResult.content.substring(0, 200) + '...');
    console.log('✓ Decision support completed\n');
  } catch (error) {
    console.error('✗ Decision support failed:', error.message, '\n');
  }

  // 6. Agent-to-agent communication
  console.log('6. Inter-agent communication...');
  try {
    // Create a second agent for communication example
    const coordinatorAgent = new AethelAgent({
      shardId: 'dac-community-001',
      apiKey: aethelConfig.apiKey,
      model: 'asi1-fast',
      metadata: { name: 'Coordinator' }
    });

    registry.register(coordinatorAgent);
    await coordinatorAgent.spawn();

    // Send AI query request via protocol
    await protocol.send({
      fromAgentId: coordinatorAgent.agentId,
      toAgentId: aethelAgent.agentId,
      type: 'notification',
      payload: {
        type: 'ai-query',
        payload: {
          prompt: 'Summarize the benefits of decentralized governance in 3 key points.',
          context: { systemPrompt: 'Be concise and clear.' },
          options: { max_tokens: 200 }
        }
      }
    });

    console.log('   Message sent successfully');
    
    // Handle the message on aethel agent
    const handlerResult = await aethelAgent.handleMessage({
      type: 'ai-query',
      fromAgentId: coordinatorAgent.agentId,
      payload: {
        prompt: 'Summarize the benefits of decentralized governance in 3 key points.',
        context: { systemPrompt: 'Be concise and clear.' },
        options: { max_tokens: 200 }
      }
    });

    if (handlerResult.success) {
      console.log('   Response received:', handlerResult.result.content.substring(0, 150) + '...');
    }

    await coordinatorAgent.terminate();
    console.log('✓ Inter-agent communication completed\n');
  } catch (error) {
    console.error('✗ Inter-agent communication failed:', error.message, '\n');
  }

  // 7. Multi-agent orchestration (if using agentic model)
  if (aethelConfig.model.includes('agentic')) {
    console.log('7. Multi-agent orchestration...');
    try {
      const agents = [
        { name: 'DataAnalyst', capabilities: 'Statistical analysis and data visualization' },
        { name: 'Researcher', capabilities: 'Information gathering and synthesis' },
        { name: 'Validator', capabilities: 'Fact-checking and verification' }
      ];

      const orchestrationResult = await aethelAgent.orchestrate(
        'Analyze community voting patterns over the last 3 months and provide recommendations',
        agents,
        { max_tokens: 1000 }
      );

      console.log('   Orchestration Plan:', orchestrationResult.content.substring(0, 200) + '...');
      console.log('   Agents involved:', agents.length);
      console.log('✓ Orchestration completed\n');
    } catch (error) {
      console.error('✗ Orchestration failed:', error.message, '\n');
    }
  } else {
    console.log('7. Multi-agent orchestration (skipped - requires agentic model)\n');
  }

  // 8. Conversation history management
  console.log('8. Conversation history...');
  const history = aethelAgent.getHistory();
  console.log(`   Current history length: ${history.length} messages`);
  console.log(`   Max history: ${aethelAgent.maxHistory} messages per side`);
  
  // Clear history
  aethelAgent.clearHistory();
  console.log('   History cleared');
  console.log(`   New history length: ${aethelAgent.getHistory().length} messages`);
  console.log('✓ History management completed\n');

  // 9. Health monitoring and token usage
  console.log('9. Health monitoring...');
  const agentInfo = aethelAgent.getInfo();
  console.log('   Agent Status:');
  console.log(`     - State: ${agentInfo.state}`);
  console.log(`     - Uptime: ${Math.round(agentInfo.uptime / 1000)}s`);
  console.log(`     - Model: ${agentInfo.aethel.model}`);
  console.log(`     - Session ID: ${agentInfo.aethel.sessionId.substring(0, 8)}...`);
  console.log('   Token Usage:');
  console.log(`     - Prompt tokens: ${agentInfo.aethel.tokenUsage.prompt}`);
  console.log(`     - Completion tokens: ${agentInfo.aethel.tokenUsage.completion}`);
  console.log(`     - Total tokens: ${agentInfo.aethel.tokenUsage.total}`);
  console.log('✓ Health monitoring completed\n');

  // 10. Cleanup
  console.log('10. Cleanup...');
  await aethelAgent.terminate();
  registry.deregister(aethelAgent.agentId);
  await registry.shutdown();
  await protocol.shutdown();
  console.log('✓ All agents terminated and framework shutdown\n');

  console.log('=== Example completed successfully ===');
  console.log(`\nTotal tokens used: ${aethelAgent.tokenUsage.total}`);
}

// Run the example
main().catch(error => {
  console.error('\n❌ Example failed:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
});
