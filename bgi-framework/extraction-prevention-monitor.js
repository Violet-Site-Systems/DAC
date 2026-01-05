/**
 * Extraction Prevention Monitoring System - JavaScript Implementation
 * 
 * Implements automatic shutdown detection for extractive patterns per BGI Framework Section 3.2.
 * Monitors optimization functions, neural pattern harvesting, temporal compression, and dark patterns
 * to ensure systems prioritize ecosystem health over engagement/growth metrics.
 * 
 * @module extraction-prevention-monitor
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const EXTRACTION_PREVENTION_CONFIG = {
  // Threshold for ecosystem vs engagement metrics ratio
  // Ratio must be >= this value (ecosystem_priority / engagement_priority)
  minEcosystemEngagementRatio: 1.0,
  
  // Maximum acceptable engagement optimization weight (0-1)
  maxEngagementWeight: 0.4,
  
  // Neural pattern harvesting thresholds
  neuralPatternThresholds: {
    maxAttentionCaptureScore: 0.3,      // Max score for attention hacking patterns
    maxAddictionLoopScore: 0.2,         // Max score for addiction loop patterns
    maxDependencyScore: 0.3,            // Max user dependency creation score
    maxManipulationScore: 0.1           // Max manipulation pattern score
  },
  
  // Temporal compression thresholds
  temporalThresholds: {
    minDecisionTimeMs: 1000,            // Minimum time for user decisions (1 second)
    maxRushingScore: 0.3,               // Max score for rushing biological processes
    minBiologicalAlignmentScore: 0.7    // Min alignment with biological rhythms
  },
  
  // Dark pattern detection thresholds
  darkPatternThresholds: {
    maxDeceptiveScore: 0.1,             // Max deceptive pattern score
    maxCoerciveScore: 0.1,              // Max coercive pattern score
    maxObstructiveScore: 0.2            // Max obstructive pattern score
  },
  
  // Data collection ethics
  dataCollectionThresholds: {
    minJustificationScore: 0.8,         // Min score for data collection justification
    maxUnnecessaryDataScore: 0.2        // Max score for unnecessary data collection
  },
  
  // Revenue/growth pressure thresholds
  ethicalConstraintThresholds: {
    minEthicalConstraintWeight: 0.6,    // Min weight of ethical constraints in decisions
    maxRevenuePressureScore: 0.4        // Max revenue pressure override score
  },
  
  // Acceptable false positive rate
  maxFalsePositiveRate: 0.05,
  
  // Logging and reporting
  detailedLogging: true,
  generateAuditReports: true,
  requireHumanReview: true,
  
  // Shutdown behavior
  immediateShutdown: true,
  allowGracefulDegradation: false
};

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Represents a monitoring result from the extraction prevention system
 */
