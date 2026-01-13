/**
 * AethelAgent Tests
 * 
 * Unit tests for the ASI:One Aethel AI Agent integration
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { AethelAgent } from '../core/AethelAgent.js';
import { AgentState } from '../core/Agent.js';

// Mock node-fetch for testing
const originalFetch = globalThis.fetch;

describe('AethelAgent', () => {
  
  describe('Constructor', () => {
    
    it('should create an agent with required configuration', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-api-key'
      });
      
      assert.strictEqual(agent.shardId, 'test-shard');
      assert.strictEqual(agent.apiKey, 'test-api-key');
      assert.strictEqual(agent.model, 'asi1-agentic');
      assert.strictEqual(agent.state, AgentState.INITIALIZING);
    });
    
    it('should throw error without API key', () => {
      assert.throws(
        () => new AethelAgent({ shardId: 'test-shard' }),
        /API key is required/
      );
    });
    
    it('should throw error without shardId', () => {
      assert.throws(
        () => new AethelAgent({ apiKey: 'test-key' }),
        /shardId required/
      );
    });
    
    it('should throw error with invalid model', () => {
      assert.throws(
        () => new AethelAgent({
          shardId: 'test-shard',
          apiKey: 'test-key',
          model: 'invalid-model'
        }),
        /Invalid model/
      );
    });
    
    it('should accept valid models', () => {
      const validModels = [
        'asi1-mini',
        'asi1-fast',
        'asi1-extended',
        'asi1-agentic',
        'asi1-fast-agentic',
        'asi1-extended-agentic'
      ];
      
      validModels.forEach(model => {
        const agent = new AethelAgent({
          shardId: 'test-shard',
          apiKey: 'test-key',
          model
        });
        assert.strictEqual(agent.model, model);
      });
    });
    
    it('should accept optional configuration', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        model: 'asi1-fast',
        temperature: 0.5,
        maxTokens: 1000,
        maxHistory: 20,
        minRequestInterval: 200,
        skipConnectionTest: true
      });
      
      assert.strictEqual(agent.temperature, 0.5);
      assert.strictEqual(agent.maxTokens, 1000);
      assert.strictEqual(agent.maxHistory, 20);
      assert.strictEqual(agent.minRequestInterval, 200);
      assert.strictEqual(agent.skipConnectionTest, true);
    });
    
    it('should initialize with empty conversation history', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key'
      });
      
      assert.strictEqual(agent.conversationHistory.length, 0);
    });
    
    it('should initialize with zero token usage', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key'
      });
      
      assert.deepStrictEqual(agent.tokenUsage, {
        prompt: 0,
        completion: 0,
        total: 0
      });
    });
  });
  
  describe('Lifecycle', () => {
    
    it('should spawn successfully with skipConnectionTest', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      assert.strictEqual(agent.state, AgentState.ACTIVE);
    });
    
    it('should emit aethel-ready event on spawn', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      let eventEmitted = false;
      agent.on('aethel-ready', (data) => {
        eventEmitted = true;
        assert.strictEqual(data.agentId, agent.agentId);
        assert.strictEqual(data.model, 'asi1-agentic');
        assert.ok(data.sessionId);
      });
      
      await agent.spawn();
      assert.strictEqual(eventEmitted, true);
    });
    
    it('should terminate successfully', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      await agent.terminate();
      assert.strictEqual(agent.state, AgentState.TERMINATED);
    });
  });
  
  describe('Query Method', () => {
    
    it('should throw error if not active', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key'
      });
      
      await assert.rejects(
        agent.query('test prompt'),
        /Cannot query agent in initializing state/
      );
    });
    
    it('should validate prompt is a string', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      await assert.rejects(
        agent.query(123),
        /Prompt must be a string/
      );
    });
    
    it('should validate prompt is not empty', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      await assert.rejects(
        agent.query(''),
        /Prompt cannot be empty/
      );
    });
    
    it('should enforce maximum prompt length', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      const longPrompt = 'a'.repeat(100001);
      await assert.rejects(
        agent.query(longPrompt),
        /exceeds maximum length/
      );
    });
  });
  
  describe('Orchestrate Method', () => {
    
    it('should throw error for non-agentic models', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        model: 'asi1-fast',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      await assert.rejects(
        agent.orchestrate('test task', []),
        /Orchestration requires an agentic model/
      );
    });
    
    it('should allow orchestration for agentic models', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        model: 'asi1-agentic',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      // Should not throw on validation
      const task = 'test task';
      const agents = [{ name: 'Agent1', capabilities: 'test' }];
      
      // We expect it to fail on API call, but validation should pass
      await assert.rejects(
        agent.orchestrate(task, agents),
        (error) => {
          // Should fail on API call, not validation
          return !error.message.includes('requires an agentic model');
        }
      );
    });
  });
  
  describe('Analyze Method', () => {
    
    it('should enforce maximum data size', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      const largeData = 'x'.repeat(50001);
      await assert.rejects(
        agent.analyze(largeData, 'test-analysis'),
        /Data exceeds maximum size/
      );
    });
    
    it('should handle string data', async () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        skipConnectionTest: true
      });
      
      await agent.spawn();
      
      // Should not throw on validation, will fail on API
      await assert.rejects(
        agent.analyze('small data', 'test-analysis'),
        (error) => {
          // Should fail on API call, not validation
          return !error.message.includes('exceeds maximum size');
        }
      );
    });
  });
  
  describe('Conversation History', () => {
    
    it('should provide empty history initially', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key'
      });
      
      const history = agent.getHistory();
      assert.strictEqual(history.length, 0);
    });
    
    it('should clear history', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key'
      });
      
      // Manually add some history
      agent.conversationHistory.push({ role: 'user', content: 'test' });
      assert.strictEqual(agent.conversationHistory.length, 1);
      
      agent.clearHistory();
      assert.strictEqual(agent.conversationHistory.length, 0);
    });
  });
  
  describe('Information', () => {
    
    it('should return extended agent info', () => {
      const agent = new AethelAgent({
        shardId: 'test-shard',
        apiKey: 'test-key',
        model: 'asi1-fast'
      });
      
      const info = agent.getInfo();
      assert.ok(info.aethel);
      assert.strictEqual(info.aethel.model, 'asi1-fast');
      assert.ok(info.aethel.sessionId);
      assert.deepStrictEqual(info.aethel.tokenUsage, {
        prompt: 0,
        completion: 0,
        total: 0
      });
      assert.strictEqual(info.aethel.conversationLength, 0);
      assert.strictEqual(info.aethel.maxHistory, 50);
    });
  });
});
