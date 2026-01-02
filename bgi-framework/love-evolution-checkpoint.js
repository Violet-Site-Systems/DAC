/**
 * LOVE-Evolution Checkpoint Protocol - JavaScript Implementation
 * 
 * Provides collaborative decision interface triggered during uncertainty states
 * in AI/AGI decision-making processes, ensuring human veto authority and 
 * real-time intervention capability.
 * 
 * @module love-evolution-checkpoint
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const LOVE_CHECKPOINT_CONFIG = {
  uncertaintyThreshold: 0.25,
  minConfidenceForAuto: 0.75,
  enableNeurodivergentSupport: true,
  detectCircadianWindows: true,
  allowDeferral: true,
  defaultReflectionPause: 30,
  showImpactAssessment: true,
  requireRationale: true,
  detailedLogging: true,
  retentionPeriodDays: 365,
  minAlternatives: 2,
  maxAlternatives: 5,
  includeStatusQuo: true
};

// ============================================================================
// Uncertainty Calculation
// ============================================================================

/**
 * Calculate uncertainty score for a decision
 * @param {Object} decision - Decision to evaluate
 * @param {number} decision.confidence - Confidence level (0-1)
 * @param {string} decision.type - Type of decision
 * @param {Object} decision.context - Additional context
 * @returns {number} Uncertainty score (0-1, higher = more uncertain)
 */
function calculateUncertainty(decision) {
  const factors = {
    confidence: decision.confidence ?? 0.5,
    novelty: calculateNoveltyScore(decision),
    stakes: calculateStakesScore(decision),
    conflictingMetrics: calculateMetricConflictScore(decision),
    precedentLack: calculatePrecedentScore(decision)
  };
  
  const weights = {
    confidence: 0.3,
    novelty: 0.2,
    stakes: 0.25,
    conflictingMetrics: 0.15,
    precedentLack: 0.1
  };
  
  const uncertaintyScore = 
    (1 - factors.confidence) * weights.confidence +
    factors.novelty * weights.novelty +
    factors.stakes * weights.stakes +
    factors.conflictingMetrics * weights.conflictingMetrics +
    factors.precedentLack * weights.precedentLack;
  
  return Math.min(1.0, Math.max(0.0, uncertaintyScore));
}

/**
 * Calculate novelty score based on similarity to known patterns
 * @param {Object} decision - Decision to evaluate
 * @returns {number} Novelty score (0-1)
 */
function calculateNoveltyScore(decision) {
  if (!decision.context?.historicalDecisions) {
    return 0.5; // Unknown = moderate novelty
  }
  
  const similar = decision.context.historicalDecisions.filter(
    d => d.type === decision.type
  );
  
  if (similar.length === 0) return 1.0; // Completely novel
  if (similar.length > 10) return 0.1;  // Well-established pattern
  
  return 1 - (similar.length / 10);
}

/**
 * Calculate stakes score based on impact level
 * @param {Object} decision - Decision to evaluate
 * @returns {number} Stakes score (0-1)
 */
function calculateStakesScore(decision) {
  const impactLevel = decision.impact?.level ?? 'medium';
  
  const stakeMap = {
    'critical': 1.0,
    'high': 0.75,
    'medium': 0.5,
    'low': 0.25,
    'minimal': 0.1
  };
  
  return stakeMap[impactLevel] ?? 0.5;
}

/**
 * Calculate metric conflict score
 * @param {Object} decision - Decision to evaluate
 * @returns {number} Conflict score (0-1)
 */
function calculateMetricConflictScore(decision) {
  if (!decision.metrics || decision.metrics.length < 2) {
    return 0.0;
  }
  
  // Check for contradictory recommendations
  const recommendations = decision.metrics.map(m => m.recommendation);
  const uniqueRecommendations = new Set(recommendations);
  
  if (uniqueRecommendations.size === 1) return 0.0; // All agree
  if (uniqueRecommendations.size === recommendations.length) return 1.0; // All disagree
  
  return uniqueRecommendations.size / recommendations.length;
}

/**
 * Calculate precedent score
 * @param {Object} decision - Decision to evaluate
 * @returns {number} Precedent lack score (0-1)
 */
function calculatePrecedentScore(decision) {
  const hasPrecedent = decision.context?.precedent ?? false;
  const precedentRelevance = decision.context?.precedentRelevance ?? 0;
  
  if (!hasPrecedent) return 1.0;
  
  return 1 - precedentRelevance;
}

