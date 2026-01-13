# ASI:One Aethel AI Integration

## Overview

This document provides comprehensive guidance for integrating ASI:One AI capabilities into the DAC Agent Framework through the `AethelAgent` class. ASI:One provides advanced AI models with natural language processing, reasoning, and multi-agent orchestration capabilities.

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Key Setup](#api-key-setup)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Model Selection](#model-selection)
- [Security Best Practices](#security-best-practices)
- [Token Usage & Costs](#token-usage--costs)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## Architecture

### Integration Design

The `AethelAgent` extends the base `Agent` class to provide AI capabilities while maintaining compatibility with the DAC agent framework:

```
┌─────────────────────────────────────────┐
│         DAC Agent Framework             │
├─────────────────────────────────────────┤
│  AgentRegistry  │  CommunicationProtocol│
├─────────────────┴─────────────────────┬─┤
│          Base Agent Class             │ │
│  (Lifecycle, Events, State)           │ │
├───────────────────────────────────────┘ │
│      ┌──────────────────────────┐       │
│      │    AethelAgent Class     │       │
│      │  - AI Query & Response   │       │
│      │  - Orchestration         │       │
│      │  - Analysis & Decisions  │       │
│      │  - History Management    │       │
│      └──────────┬───────────────┘       │
│                 │                        │
│                 ▼                        │
│      ┌──────────────────────────┐       │
│      │   ASI:One API (asi1.ai)  │       │
│      │  - asi1-mini             │       │
│      │  - asi1-fast             │       │
│      │  - asi1-extended         │       │
│      │  - asi1-*-agentic        │       │
│      └──────────────────────────┘       │
└─────────────────────────────────────────┘
```

### Key Features

- **Natural Language Processing**: Query AI with natural language prompts
- **Context-Aware**: Pass DAC and shard context for relevant responses
- **Multi-Agent Orchestration**: Coordinate multiple agents (agentic models)
- **Data Analysis**: Analyze data with AI-powered insights
- **Decision Support**: Get AI assistance for complex decisions
- **Conversation History**: Maintain context across multiple queries
- **Token Tracking**: Monitor API usage and costs
- **Rate Limiting**: Built-in protection against API rate limits
- **Event-Driven**: React to AI events in your application

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- ASI:One API key (get from [asi1.ai/dashboard](https://asi1.ai/dashboard))
- DAC Agent Framework installed

### Installation

The integration dependencies are included in the framework:

```bash
cd agents
npm install
```

Dependencies added:
- `node-fetch`: ^3.3.2 - For HTTP requests
- `dotenv`: ^16.4.1 - For environment variable management

### Quick Start

1. **Copy the environment template:**

```bash
cp .env.example .env
```

2. **Add your API key to `.env`:**

```env
ASI_ONE_API_KEY=your_actual_api_key_here
```

3. **Create and use an AethelAgent:**

```javascript
import { AethelAgent } from './core/index.js';
import { aethelConfig } from './config/aethel.config.js';

const agent = new AethelAgent({
  shardId: 'my-dac-shard',
  apiKey: aethelConfig.apiKey,
  model: aethelConfig.model
});

await agent.spawn();

const result = await agent.query(
  'What are best practices for DAC governance?'
);

console.log(result.content);
```

## API Key Setup

### Option 1: Local Development

1. Create a `.env` file in the `agents/` directory:

```bash
cp .env.example .env
```

2. Edit `.env` and add your API key:

```env
ASI_ONE_API_KEY=sk-your-actual-api-key-here
```

3. The API key is automatically loaded via `dotenv`

**Security Note**: Never commit `.env` files to version control. The `.gitignore` is pre-configured to exclude them.

### Option 2: GitHub Secrets (CI/CD)

For running tests and examples in GitHub Actions:

1. Go to your repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ASI_ONE_API_KEY`
5. Value: Your API key
6. Click **Add secret**

The GitHub Actions workflow will automatically use this secret.

### Option 3: GitHub Codespaces

For development in GitHub Codespaces:

1. Go to your repository settings
2. Navigate to **Secrets and variables** → **Codespaces**
3. Click **New repository secret**
4. Name: `ASI_ONE_API_KEY`
5. Value: Your API key
6. Click **Add secret**

The secret will be available as an environment variable in all codespaces.

### Option 4: Production Deployment

For production deployments (Vercel, Netlify, etc.):

1. Add `ASI_ONE_API_KEY` as an environment variable in your hosting platform
2. Optionally configure other `ASI_ONE_*` variables for customization
3. Ensure your deployment build includes the `agents/` directory

### Getting an API Key

1. Visit [https://asi1.ai/dashboard](https://asi1.ai/dashboard)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and secure your key immediately

## Configuration

### Environment Variables

All ASI:One configuration is managed through environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ASI_ONE_API_KEY` | ✅ Yes | - | Your ASI:One API key |
| `ASI_ONE_API_ENDPOINT` | No | `https://api.asi1.ai/v1/chat/completions` | API endpoint |
| `ASI_ONE_MODEL` | No | `asi1-agentic` | Default model to use |
| `ASI_ONE_TEMPERATURE` | No | `0.7` | Response creativity (0.0-1.0) |
| `ASI_ONE_MAX_TOKENS` | No | `2048` | Maximum tokens per response |
| `ASI_ONE_MAX_HISTORY` | No | `50` | Conversation history length |
| `ASI_ONE_MIN_REQUEST_INTERVAL` | No | `100` | Min ms between requests |
| `ASI_ONE_STREAM` | No | `false` | Enable streaming responses |
| `ASI_ONE_TIMEOUT` | No | `30000` | Request timeout (ms) |

### Configuration Module

Use the provided configuration module for consistent settings:

```javascript
import { aethelConfig, modelRecommendations } from './config/aethel.config.js';

console.log('API Key:', aethelConfig.apiKey.substring(0, 10) + '...');
console.log('Model:', aethelConfig.model);
console.log('Endpoint:', aethelConfig.endpoint);

// Get recommended model for a use case
const model = modelRecommendations['fast-orchestration'];
console.log('Recommended model:', model); // 'asi1-fast-agentic'
```

### Agent-Specific Configuration

You can override configuration per agent:

```javascript
const agent = new AethelAgent({
  shardId: 'my-shard',
  apiKey: aethelConfig.apiKey,
  model: 'asi1-fast',           // Override model
  temperature: 0.3,             // Lower temperature for focused responses
  maxTokens: 1000,              // Limit response length
  maxHistory: 20                // Shorter history for efficiency
});
```

## Usage Guide

### Basic Query

```javascript
const result = await agent.query('Explain decentralized governance');

console.log(result.content);      // AI response text
console.log(result.usage);        // Token usage stats
console.log(result.model);        // Model used
```

### Query with Context

Provide context for more relevant responses:

```javascript
const result = await agent.query(
  'What governance model should we adopt?',
  {
    systemPrompt: 'You are a DAC governance expert.',
    dacContext: {
      communitySize: 500,
      focus: 'environmental-sustainability'
    },
    shardContext: {
      region: 'asia-pacific',
      activeMembers: 350
    }
  }
);
```

### Data Analysis

```javascript
const data = {
  proposals: 45,
  votingRate: 0.67,
  treasury: '150000 ASI'
};

const analysis = await agent.analyze(
  data,
  'community-health',
  { max_tokens: 1500 }
);

console.log('Analysis:', analysis.content);
```

### Decision Support

```javascript
const options = [
  'Implement liquid democracy',
  'Use quadratic voting',
  'Adopt conviction voting'
];

const criteria = {
  priority: 'Maximize participation',
  constraints: ['Easy to understand', 'Fair representation']
};

const decision = await agent.decide(options, criteria);
console.log('Recommendation:', decision.content);
```

### Multi-Agent Orchestration

**Note**: Requires an agentic model (e.g., `asi1-agentic`)

```javascript
const agents = [
  { name: 'Researcher', capabilities: 'Data gathering' },
  { name: 'Analyst', capabilities: 'Statistical analysis' },
  { name: 'Validator', capabilities: 'Verification' }
];

const plan = await agent.orchestrate(
  'Analyze voting patterns and recommend improvements',
  agents
);

console.log('Orchestration plan:', plan.content);
```

### Inter-Agent Communication

AethelAgent can handle messages from other agents:

```javascript
// Agent A sends a message to AethelAgent
const response = await aethelAgent.handleMessage({
  type: 'ai-query',
  fromAgentId: 'agent-a-id',
  payload: {
    prompt: 'Analyze this data...',
    context: { systemPrompt: 'Be concise' }
  }
});

if (response.success) {
  console.log('AI response:', response.result.content);
}
```

### Conversation History

```javascript
// Get current history
const history = agent.getHistory();
console.log('Messages:', history.length);

// Clear history to start fresh
agent.clearHistory();

// Continue with new conversation context
```

### Event Handling

```javascript
agent.on('aethel-ready', ({ model, sessionId }) => {
  console.log(`Agent ready with model ${model}`);
});

agent.on('query-complete', ({ prompt, result }) => {
  console.log('Query completed successfully');
});

agent.on('query-error', ({ prompt, error }) => {
  console.error('Query failed:', error);
});

agent.on('token-usage', ({ usage, totalUsage }) => {
  console.log(`Tokens used: ${usage.total_tokens}`);
  console.log(`Total so far: ${totalUsage.total}`);
});
```

## Model Selection

### Available Models

| Model | Speed | Quality | Use Cases | Agentic |
|-------|-------|---------|-----------|---------|
| `asi1-mini` | ⚡⚡⚡ | ⭐⭐ | Quick queries, simple tasks | ❌ |
| `asi1-fast` | ⚡⚡ | ⭐⭐⭐ | Balanced tasks, conversations | ❌ |
| `asi1-extended` | ⚡ | ⭐⭐⭐⭐ | Deep analysis, complex reasoning | ❌ |
| `asi1-agentic` | ⚡⚡ | ⭐⭐⭐ | Agent orchestration, coordination | ✅ |
| `asi1-fast-agentic` | ⚡⚡⚡ | ⭐⭐ | Fast orchestration | ✅ |
| `asi1-extended-agentic` | ⚡ | ⭐⭐⭐⭐ | Complex multi-agent tasks | ✅ |

### Model Recommendations

```javascript
import { modelRecommendations } from './config/aethel.config.js';

// Get recommended model by use case
const model = modelRecommendations['detailed-analysis'];
// Returns: 'asi1-extended'
```

Available use cases:
- `quick-queries` → `asi1-mini`
- `fast-responses` → `asi1-fast`
- `detailed-analysis` → `asi1-extended`
- `simple-orchestration` → `asi1-agentic`
- `fast-orchestration` → `asi1-fast-agentic`
- `complex-orchestration` → `asi1-extended-agentic`
- `decision-making` → `asi1-agentic`
- `data-analysis` → `asi1-extended`
- `conversational` → `asi1-fast`

### Choosing the Right Model

**For simple queries:**
```javascript
model: 'asi1-mini'  // Fast, cost-effective
```

**For conversations:**
```javascript
model: 'asi1-fast'  // Good balance
```

**For deep analysis:**
```javascript
model: 'asi1-extended'  // Best quality
```

**For orchestration:**
```javascript
model: 'asi1-agentic'  // Multi-agent coordination
```

## Security Best Practices

### API Key Security

✅ **DO:**
- Store API keys in `.env` files (never in code)
- Use environment variables in production
- Use GitHub Secrets for CI/CD
- Rotate keys periodically
- Use different keys for dev/staging/prod

❌ **DON'T:**
- Commit `.env` files to version control
- Hardcode API keys in source code
- Share API keys in chat or email
- Use production keys in development
- Log API keys

### Rate Limiting

The `AethelAgent` includes built-in rate limiting:

```javascript
const agent = new AethelAgent({
  shardId: 'my-shard',
  apiKey: aethelConfig.apiKey,
  minRequestInterval: 100  // Minimum 100ms between requests
});
```

### Input Validation

Always validate user inputs before sending to AI:

```javascript
function sanitizePrompt(userInput) {
  // Remove potential injection attempts
  return userInput
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .substring(0, 10000);  // Limit length
}

const safePrompt = sanitizePrompt(userInput);
const result = await agent.query(safePrompt);
```

### Error Handling

Implement comprehensive error handling:

```javascript
try {
  const result = await agent.query(prompt);
  return result;
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
  } else if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('API key')) {
    // Handle auth errors
  } else {
    // General error handling
  }
  
  // Log error securely (don't log API keys)
  console.error('Query failed:', {
    message: error.message,
    agent: agent.agentId,
    model: agent.model
  });
  
  throw error;
}
```

## Token Usage & Costs

### Understanding Tokens

Tokens are units of text processed by the AI:
- ~4 characters = 1 token
- ~75 words = 100 tokens
- "Hello world" ≈ 2 tokens

### Tracking Usage

```javascript
// Get token usage
const info = agent.getInfo();
console.log('Total tokens:', info.aethel.tokenUsage.total);
console.log('Prompt tokens:', info.aethel.tokenUsage.prompt);
console.log('Completion tokens:', info.aethel.tokenUsage.completion);

// Listen to token events
agent.on('token-usage', ({ usage, totalUsage }) => {
  console.log('Request tokens:', usage.total_tokens);
  console.log('Cumulative tokens:', totalUsage.total);
});
```

### Optimizing Costs

**1. Choose the right model:**
```javascript
// For simple tasks, use mini
model: 'asi1-mini'  // Lower cost

// For complex tasks, use extended
model: 'asi1-extended'  // Higher cost, better quality
```

**2. Limit response length:**
```javascript
await agent.query(prompt, {}, {
  max_tokens: 500  // Limit response to 500 tokens
});
```

**3. Manage conversation history:**
```javascript
const agent = new AethelAgent({
  shardId: 'my-shard',
  apiKey: aethelConfig.apiKey,
  maxHistory: 10  // Keep only last 10 exchanges
});

// Or clear history when starting new topics
agent.clearHistory();
```

**4. Use temperature wisely:**
```javascript
// Lower temperature = more focused, fewer tokens wasted
temperature: 0.3  // For factual responses

// Higher temperature = more creative, may use more tokens
temperature: 0.9  // For creative tasks
```

### Rate Limiting Strategies

**1. Built-in rate limiting:**
```javascript
minRequestInterval: 100  // Wait 100ms between requests
```

**2. Batch requests:**
```javascript
// Instead of multiple small queries, combine them
const combinedPrompt = `
1. Analyze data A
2. Analyze data B  
3. Provide recommendations
`;
const result = await agent.query(combinedPrompt);
```

**3. Cache responses:**
```javascript
const cache = new Map();

async function cachedQuery(prompt) {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }
  
  const result = await agent.query(prompt);
  cache.set(prompt, result);
  return result;
}
```

## Troubleshooting

### Common Issues

#### 1. "ASI_ONE_API_KEY is required" Error

**Problem**: API key not found in environment.

**Solution**:
```bash
# Create .env file
cp .env.example .env

# Edit .env and add your key
echo "ASI_ONE_API_KEY=your-key-here" > .env
```

#### 2. "API request failed (401)" Error

**Problem**: Invalid or expired API key.

**Solution**:
- Verify your API key at [asi1.ai/dashboard](https://asi1.ai/dashboard)
- Check for extra spaces or newlines in `.env`
- Ensure key starts with correct prefix

#### 3. "API request timed out" Error

**Problem**: Request took longer than timeout setting.

**Solution**:
```javascript
const agent = new AethelAgent({
  shardId: 'my-shard',
  apiKey: aethelConfig.apiKey,
  timeout: 60000  // Increase to 60 seconds
});
```

#### 4. "Cannot orchestrate" Error

**Problem**: Trying to orchestrate with non-agentic model.

**Solution**:
```javascript
// Use an agentic model
model: 'asi1-agentic'  // or asi1-fast-agentic, asi1-extended-agentic
```

#### 5. Rate Limiting Issues

**Problem**: Too many requests too quickly.

**Solution**:
```javascript
minRequestInterval: 1000  // Increase to 1 second between requests
```

### Debug Mode

Enable detailed logging:

```javascript
agent.on('log', (entry) => {
  console.log(`[${entry.level}] ${entry.message}`, entry);
});

// Check agent logs
const logs = agent.getLogs(10, 'error');  // Last 10 error logs
console.log(logs);
```

### Network Issues

Check connectivity:

```javascript
try {
  const success = await agent.testConnection();
  console.log('Connection successful');
} catch (error) {
  console.error('Connection failed:', error.message);
  // Check network, firewall, proxy settings
}
```

## API Reference

### AethelAgent Class

#### Constructor

```javascript
new AethelAgent(config)
```

**Parameters:**
- `config.shardId` (string, required): DAC shard ID
- `config.apiKey` (string, required): ASI:One API key
- `config.endpoint` (string): API endpoint
- `config.model` (string): Model name
- `config.temperature` (number): Response creativity (0.0-1.0)
- `config.maxTokens` (number): Max tokens per response
- `config.maxHistory` (number): Conversation history length
- `config.minRequestInterval` (number): Min ms between requests
- `config.stream` (boolean): Enable streaming
- `config.timeout` (number): Request timeout (ms)

#### Methods

**`spawn()`**
Initialize and test API connection.

```javascript
await agent.spawn();
```

**`query(prompt, context, options)`**
Send a query to the AI.

```javascript
const result = await agent.query(
  'Your question here',
  { systemPrompt: '...', dacContext: {...} },
  { max_tokens: 1000 }
);
```

Returns: `{ content, executableData, intermediateSteps, usage, model }`

**`orchestrate(task, agents, options)`**
Orchestrate multiple agents (agentic models only).

```javascript
const plan = await agent.orchestrate(
  'Task description',
  [{ name: 'Agent1', capabilities: '...' }]
);
```

**`analyze(data, analysisType, options)`**
Analyze data with AI.

```javascript
const analysis = await agent.analyze(
  data,
  'community-health',
  { max_tokens: 1500 }
);
```

**`decide(options, criteria, context)`**
Get decision support.

```javascript
const decision = await agent.decide(
  ['Option 1', 'Option 2'],
  { priority: 'Cost-effectiveness' }
);
```

**`clearHistory()`**
Clear conversation history.

```javascript
agent.clearHistory();
```

**`getHistory()`**
Get conversation history.

```javascript
const history = agent.getHistory();
```

**`handleMessage(message)`**
Handle inter-agent messages.

```javascript
const response = await agent.handleMessage({
  type: 'ai-query',
  fromAgentId: '...',
  payload: { prompt: '...' }
});
```

**`testConnection()`**
Test API connectivity.

```javascript
const success = await agent.testConnection();
```

**`getInfo()`**
Get agent information including token usage.

```javascript
const info = agent.getInfo();
console.log(info.aethel.tokenUsage);
```

#### Events

- `aethel-ready`: Agent initialized and ready
- `query-complete`: Query completed successfully
- `query-error`: Query failed
- `token-usage`: Tokens consumed

## Additional Resources

- **ASI:One Documentation**: https://docs.asi1.ai
- **Getting Started**: https://docs.asi1.ai/documentation/getting-started/quickstart
- **Agentic LLM**: https://docs.asi1.ai/documentation/build-with-asi-one/agentic-llm
- **Model Selection**: https://docs.asi1.ai/documentation/getting-started/model-selection
- **API Dashboard**: https://asi1.ai/dashboard

## Support

For issues or questions:

1. Check this documentation
2. Review the example: `agents/examples/aethel-integration.js`
3. See the DAC roadmap documentation
4. Visit ASI:One documentation
5. Contact ASI:One support for API-specific issues

---

**Version**: 0.2.0  
**Last Updated**: January 2026
