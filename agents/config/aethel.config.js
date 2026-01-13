/**
 * ASI:One Aethel AI Configuration
 * 
 * Configuration management for ASI:One API integration.
 * Loads settings from environment variables with sensible defaults.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate required configuration
 */
function validateConfig() {
  if (!process.env.ASI_ONE_API_KEY) {
    throw new Error(
      'ASI_ONE_API_KEY is required. Please set it in your .env file or environment variables.\n' +
      'Get your API key from: https://asi1.ai/dashboard'
    );
  }
}

// Validate on load
validateConfig();

/**
 * ASI:One Aethel Configuration Object
 */
export const aethelConfig = {
  apiKey: process.env.ASI_ONE_API_KEY,
  endpoint: process.env.ASI_ONE_API_ENDPOINT || 'https://api.asi1.ai/v1/chat/completions',
  model: process.env.ASI_ONE_MODEL || 'asi1-agentic',
  temperature: parseFloat(process.env.ASI_ONE_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.ASI_ONE_MAX_TOKENS || '2048', 10),
  maxHistory: parseInt(process.env.ASI_ONE_MAX_HISTORY || '50', 10),
  minRequestInterval: parseInt(process.env.ASI_ONE_MIN_REQUEST_INTERVAL || '100', 10),
  stream: process.env.ASI_ONE_STREAM === 'true',
  timeout: parseInt(process.env.ASI_ONE_TIMEOUT || '30000', 10),
};

/**
 * Model Recommendations for Different Use Cases
 * 
 * Maps use cases to recommended ASI:One models
 */
export const modelRecommendations = {
  'quick-queries': 'asi1-mini',
  'fast-responses': 'asi1-fast',
  'detailed-analysis': 'asi1-extended',
  'simple-orchestration': 'asi1-agentic',
  'fast-orchestration': 'asi1-fast-agentic',
  'complex-orchestration': 'asi1-extended-agentic',
  'decision-making': 'asi1-agentic',
  'data-analysis': 'asi1-extended',
  'conversational': 'asi1-fast',
};

/**
 * Available ASI:One Models
 */
export const availableModels = [
  'asi1-mini',
  'asi1-fast',
  'asi1-extended',
  'asi1-agentic',
  'asi1-fast-agentic',
  'asi1-extended-agentic',
];

/**
 * Check if a model supports agentic features
 * @param {string} model - Model name
 * @returns {boolean} True if model supports orchestration
 */
export function isAgenticModel(model) {
  const agenticModels = ['asi1-agentic', 'asi1-fast-agentic', 'asi1-extended-agentic'];
  return agenticModels.includes(model);
}

export default aethelConfig;