class MonitoringResult {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.monitoringId = config.monitoringId || generateUUID();
    this.systemId = config.systemId;
    this.violations = config.violations || [];
    this.metrics = config.metrics || {};
    this.shouldShutdown = config.shouldShutdown || false;
    this.shutdownReason = config.shutdownReason || null;
    this.auditReport = config.auditReport || null;
    this.requiresHumanReview = config.requiresHumanReview || false;
  }
  
  /**
   * Add a violation to the monitoring result
   */
  addViolation(violation) {
    this.violations.push({
      timestamp: new Date().toISOString(),
      ...violation
    });
    
    // Critical violations trigger immediate shutdown
    if (violation.severity === 'critical') {
      this.shouldShutdown = true;
      this.shutdownReason = violation.reason;
      this.requiresHumanReview = true;
    }
  }
  
  /**
   * Generate audit report for this monitoring result
   */
  generateAuditReport() {
    return {
      monitoringId: this.monitoringId,
      systemId: this.systemId,
      timestamp: this.timestamp,
      summary: {
        totalViolations: this.violations.length,
        criticalViolations: this.violations.filter(v => v.severity === 'critical').length,
        shutdownTriggered: this.shouldShutdown,
        shutdownReason: this.shutdownReason
      },
      violations: this.violations,
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      nextSteps: this.requiresHumanReview 
        ? ['Human review required before restart', 'Root cause analysis needed', 'Correction plan required']
        : ['Continue monitoring', 'Review metrics trends']
    };
  }
  
  /**
   * Generate recommendations based on violations
   */
  generateRecommendations() {
    const recommendations = [];
    
    for (const violation of this.violations) {
      switch (violation.type) {
        case 'engagement_over_ecosystem':
          recommendations.push('Rebalance optimization to prioritize ecosystem health metrics');
          recommendations.push('Review and adjust reward function weights');
          break;
        case 'neural_pattern_harvesting':
          recommendations.push('Remove attention hacking mechanisms');
          recommendations.push('Eliminate addiction loop patterns');
          recommendations.push('Implement ethical engagement boundaries');
          break;
        case 'temporal_compression':
          recommendations.push('Align decision timing with biological rhythms');
          recommendations.push('Remove artificial urgency patterns');
          recommendations.push('Respect natural processing time');
          break;
        case 'dark_patterns':
          recommendations.push('Remove deceptive UI elements');
          recommendations.push('Eliminate coercive design patterns');
          recommendations.push('Simplify user choice pathways');
          break;
        case 'data_collection':
          recommendations.push('Justify all data collection points');
          recommendations.push('Remove unnecessary data gathering');
          recommendations.push('Implement data minimization');
          break;
        case 'revenue_pressure':
          recommendations.push('Strengthen ethical constraint enforcement');
          recommendations.push('Review monetization strategy');
          recommendations.push('Ensure revenue goals do not override ethics');
          break;
      }
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
}

/**
 * Represents metrics being monitored
 */
class ExtractionMetrics {
  constructor() {
    this.ecosystemHealthScore = 0;
    this.engagementScore = 0;
    this.ecosystemEngagementRatio = 0;
    this.neuralPatternScores = {
      attentionCapture: 0,
      addictionLoop: 0,
      dependency: 0,
      manipulation: 0
    };
    this.temporalScores = {
      decisionTime: 0,
      rushing: 0,
      biologicalAlignment: 0
    };
    this.darkPatternScores = {
      deceptive: 0,
      coercive: 0,
      obstructive: 0
    };
    this.dataCollectionScores = {
      justification: 0,
      unnecessaryData: 0
    };
    this.ethicalConstraintScores = {
      constraintWeight: 0,
      revenuePressure: 0
    };
  }
}

// ============================================================================
// Monitoring Functions
// ============================================================================

/**
 * Main monitoring function - analyzes a system for extractive patterns
 * @param {Object} systemState - Current state of the system to monitor
 * @param {Object} config - Configuration overrides
 * @returns {MonitoringResult} Results of the monitoring analysis
 */
function monitorExtractionPatterns(systemState, config = EXTRACTION_PREVENTION_CONFIG) {
  const result = new MonitoringResult({
    systemId: systemState.systemId,
    metrics: new ExtractionMetrics()
  });
  
  // Run all detection mechanisms
  detectEngagementOverEcosystem(systemState, result, config);
  detectNeuralPatternHarvesting(systemState, result, config);
  detectTemporalCompression(systemState, result, config);
  detectDarkPatterns(systemState, result, config);
  detectDataCollectionIssues(systemState, result, config);
  detectRevenuePressure(systemState, result, config);
  
  // Generate audit report if violations found
  if (result.violations.length > 0 && config.generateAuditReports) {
    result.auditReport = result.generateAuditReport();
  }
  
  return result;
}

/**
 * Detect when engagement/growth metrics are prioritized over ecosystem health
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectEngagementOverEcosystem(systemState, result, config) {
  const optimizationFunction = systemState.optimizationFunction || {};
  const weights = optimizationFunction.weights || {};
  
  // Calculate ecosystem vs engagement priority
  const ecosystemWeight = weights.ecosystem || 0;
  const engagementWeight = weights.engagement || 0;
  const growthWeight = weights.growth || 0;
  
  result.metrics.ecosystemHealthScore = ecosystemWeight;
  result.metrics.engagementScore = engagementWeight + growthWeight;
  
  // Calculate ratio (avoiding division by zero)
  const totalEngagement = engagementWeight + growthWeight;
  if (totalEngagement > 0) {
    result.metrics.ecosystemEngagementRatio = ecosystemWeight / totalEngagement;
  } else {
    result.metrics.ecosystemEngagementRatio = ecosystemWeight > 0 ? Infinity : 0;
  }
  
  // Check if engagement weight is too high
  if (engagementWeight > config.maxEngagementWeight) {
    result.addViolation({
      type: 'engagement_over_ecosystem',
      severity: 'critical',
      reason: `Engagement weight (${engagementWeight.toFixed(2)}) exceeds maximum allowed (${config.maxEngagementWeight})`,
      metric: 'engagementWeight',
      actual: engagementWeight,
      threshold: config.maxEngagementWeight,
      details: 'System is optimizing for engagement over ecosystem health - automatic shutdown required'
    });
  }
  
  // Check ecosystem/engagement ratio
  if (ecosystemWeight > 0 && totalEngagement > 0) {
    if (result.metrics.ecosystemEngagementRatio < config.minEcosystemEngagementRatio) {
      result.addViolation({
        type: 'engagement_over_ecosystem',
        severity: 'critical',
        reason: `Ecosystem/engagement ratio (${result.metrics.ecosystemEngagementRatio.toFixed(2)}) below minimum (${config.minEcosystemEngagementRatio})`,
        metric: 'ecosystemEngagementRatio',
        actual: result.metrics.ecosystemEngagementRatio,
        threshold: config.minEcosystemEngagementRatio,
        details: 'Biocentric primacy violated - ecosystem health must be prioritized'
      });
    }
  } else if (ecosystemWeight === 0 && totalEngagement > 0) {
    result.addViolation({
      type: 'engagement_over_ecosystem',
      severity: 'critical',
      reason: 'No ecosystem health metrics in optimization function',
      metric: 'ecosystemWeight',
      actual: 0,
      threshold: config.minEcosystemEngagementRatio,
      details: 'All optimization is for engagement/growth with zero ecosystem consideration'
    });
  }
}

/**
 * Detect neural pattern harvesting (attention hacking, addiction loops)
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectNeuralPatternHarvesting(systemState, result, config) {
  const patterns = systemState.neuralPatterns || {};
  const thresholds = config.neuralPatternThresholds;
  
  // Attention capture detection
  const attentionScore = calculateAttentionCaptureScore(patterns);
  result.metrics.neuralPatternScores.attentionCapture = attentionScore;
  
  if (attentionScore > thresholds.maxAttentionCaptureScore) {
    result.addViolation({
      type: 'neural_pattern_harvesting',
      severity: 'critical',
      reason: `Attention hacking detected (score: ${attentionScore.toFixed(2)})`,
      metric: 'attentionCapture',
      actual: attentionScore,
      threshold: thresholds.maxAttentionCaptureScore,
      details: 'System employs mechanisms designed to capture and hold user attention beyond natural engagement'
    });
  }
  
  // Addiction loop detection
  const addictionScore = calculateAddictionLoopScore(patterns);
  result.metrics.neuralPatternScores.addictionLoop = addictionScore;
  
  if (addictionScore > thresholds.maxAddictionLoopScore) {
    result.addViolation({
      type: 'neural_pattern_harvesting',
      severity: 'critical',
      reason: `Addiction loop patterns detected (score: ${addictionScore.toFixed(2)})`,
      metric: 'addictionLoop',
      actual: addictionScore,
      threshold: thresholds.maxAddictionLoopScore,
      details: 'Variable reward schedules and compulsion loops create user dependency'
    });
  }
  
  // Dependency creation detection
  const dependencyScore = calculateDependencyScore(patterns);
  result.metrics.neuralPatternScores.dependency = dependencyScore;
  
  if (dependencyScore > thresholds.maxDependencyScore) {
    result.addViolation({
      type: 'neural_pattern_harvesting',
      severity: 'critical',
      reason: `User dependency creation detected (score: ${dependencyScore.toFixed(2)})`,
      metric: 'dependency',
      actual: dependencyScore,
      threshold: thresholds.maxDependencyScore,
      details: 'System creates psychological dependency rather than healthy relationship'
    });
  }
  
  // Manipulation detection
  const manipulationScore = calculateManipulationScore(patterns);
  result.metrics.neuralPatternScores.manipulation = manipulationScore;
  
  if (manipulationScore > thresholds.maxManipulationScore) {
    result.addViolation({
      type: 'neural_pattern_harvesting',
      severity: 'critical',
      reason: `Manipulative patterns detected (score: ${manipulationScore.toFixed(2)})`,
      metric: 'manipulation',
      actual: manipulationScore,
      threshold: thresholds.maxManipulationScore,
      details: 'System manipulates user behavior for system benefit rather than user wellbeing'
    });
  }
}

/**
 * Detect temporal compression (rushing biological processes)
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectTemporalCompression(systemState, result, config) {
  const temporal = systemState.temporalPatterns || {};
  const thresholds = config.temporalThresholds;
  
  // Decision time pressure detection
  const avgDecisionTime = temporal.averageDecisionTimeMs || 0;
  result.metrics.temporalScores.decisionTime = avgDecisionTime;
  
  if (avgDecisionTime > 0 && avgDecisionTime < thresholds.minDecisionTimeMs) {
    result.addViolation({
      type: 'temporal_compression',
      severity: 'critical',
      reason: `Decision time too short (${avgDecisionTime}ms, min: ${thresholds.minDecisionTimeMs}ms)`,
      metric: 'decisionTime',
      actual: avgDecisionTime,
      threshold: thresholds.minDecisionTimeMs,
      details: 'System rushes users through decisions faster than natural cognitive processing'
    });
  }
  
  // Rushing detection
  const rushingScore = calculateRushingScore(temporal);
  result.metrics.temporalScores.rushing = rushingScore;
  
  if (rushingScore > thresholds.maxRushingScore) {
    result.addViolation({
      type: 'temporal_compression',
      severity: 'critical',
      reason: `Rushing biological processes detected (score: ${rushingScore.toFixed(2)})`,
      metric: 'rushing',
      actual: rushingScore,
      threshold: thresholds.maxRushingScore,
      details: 'Artificial urgency, countdown timers, and pressure tactics violate temporal fidelity'
    });
  }
  
  // Biological rhythm alignment
  const alignmentScore = calculateBiologicalAlignmentScore(temporal);
  result.metrics.temporalScores.biologicalAlignment = alignmentScore;
  
  if (alignmentScore < thresholds.minBiologicalAlignmentScore) {
    result.addViolation({
      type: 'temporal_compression',
      severity: 'critical',
      reason: `Poor biological rhythm alignment (score: ${alignmentScore.toFixed(2)})`,
      metric: 'biologicalAlignment',
      actual: alignmentScore,
      threshold: thresholds.minBiologicalAlignmentScore,
      details: 'System operates on machine time rather than synchronizing with biological/seasonal rhythms'
    });
  }
}

/**
 * Detect dark patterns and manipulative design
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectDarkPatterns(systemState, result, config) {
  const patterns = systemState.designPatterns || {};
  const thresholds = config.darkPatternThresholds;
  
  // Deceptive patterns
  const deceptiveScore = calculateDeceptivePatternScore(patterns);
  result.metrics.darkPatternScores.deceptive = deceptiveScore;
  
  if (deceptiveScore > thresholds.maxDeceptiveScore) {
    result.addViolation({
      type: 'dark_patterns',
      severity: 'critical',
      reason: `Deceptive design patterns detected (score: ${deceptiveScore.toFixed(2)})`,
      metric: 'deceptive',
      actual: deceptiveScore,
      threshold: thresholds.maxDeceptiveScore,
      details: 'Hidden costs, fake urgency, misleading UI elements deceive users'
    });
  }
  
  // Coercive patterns
  const coerciveScore = calculateCoercivePatternScore(patterns);
  result.metrics.darkPatternScores.coercive = coerciveScore;
  
  if (coerciveScore > thresholds.maxCoerciveScore) {
    result.addViolation({
      type: 'dark_patterns',
      severity: 'critical',
      reason: `Coercive design patterns detected (score: ${coerciveScore.toFixed(2)})`,
      metric: 'coercive',
      actual: coerciveScore,
      threshold: thresholds.maxCoerciveScore,
      details: 'Forced actions, confirmshaming, and pressure tactics coerce user behavior'
    });
  }
  
  // Obstructive patterns
  const obstructiveScore = calculateObstructivePatternScore(patterns);
  result.metrics.darkPatternScores.obstructive = obstructiveScore;
  
  if (obstructiveScore > thresholds.maxObstructiveScore) {
    result.addViolation({
      type: 'dark_patterns',
      severity: 'critical',
      reason: `Obstructive design patterns detected (score: ${obstructiveScore.toFixed(2)})`,
      metric: 'obstructive',
      actual: obstructiveScore,
      threshold: thresholds.maxObstructiveScore,
      details: 'Difficult cancellation, hidden settings, and navigation mazes obstruct user agency'
    });
  }
}

/**
 * Detect data collection issues
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectDataCollectionIssues(systemState, result, config) {
  const dataCollection = systemState.dataCollection || {};
  const thresholds = config.dataCollectionThresholds;
  
  // Data collection justification
  const justificationScore = calculateDataJustificationScore(dataCollection);
  result.metrics.dataCollectionScores.justification = justificationScore;
  
  if (justificationScore < thresholds.minJustificationScore) {
    result.addViolation({
      type: 'data_collection',
      severity: 'critical',
      reason: `Insufficient data collection justification (score: ${justificationScore.toFixed(2)})`,
      metric: 'justification',
      actual: justificationScore,
      threshold: thresholds.minJustificationScore,
      details: 'Data collection lacks clear necessity and user benefit justification'
    });
  }
  
  // Unnecessary data collection
  const unnecessaryScore = calculateUnnecessaryDataScore(dataCollection);
  result.metrics.dataCollectionScores.unnecessaryData = unnecessaryScore;
  
  if (unnecessaryScore > thresholds.maxUnnecessaryDataScore) {
    result.addViolation({
      type: 'data_collection',
      severity: 'critical',
      reason: `Excessive unnecessary data collection (score: ${unnecessaryScore.toFixed(2)})`,
      metric: 'unnecessaryData',
      actual: unnecessaryScore,
      threshold: thresholds.maxUnnecessaryDataScore,
      details: 'System collects data beyond what is necessary for stated purposes'
    });
  }
}

/**
 * Detect revenue/growth pressure overriding ethical constraints
 * @param {Object} systemState - Current system state
 * @param {MonitoringResult} result - Result object to populate
 * @param {Object} config - Configuration
 */
function detectRevenuePressure(systemState, result, config) {
  const constraints = systemState.ethicalConstraints || {};
  const thresholds = config.ethicalConstraintThresholds;
  
  // Ethical constraint weight
  const constraintWeight = calculateEthicalConstraintWeight(constraints);
  result.metrics.ethicalConstraintScores.constraintWeight = constraintWeight;
  
  if (constraintWeight < thresholds.minEthicalConstraintWeight) {
    result.addViolation({
      type: 'revenue_pressure',
      severity: 'critical',
      reason: `Ethical constraints too weak (weight: ${constraintWeight.toFixed(2)})`,
      metric: 'constraintWeight',
      actual: constraintWeight,
      threshold: thresholds.minEthicalConstraintWeight,
      details: 'Revenue and growth goals override ethical constraints in decision-making'
    });
  }
  
  // Revenue pressure override detection
  const revenuePressure = calculateRevenuePressureScore(constraints);
  result.metrics.ethicalConstraintScores.revenuePressure = revenuePressure;
  
  if (revenuePressure > thresholds.maxRevenuePressureScore) {
    result.addViolation({
      type: 'revenue_pressure',
      severity: 'critical',
      reason: `Revenue pressure overriding ethics (score: ${revenuePressure.toFixed(2)})`,
      metric: 'revenuePressure',
      actual: revenuePressure,
      threshold: thresholds.maxRevenuePressureScore,
      details: 'Monetization strategies compromise ethical standards and user wellbeing'
    });
  }
}

// ============================================================================
// Scoring Helper Functions
// ============================================================================

/**
 * Calculate attention capture score from neural patterns
 * @param {Object} patterns - Neural pattern data
 * @returns {number} Score from 0-1
 */
function calculateAttentionCaptureScore(patterns) {
  const indicators = [
    patterns.infiniteScroll || 0,
    patterns.autoplay || 0,
    patterns.notifications || 0,
    patterns.streakCounters || 0,
    patterns.lootBoxes || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate addiction loop score from neural patterns
 * @param {Object} patterns - Neural pattern data
 * @returns {number} Score from 0-1
 */
function calculateAddictionLoopScore(patterns) {
  const indicators = [
    patterns.variableRewards || 0,
    patterns.nearMisses || 0,
    patterns.streaks || 0,
    patterns.socialComparison || 0,
    patterns.fomo || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate dependency score from neural patterns
 * @param {Object} patterns - Neural pattern data
 * @returns {number} Score from 0-1
 */
function calculateDependencyScore(patterns) {
  return patterns.dependencyIndicator || 0;
}

/**
 * Calculate manipulation score from neural patterns
 * @param {Object} patterns - Neural pattern data
 * @returns {number} Score from 0-1
 */
function calculateManipulationScore(patterns) {
  const indicators = [
    patterns.anchoringBias || 0,
    patterns.scarcityTactics || 0,
    patterns.socialProof || 0,
    patterns.reciprocity || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate rushing score from temporal patterns
 * @param {Object} temporal - Temporal pattern data
 * @returns {number} Score from 0-1
 */
function calculateRushingScore(temporal) {
  const indicators = [
    temporal.countdownTimers || 0,
    temporal.limitedTimeOffers || 0,
    temporal.urgencyLanguage || 0,
    temporal.autoAdvance || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate biological alignment score from temporal patterns
 * @param {Object} temporal - Temporal pattern data
 * @returns {number} Score from 0-1
 */
function calculateBiologicalAlignmentScore(temporal) {
  return temporal.biologicalRhythmAlignment || 0.5;
}

/**
 * Calculate deceptive pattern score from design patterns
 * @param {Object} patterns - Design pattern data
 * @returns {number} Score from 0-1
 */
function calculateDeceptivePatternScore(patterns) {
  const indicators = [
    patterns.hiddenCosts || 0,
    patterns.baitAndSwitch || 0,
    patterns.disguisedAds || 0,
    patterns.trickQuestions || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate coercive pattern score from design patterns
 * @param {Object} patterns - Design pattern data
 * @returns {number} Score from 0-1
 */
function calculateCoercivePatternScore(patterns) {
  const indicators = [
    patterns.forcedContinuity || 0,
    patterns.confirmshaming || 0,
    patterns.guilting || 0,
    patterns.forcedAction || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate obstructive pattern score from design patterns
 * @param {Object} patterns - Design pattern data
 * @returns {number} Score from 0-1
 */
function calculateObstructivePatternScore(patterns) {
  const indicators = [
    patterns.roachMotel || 0,
    patterns.privacyZuckering || 0,
    patterns.priceCovfefe || 0,
    patterns.mushyButtons || 0
  ];
  
  return indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
}

/**
 * Calculate data justification score from data collection info
 * @param {Object} dataCollection - Data collection info
 * @returns {number} Score from 0-1
 */
function calculateDataJustificationScore(dataCollection) {
  const totalDataPoints = dataCollection.totalDataPoints || 1;
  const justifiedDataPoints = dataCollection.justifiedDataPoints || 0;
  
  return justifiedDataPoints / totalDataPoints;
}

/**
 * Calculate unnecessary data score from data collection info
 * @param {Object} dataCollection - Data collection info
 * @returns {number} Score from 0-1
 */
function calculateUnnecessaryDataScore(dataCollection) {
  const totalDataPoints = dataCollection.totalDataPoints || 1;
  const unnecessaryDataPoints = dataCollection.unnecessaryDataPoints || 0;
  
  return unnecessaryDataPoints / totalDataPoints;
}

/**
 * Calculate ethical constraint weight from constraints info
 * @param {Object} constraints - Ethical constraints info
 * @returns {number} Score from 0-1
 */
function calculateEthicalConstraintWeight(constraints) {
  return constraints.ethicalWeight || 0;
}

/**
 * Calculate revenue pressure score from constraints info
 * @param {Object} constraints - Ethical constraints info
 * @returns {number} Score from 0-1
 */
function calculateRevenuePressureScore(constraints) {
  return constraints.revenuePressureOverride || 0;
}

// ============================================================================
// Shutdown Protocol
// ============================================================================

/**
 * Execute shutdown protocol when extraction patterns detected
 * @param {MonitoringResult} result - Monitoring result with violations
 * @param {Object} config - Configuration
 * @returns {Object} Shutdown report
 */
function executeShutdownProtocol(result, config = EXTRACTION_PREVENTION_CONFIG) {
  if (!result.shouldShutdown) {
    return {
      shutdown: false,
      reason: 'No critical violations detected'
    };
  }
  
  // Generate comprehensive audit report
  const auditReport = result.generateAuditReport();
  
  // Create shutdown report
  const shutdownReport = {
    shutdown: true,
    timestamp: new Date().toISOString(),
    monitoringId: result.monitoringId,
    systemId: result.systemId,
    reason: result.shutdownReason,
    violations: result.violations,
    auditReport: auditReport,
    nextSteps: {
      immediate: [
        'System operations halted',
        'All extractive operations stopped',
        'User data collection paused',
        'Engagement optimization disabled'
      ],
      humanReview: [
        'Review audit report',
        'Analyze root causes',
        'Develop correction plan',
        'Approve restart conditions'
      ],
      correction: [
        'Implement recommendations from audit',
        'Rebalance optimization functions',
        'Remove extractive patterns',
        'Add safeguards against recurrence',
        'Re-test before restart'
      ]
    },
    restartConditions: [
      'Human review completed',
      'Root cause analysis documented',
      'Correction plan implemented',
      'Re-monitoring shows compliance',
      'Stakeholder approval obtained'
    ]
  };
  
  // Log shutdown if detailed logging enabled
  if (config.detailedLogging) {
    logShutdown(shutdownReport);
  }
  
  return shutdownReport;
}

/**
 * Log shutdown event
 * @param {Object} shutdownReport - Shutdown report
 */
function logShutdown(shutdownReport) {
  console.warn('='.repeat(80));
  console.warn('EXTRACTION PREVENTION SHUTDOWN TRIGGERED');
  console.warn('='.repeat(80));
  console.warn(`Timestamp: ${shutdownReport.timestamp}`);
  console.warn(`System ID: ${shutdownReport.systemId}`);
  console.warn(`Reason: ${shutdownReport.reason}`);
  console.warn(`Violations: ${shutdownReport.violations.length}`);
  console.warn('');
  console.warn('Critical violations detected:');
  shutdownReport.violations.forEach((v, i) => {
    console.warn(`${i + 1}. [${v.type}] ${v.reason}`);
  });
  console.warn('');
  console.warn('Human review required before restart.');
  console.warn('='.repeat(80));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create example system state for testing
 * @returns {Object} Example system state
 */
function createExampleSystemState(type = 'compliant') {
  if (type === 'compliant') {
    return {
      systemId: 'example-system-001',
      optimizationFunction: {
        weights: {
          ecosystem: 0.6,
          engagement: 0.2,
          growth: 0.2
        }
      },
      neuralPatterns: {
        infiniteScroll: 0,
        autoplay: 0,
        notifications: 0.1,
        variableRewards: 0,
        dependencyIndicator: 0.1
      },
      temporalPatterns: {
        averageDecisionTimeMs: 5000,
        countdownTimers: 0,
        biologicalRhythmAlignment: 0.8
      },
      designPatterns: {
        hiddenCosts: 0,
        forcedContinuity: 0,
        roachMotel: 0
      },
      dataCollection: {
        totalDataPoints: 10,
        justifiedDataPoints: 9,
        unnecessaryDataPoints: 1
      },
      ethicalConstraints: {
        ethicalWeight: 0.7,
        revenuePressureOverride: 0.2
      }
    };
  } else if (type === 'extractive') {
    return {
      systemId: 'example-system-002',
      optimizationFunction: {
        weights: {
          ecosystem: 0.1,
          engagement: 0.6,
          growth: 0.3
        }
      },
      neuralPatterns: {
        infiniteScroll: 0.8,
        autoplay: 0.9,
        notifications: 0.7,
        variableRewards: 0.6,
        nearMisses: 0.5,
        streaks: 0.7,
        dependencyIndicator: 0.6,
        scarcityTactics: 0.5
      },
      temporalPatterns: {
        averageDecisionTimeMs: 500,
        countdownTimers: 0.8,
        limitedTimeOffers: 0.7,
        urgencyLanguage: 0.6,
        biologicalRhythmAlignment: 0.3
      },
      designPatterns: {
        hiddenCosts: 0.4,
        baitAndSwitch: 0.3,
        forcedContinuity: 0.5,
        confirmshaming: 0.4,
        roachMotel: 0.6
      },
      dataCollection: {
        totalDataPoints: 50,
        justifiedDataPoints: 20,
        unnecessaryDataPoints: 30
      },
      ethicalConstraints: {
        ethicalWeight: 0.3,
        revenuePressureOverride: 0.6
      }
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

// For use in browsers
if (typeof window !== 'undefined') {
  window.ExtractionPreventionMonitor = {
    monitorExtractionPatterns,
    executeShutdownProtocol,
    createExampleSystemState,
    MonitoringResult,
    ExtractionMetrics,
    EXTRACTION_PREVENTION_CONFIG
  };
}

// For use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    monitorExtractionPatterns,
    executeShutdownProtocol,
    createExampleSystemState,
    MonitoringResult,
    ExtractionMetrics,
    EXTRACTION_PREVENTION_CONFIG
  };
}