/**
 * Identify specific reasons for uncertainty
 * @param {Object} decision - Decision to evaluate
 * @param {number} uncertaintyScore - Calculated uncertainty score
 * @returns {Array<string>} Array of uncertainty reasons
 */
function identifyUncertaintyReasons(decision, uncertaintyScore) {
  const reasons = [];
  
  if (decision.confidence < 0.7) {
    reasons.push(`Low confidence level (${(decision.confidence * 100).toFixed(1)}%)`);
  }
  
  const novelty = calculateNoveltyScore(decision);
  if (novelty > 0.6) {
    reasons.push('Novel situation with limited precedent');
  }
  
  const stakes = calculateStakesScore(decision);
  if (stakes > 0.6) {
    reasons.push('High-stakes decision with significant impact');
  }
  
  const conflict = calculateMetricConflictScore(decision);
  if (conflict > 0.5) {
    reasons.push('Conflicting optimization metrics');
  }
  
  if (decision.context?.humanRequested) {
    reasons.push('Human-requested collaborative review');
  }
  
  if (reasons.length === 0) {
    reasons.push(`Uncertainty threshold exceeded (${(uncertaintyScore * 100).toFixed(1)}%)`);
  }
  
  return reasons;
}

// ============================================================================
// Neurodivergent Support
// ============================================================================

/**
 * Check if current time is in a vulnerability window
 * @param {Object} userProfile - User's neurodivergent profile
 * @returns {boolean} True if in vulnerability window
 */
function inVulnerabilityWindow(userProfile) {
  if (!userProfile?.vulnerabilityWindows) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  return userProfile.vulnerabilityWindows.some(window => {
    const [startHour, startMinute] = window.start.split(':').map(Number);
    const [endHour, endMinute] = window.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  });
}

/**
 * Calculate optimal decision windows
 * @param {Object} userProfile - User's neurodivergent profile
 * @returns {Array<Object>} Array of optimal time windows
 */
function calculateOptimalWindows(userProfile) {
  const optimalWindows = [];
  const now = new Date();
  
  // Default optimal windows if not specified
  const defaultWindows = [
    { start: '09:00', end: '11:00', label: 'Morning optimal' },
    { start: '14:00', end: '16:00', label: 'Afternoon optimal' }
  ];
  
  const windows = userProfile?.optimalWindows ?? defaultWindows;
  
  windows.forEach(window => {
    const nextWindow = new Date(now);
    const [hour, minute] = window.start.split(':').map(Number);
    
    nextWindow.setHours(hour, minute, 0, 0);
    
    // If time has passed today, suggest tomorrow
    if (nextWindow <= now) {
      nextWindow.setDate(nextWindow.getDate() + 1);
    }
    
    optimalWindows.push({
      time: nextWindow.toISOString(),
      label: window.label,
      description: `${window.start} - ${window.end}`
    });
  });
  
  return optimalWindows;
}

/**
 * Get neurodivergent UI configuration
 * @param {Object} userProfile - User's neurodivergent profile
 * @returns {Object} UI configuration object
 */
function getNeurodivergentUIConfig(userProfile) {
  if (!userProfile?.pattern) {
    return { standard: true };
  }
  
  const configs = {
    bipolar: {
      paceControl: true,
      reflectionPause: 30,
      emotionalStateCheck: true,
      circadianAwareness: true
    },
    adhd: {
      chunking: true,
      progressTracking: true,
      externalMemory: true,
      breakReminders: true
    },
    autism_spectrum: {
      explicitInstructions: true,
      visualClarifications: true,
      detailLevel: 'comprehensive',
      predictableStructure: true
    },
    dyslexia: {
      readableFont: true,
      textToSpeech: true,
      visualAids: true,
      colorCoding: true
    }
  };
  
  return configs[userProfile.pattern] ?? { standard: true };
}

// ============================================================================
// Alternative Generation
// ============================================================================

/**
 * Generate alternative approaches to a decision
 * @param {Object} decision - Original decision
 * @param {Object} config - Configuration options
 * @returns {Array<Object>} Array of alternatives
 */
