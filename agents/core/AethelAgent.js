/**
 * ASI:One Aethel AI Agent
 * 
 * Integrates ASI:One AI capabilities into the DAC agent framework.
 * Provides AI-powered decision-making, orchestration, and natural language processing.
 * 
 * API Documentation: https://docs.asi1.ai
 */

import { Agent, AgentState } from './Agent.js';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

/**
 * AethelAgent Class
 * 
 * Extends the base Agent class with ASI:One AI capabilities:
 * - Natural language query and response
 * - Multi-agent orchestration (agentic models only)
 * - Data analysis and decision support
 * - Conversation history management
 * - Token usage tracking
 */
export class AethelAgent extends Agent {
  /**
   * Create a new Aethel AI Agent
   * 
   * @param {Object} config - Agent configuration
   * @param {string} config.shardId - The DAC shard this agent belongs to
   * @param {string} config.apiKey - ASI:One API key
   * @param {string} [config.endpoint] - API endpoint (default: https://api.asi1.ai/v1/chat/completions)
   * @param {string} [config.model] - Model to use (default: asi1-agentic)
   * @param {number} [config.temperature] - Response temperature (default: 0.7)
   * @param {number} [config.maxTokens] - Max tokens per response (default: 2048)
   * @param {number} [config.maxHistory] - Max conversation history length (default: 50)
   * @param {number} [config.minRequestInterval] - Min ms between requests (default: 100)
   * @param {boolean} [config.stream] - Enable streaming (default: false)
   * @param {number} [config.timeout] - Request timeout (default: 30000)
   */
  constructor(config = {}) {
    // Validate required ASI:One config
    if (!config.apiKey) {
      throw new Error('ASI:One API key is required (config.apiKey)');
    }

    // Call parent constructor
    super({
      ...config,
      type: config.type || 'aethel-ai',
    });

    // ASI:One configuration
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.asi1.ai/v1/chat/completions';
    this.model = config.model || 'asi1-agentic';
    this.temperature = config.temperature !== undefined ? config.temperature : 0.7;
    this.maxTokens = config.maxTokens || 2048;
    this.maxHistory = config.maxHistory || 50;
    this.minRequestInterval = config.minRequestInterval || 100;
    this.stream = config.stream || false;
    this.timeout = config.timeout || 30000;

    // Conversation history
    this.conversationHistory = [];

    // Session ID for API requests
    this.sessionId = uuidv4();

    // Rate limiting
    this.lastRequestTime = 0;

    // Token usage tracking
    this.tokenUsage = {
      prompt: 0,
      completion: 0,
      total: 0,
    };

    this._log('info', 'AethelAgent initialized', {
      model: this.model,
      sessionId: this.sessionId,
    });
  }

  /**
   * Spawn the agent - Initialize and test connection
   */
  async onSpawn() {
    try {
      this._log('info', 'Testing ASI:One API connection...');
      
      // Test API connection
      await this.testConnection();
      
      this._log('info', 'ASI:One API connection successful');
      this.emit('aethel-ready', {
        agentId: this.agentId,
        model: this.model,
        sessionId: this.sessionId,
      });
    } catch (error) {
      this._log('error', 'Failed to connect to ASI:One API', { error: error.message });
      this._changeState(AgentState.ERROR);
      throw error;
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.makeApiRequest([
        {
          role: 'user',
          content: 'Hello, please respond with "Connection successful"',
        },
      ], {
        max_tokens: 50,
        temperature: 0,
      });

      return response.choices && response.choices.length > 0;
    } catch (error) {
      throw new Error(`API connection test failed: ${error.message}`);
    }
  }

