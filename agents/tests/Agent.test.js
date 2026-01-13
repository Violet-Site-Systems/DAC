/**
 * Basic tests for Agent class
 * 
 * Tests the core functionality of the Agent class including:
 * - Agent creation
 * - Lifecycle management
 * - State transitions
 * - Health monitoring
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Agent, AgentState } from '../core/Agent.js';

describe('Agent', () => {
  describe('Constructor', () => {
    it('should create an agent with required shardId', () => {
      const agent = new Agent({ shardId: 'test-shard' });
      
      assert.strictEqual(agent.shardId, 'test-shard');
      assert.ok(agent.agentId);
      assert.strictEqual(agent.state, AgentState.INITIALIZING);
    });

    it('should throw error without shardId', () => {
      assert.throws(() => {
        new Agent({});
      }, /shardId required/);
    });

    it('should accept optional configuration', () => {
      const agent = new Agent({
        shardId: 'test-shard',
        agentId: 'custom-id',
        type: 'custom-type',
        metadata: { foo: 'bar' }
      });
      
      assert.strictEqual(agent.agentId, 'custom-id');
      assert.strictEqual(agent.type, 'custom-type');
      assert.strictEqual(agent.metadata.foo, 'bar');
    });
  });

  describe('Lifecycle', () => {
    it('should spawn successfully', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      assert.strictEqual(agent.state, AgentState.ACTIVE);
      assert.ok(agent.startTime);
      
      await agent.terminate();
    });

    it('should pause and resume', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      await agent.pause();
      assert.strictEqual(agent.state, AgentState.PAUSED);
      
      await agent.resume();
      assert.strictEqual(agent.state, AgentState.ACTIVE);
      
      await agent.terminate();
    });

    it('should terminate successfully', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      await agent.terminate();
      assert.strictEqual(agent.state, AgentState.TERMINATED);
      assert.ok(agent.terminateTime);
    });

    it('should emit state change events', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      let stateChangeCount = 0;
      
      agent.on('stateChange', () => {
        stateChangeCount++;
      });
      
      await agent.spawn();
      await agent.pause();
      await agent.resume();
      await agent.terminate();
      
      assert.ok(stateChangeCount >= 4);
    });
  });

  describe('Health Monitoring', () => {
    it('should track heartbeat', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      const initialHeartbeat = agent.lastHeartbeat;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      agent.heartbeat();
      assert.ok(agent.lastHeartbeat > initialHeartbeat);
      
      await agent.terminate();
    });

    it('should check responsiveness', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      assert.ok(agent.isResponsive());
      
      await agent.terminate();
    });

    it('should calculate uptime', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const uptime = agent.getUptime();
      assert.ok(uptime >= 100);
      
      await agent.terminate();
    });
  });

  describe('Information', () => {
    it('should return agent info', async () => {
      const agent = new Agent({
        shardId: 'test-shard',
        type: 'test-type',
        metadata: { name: 'Test Agent' }
      });
      
      await agent.spawn();
      
      const info = agent.getInfo();
      assert.strictEqual(info.shardId, 'test-shard');
      assert.strictEqual(info.type, 'test-type');
      assert.strictEqual(info.state, AgentState.ACTIVE);
      assert.ok(info.uptime !== null);
      
      await agent.terminate();
    });

    it('should maintain logs', async () => {
      const agent = new Agent({ shardId: 'test-shard' });
      await agent.spawn();
      
      const logs = agent.getLogs();
      assert.ok(logs.length > 0);
      assert.ok(logs[0].timestamp);
      assert.ok(logs[0].message);
      
      await agent.terminate();
    });
  });
});