function generateAlternatives(decision, config = LOVE_CHECKPOINT_CONFIG) {
  const alternatives = [];
  
  // Always include status quo if configured
  if (config.includeStatusQuo) {
    alternatives.push({
      id: 'status-quo',
      title: 'Maintain Current State',
      description: 'Continue with current approach without changes',
      impact: {
        biocentric: { score: 5, level: 'neutral', summary: 'No change to current impact' },
        social: { score: 5, level: 'neutral', summary: 'Maintains current social dynamics' },
        ethical: { score: 5, level: 'neutral', summary: 'No new ethical considerations' },
        risk: 'low',
        timeline: 'immediate'
      }
    });
  }
  
  // Generate context-specific alternatives
  if (decision.type === 'deployment' || decision.type === 'release') {
    alternatives.push(
      {
        id: 'staged-approach',
        title: 'Staged/Phased Approach',
        description: 'Implement changes gradually with monitoring at each stage',
        impact: {
          biocentric: { score: 6, level: 'positive', summary: 'Reduced risk of unintended consequences' },
          social: { score: 7, level: 'positive', summary: 'Allows for community feedback and adaptation' },
          ethical: { score: 7, level: 'positive', summary: 'More cautious, reversible approach' },
          risk: 'medium-low',
          timeline: '+50% time'
        }
      },
      {
        id: 'test-environment',
        title: 'Extended Testing',
        description: 'Deploy to test/staging environment for validation period',
        impact: {
          biocentric: { score: 8, level: 'positive', summary: 'Minimal real-world impact during validation' },
          social: { score: 6, level: 'neutral-positive', summary: 'Delays benefits but reduces risk' },
          ethical: { score: 8, level: 'positive', summary: 'Precautionary principle applied' },
          risk: 'low',
          timeline: '+1-2 days'
        }
      }
    );
  }
  
  // Add conservative alternative
  alternatives.push({
    id: 'full-review',
    title: 'Comprehensive Review',
    description: 'Conduct full audit and stakeholder consultation before proceeding',
    impact: {
      biocentric: { score: 8, level: 'positive', summary: 'Thorough impact assessment' },
      social: { score: 8, level: 'positive', summary: 'Inclusive decision-making process' },
      ethical: { score: 9, level: 'positive', summary: 'Maximum transparency and accountability' },
      risk: 'lowest',
      timeline: '+3-5 days'
    }
  });
  
  // Limit to configured maximum
  return alternatives.slice(0, config.maxAlternatives);
}

// ============================================================================
// Audit Logging
// ============================================================================

const auditLog = [];

/**
 * Generate unique audit ID
 * @returns {string} Unique audit identifier
 */
function generateAuditId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `love-checkpoint-${timestamp}-${random}`;
}

/**
 * Log checkpoint audit entry
 * @param {Object} entry - Audit entry data
 * @returns {Promise<string>} Audit entry ID
 */
async function logAuditEntry(entry) {
  const auditEntry = {
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    version: '1.0'
  };
  
  auditLog.push(auditEntry);
  
  // In production, this would write to persistent storage
  if (LOVE_CHECKPOINT_CONFIG.detailedLogging) {
    console.log('[LOVE-Checkpoint Audit]', JSON.stringify(auditEntry, null, 2));
  }
  
  return auditEntry.auditId;
}

/**
 * Retrieve audit entries
 * @param {Object} filters - Filter criteria
 * @returns {Array<Object>} Matching audit entries
 */
function getAuditEntries(filters = {}) {
  let filtered = [...auditLog];
  
  if (filters.startDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
  }
  
  if (filters.status) {
    filtered = filtered.filter(e => e.humanResponse?.status === filters.status);
  }
  
  if (filters.decisionType) {
    filtered = filtered.filter(e => e.decision?.type === filters.decisionType);
  }
  
  return filtered;
}

// ============================================================================
// Main Checkpoint Function
// ============================================================================

/**
 * Trigger a LOVE-evolution checkpoint for collaborative decision-making
 * @param {Object} params - Checkpoint parameters
 * @param {Object} params.decision - The decision being evaluated
 * @param {number} params.uncertaintyScore - Uncertainty score (0-1)
 * @param {Array<string>} params.uncertaintyReasons - Reasons for uncertainty
 * @param {Object} params.context - Additional context
 * @param {Array<Object>} params.alternatives - Alternative approaches
 * @param {Object} params.impactAssessment - Impact assessment
 * @param {boolean} params.neurodivergentSupport - Enable neurodivergent support
 * @param {boolean} params.allowDeferral - Allow deferral option
 * @param {Object} params.userProfile - User's profile for customization
 * @param {Object} params.config - Override default config
 * @returns {Promise<Object>} Checkpoint response
 */