  /**
   * Make an API request to ASI:One
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} [options] - Additional request options
   * @returns {Promise<Object>} API response
   */
  async makeApiRequest(messages, options = {}) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    // Build request body
    const requestBody = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : this.temperature,
      max_tokens: options.max_tokens || this.maxTokens,
      stream: options.stream !== undefined ? options.stream : this.stream,
      session_id: this.sessionId,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Track token usage
      if (data.usage) {
        this.tokenUsage.prompt += data.usage.prompt_tokens || 0;
        this.tokenUsage.completion += data.usage.completion_tokens || 0;
        this.tokenUsage.total += data.usage.total_tokens || 0;

        this.emit('token-usage', {
          agentId: this.agentId,
          usage: data.usage,
          totalUsage: this.tokenUsage,
        });
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('API request timed out');
      }
      throw error;
    }
  }

  /**
   * Query the AI with a prompt and optional context
   * @param {string} prompt - The user's query
   * @param {Object} [context] - Additional context
   * @param {string} [context.systemPrompt] - System-level instructions
   * @param {Object} [context.dacContext] - DAC-specific context
   * @param {Object} [context.shardContext] - Shard-specific context
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Response object
   */
  async query(prompt, context = {}, options = {}) {
    if (this.state !== AgentState.ACTIVE) {
      throw new Error(`Cannot query agent in ${this.state} state`);
    }

    try {
      this._log('info', 'Processing query', { promptLength: prompt.length });

      // Build messages array
      const messages = [];

      // Add system message if context provided
      if (context.systemPrompt || context.dacContext || context.shardContext) {
        messages.push(this.buildSystemMessage(context));
      }

      // Add conversation history
      messages.push(...this.conversationHistory);

      // Add current prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Make API request
      const response = await this.makeApiRequest(messages, options);

      // Validate response structure before accessing choices[0].message
      if (
        !response ||
        !Array.isArray(response.choices) ||
        response.choices.length === 0 ||
        !response.choices[0] ||
        !response.choices[0].message
      ) {
        this._log('error', 'Invalid response format from ASI:One API', { response });
        throw new Error('Invalid response format from ASI:One API: missing choices[0].message');
      }
      // Extract assistant message
      const assistantMessage = response.choices[0].message;

      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: prompt,
      });
      this.conversationHistory.push(assistantMessage);

      // Trim history if needed (multiply by 2 to account for user-assistant message pairs)
      if (this.conversationHistory.length > this.maxHistory * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
      }

      // Build result object
      const result = {
        content: assistantMessage.content,
        executableData: response.executable_data,
        intermediateSteps: response.intermediate_steps,
        usage: response.usage,
        model: response.model,
      };

      this._log('info', 'Query completed successfully');
      this.emit('query-complete', {
        agentId: this.agentId,
        prompt,
        result,
      });

      return result;
    } catch (error) {
      this._log('error', 'Query failed', { error: error.message });
      this.emit('query-error', {
        agentId: this.agentId,
        prompt,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Build system message from context
   * @param {Object} context - Context object
   * @returns {Object} System message object
   */
  buildSystemMessage(context) {
    let systemContent = '';

    if (context.systemPrompt) {
      systemContent += context.systemPrompt + '\n\n';
    }

    if (context.dacContext) {
      systemContent += 'DAC Context:\n';
      systemContent += JSON.stringify(context.dacContext, null, 2) + '\n\n';
    }

    if (context.shardContext) {
      systemContent += 'Shard Context:\n';
      systemContent += JSON.stringify(context.shardContext, null, 2) + '\n\n';
    }

    return {
      role: 'system',
      content: systemContent.trim(),
    };
  }

  /**
   * Orchestrate multiple agents (agentic models only)
   * @param {string} task - Task description
   * @param {Array} agents - Array of agent descriptions
   * @param {Object} [options] - Orchestration options
   * @returns {Promise<Object>} Orchestration result
   */
  async orchestrate(task, agents, options = {}) {
    // Import config to check if model is agentic
    const { isAgenticModel } = await import('../config/aethel.config.js');
    
    if (!isAgenticModel(this.model)) {
      throw new Error('Orchestration requires an agentic model (asi1-agentic, asi1-fast-agentic, or asi1-extended-agentic)');
    }

    if (this.state !== AgentState.ACTIVE) {
      throw new Error(`Cannot orchestrate in ${this.state} state`);
    }

    this._log('info', 'Starting orchestration', { task, agentCount: agents.length });

    const orchestrationPrompt = `
Task: ${task}

Available Agents:
${agents.map((agent, i) => `${i + 1}. ${agent.name || `Agent ${i + 1}`}: ${agent.capabilities || agent.description || 'General purpose agent'}`).join('\n')}

Please orchestrate these agents to complete the task efficiently. Provide:
1. Step-by-step execution plan
2. Agent assignments for each step
3. Expected outcomes
4. Coordination strategy
`;

    const result = await this.query(orchestrationPrompt, {
      systemPrompt: 'You are an AI orchestration expert. Create efficient, coordinated plans for multi-agent task execution.',
    }, options);

    return {
      ...result,
      task,
      agents,
    };
  }

  /**
   * Analyze data
   * @param {*} data - Data to analyze
   * @param {string} analysisType - Type of analysis
   * @param {Object} [options] - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(data, analysisType, options = {}) {
    if (this.state !== AgentState.ACTIVE) {
      throw new Error(`Cannot analyze in ${this.state} state`);
    }

    this._log('info', 'Starting analysis', { analysisType });

    const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const analysisPrompt = `
Analysis Type: ${analysisType}

Data:
${dataStr}

Please provide a comprehensive analysis including:
1. Key findings
2. Patterns and trends
3. Insights and recommendations
4. Potential issues or concerns
`;

    const result = await this.query(analysisPrompt, {
      systemPrompt: 'You are a data analysis expert. Provide thorough, accurate analysis with actionable insights.',
    }, options);

    return {
      ...result,
      analysisType,
      dataAnalyzed: data,
    };
  }

  /**
   * Make a decision based on options and criteria
   * @param {Array} options - Array of options to choose from
   * @param {Object} criteria - Decision criteria
   * @param {Object} [context] - Additional context
   * @returns {Promise<Object>} Decision result
   */
  async decide(options, criteria, context = {}) {
    if (this.state !== AgentState.ACTIVE) {
      throw new Error(`Cannot make decisions in ${this.state} state`);
    }

    this._log('info', 'Making decision', { optionCount: options.length });

    const optionsStr = options.map((opt, i) => 
      `Option ${i + 1}: ${typeof opt === 'string' ? opt : JSON.stringify(opt)}`
    ).join('\n');

    const criteriaStr = typeof criteria === 'string' ? criteria : JSON.stringify(criteria, null, 2);

    const decisionPrompt = `
Please help make a decision based on the following:

Options:
${optionsStr}

Decision Criteria:
${criteriaStr}

Please provide:
1. Recommended option with clear justification
2. Pros and cons of each option
3. Risk assessment
4. Implementation considerations
`;

    const result = await this.query(decisionPrompt, {
      systemPrompt: 'You are a decision support expert. Provide balanced, well-reasoned recommendations based on given criteria.',
      ...context,
    });

    return {
      ...result,
      options,
      criteria,
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    this._log('info', 'Conversation history cleared');
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Handle incoming messages (inter-agent communication)
   * @param {Object} message - Message object
   */
  async handleMessage(message) {
    this._log('info', 'Handling message', { type: message.type, from: message.fromAgentId });

    try {
      switch (message.type) {
        case 'ai-query':
          // Another agent is asking for AI processing
          const queryResult = await this.query(
            message.payload.prompt,
            message.payload.context,
            message.payload.options
          );
          return {
            success: true,
            result: queryResult,
          };

        case 'ai-orchestrate':
          // Another agent is requesting orchestration
          const orchestrationResult = await this.orchestrate(
            message.payload.task,
            message.payload.agents,
            message.payload.options
          );
          return {
            success: true,
            result: orchestrationResult,
          };

        case 'ai-analyze':
          // Another agent is requesting data analysis
          const analysisResult = await this.analyze(
            message.payload.data,
            message.payload.analysisType,
            message.payload.options
          );
          return {
            success: true,
            result: analysisResult,
          };

        default:
          this._log('warn', 'Unknown message type', { type: message.type });
          return {
            success: false,
            error: `Unknown message type: ${message.type}`,
          };
      }
    } catch (error) {
      this._log('error', 'Message handling failed', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Terminate the agent
   */
  async onTerminate() {
    this._log('info', 'Terminating AethelAgent', {
      totalTokens: this.tokenUsage.total,
      conversationLength: this.conversationHistory.length,
    });
  }

  /**
   * Get Aethel-specific agent info
   * @returns {Object} Extended agent info
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      aethel: {
        model: this.model,
        sessionId: this.sessionId,
        tokenUsage: this.tokenUsage,
        conversationLength: this.conversationHistory.length,
        maxHistory: this.maxHistory,
      },
    };
  }
}

export default AethelAgent;