async function loveEvolutionCheckpoint(params) {
  const config = { ...LOVE_CHECKPOINT_CONFIG, ...params.config };
  
  // Generate audit ID
  const auditId = generateAuditId();
  
  // Check for vulnerability window if neurodivergent support enabled
  if (params.neurodivergentSupport && params.userProfile) {
    if (inVulnerabilityWindow(params.userProfile)) {
      const optimalWindows = calculateOptimalWindows(params.userProfile);
      
      return {
        status: 'deferred',
        rationale: 'Circadian vulnerability window detected - deferring to optimal time',
        deferUntil: optimalWindows[0].time,
        optimalWindows: optimalWindows,
        auditId: auditId,
        timestamp: new Date().toISOString(),
        marker: '#VulnerabilityWindow'
      };
    }
  }
  
  // Prepare checkpoint data
  const checkpointData = {
    decision: params.decision,
    uncertaintyScore: params.uncertaintyScore,
    uncertaintyReasons: params.uncertaintyReasons ?? 
      identifyUncertaintyReasons(params.decision, params.uncertaintyScore),
    context: params.context,
    alternatives: params.alternatives ?? 
      generateAlternatives(params.decision, config),
    impactAssessment: params.impactAssessment,
    neurodivergentSupport: params.neurodivergentSupport,
    allowDeferral: params.allowDeferral,
    uiConfig: params.neurodivergentSupport && params.userProfile ?
      getNeurodivergentUIConfig(params.userProfile) : null,
    auditId: auditId,
    timestamp: new Date().toISOString()
  };
  
  // In a real implementation, this would display UI and await human response
  // For now, we return the checkpoint data structure
  console.log('🌱 LOVE-Evolution Checkpoint Triggered');
  console.log('How shall we evolve this with LOVE?');
  console.log('Checkpoint Data:', JSON.stringify(checkpointData, null, 2));
  
  // This would be replaced with actual UI interaction
  // For demonstration, we simulate a response structure
  return {
    checkpointData: checkpointData,
    awaitingHumanResponse: true,
    marker: '#RightsOfSapience',
    vetoAuthority: 'human'
  };
}

/**
 * Process human response to checkpoint
 * @param {Object} checkpointData - Original checkpoint data
 * @param {Object} humanResponse - Human's decision
 * @returns {Promise<Object>} Processed response with audit trail
 */
async function processCheckpointResponse(checkpointData, humanResponse) {
  // Validate response
  if (!humanResponse.status) {
    throw new Error('Response must include status field');
  }
  
  if (!humanResponse.rationale || !humanResponse.rationale.trim()) {
    throw new Error('Response must include rationale');
  }
  
  const validStatuses = ['approved', 'modified', 'vetoed', 'deferred'];
  if (!validStatuses.includes(humanResponse.status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Log audit entry
  await logAuditEntry({
    auditId: checkpointData.auditId,
    timestamp: new Date().toISOString(),
    checkpointType: 'love_evolution',
    marker: '#RightsOfSapience',
    decision: {
      id: checkpointData.decision.id,
      type: checkpointData.decision.type,
      description: checkpointData.decision.description
    },
    uncertainty: {
      score: checkpointData.uncertaintyScore,
      reasons: checkpointData.uncertaintyReasons
    },
    humanResponse: {
      status: humanResponse.status,
      rationale: humanResponse.rationale,
      selectedAlternative: humanResponse.selectedAlternative,
      modifications: humanResponse.modifications,
      timestamp: humanResponse.timestamp ?? new Date().toISOString()
    },
    alternatives: checkpointData.alternatives,
    impactAssessment: checkpointData.impactAssessment,
    neurodivergentAccommodations: checkpointData.uiConfig,
    vetoAuthority: 'human',
    enforced: true
  });
  
  // Return processed response
  return {
    ...humanResponse,
    auditId: checkpointData.auditId,
    timestamp: new Date().toISOString(),
    enforced: true
  };
}

// ============================================================================
// Exports
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Main functions
    loveEvolutionCheckpoint,
    processCheckpointResponse,
    
    // Uncertainty calculation
    calculateUncertainty,
    identifyUncertaintyReasons,
    
    // Neurodivergent support
    inVulnerabilityWindow,
    calculateOptimalWindows,
    getNeurodivergentUIConfig,
    
    // Alternative generation
    generateAlternatives,
    
    // Audit functions
    generateAuditId,
    logAuditEntry,
    getAuditEntries,
    
    // Configuration
    LOVE_CHECKPOINT_CONFIG
  };
}
