/**
 * Temporal Fidelity Clock System - JavaScript Implementation
 * 
 * Implements biological and seasonal rhythm synchronization per BGI Framework Section 1.3.
 * Replaces machine-time optimization with biological/seasonal rhythm alignment.
 * Provides circadian vulnerability detection, seasonal calendars, and decision pause windows.
 * 
 * @module temporal-fidelity-clock
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const TEMPORAL_FIDELITY_CONFIG = {
  // Circadian cycle configuration
  circadian: {
    // Vulnerability windows (times when critical decisions should be blocked/flagged)
    defaultVulnerabilityWindows: [
      { start: '02:00', end: '04:00', severity: 'critical', label: 'Deep circadian low (2-4 AM)' },
      { start: '13:00', end: '15:00', severity: 'moderate', label: 'Post-lunch dip' },
      { start: '22:00', end: '23:59', severity: 'moderate', label: 'Evening fatigue' }
    ],
    // Optimal decision windows (peak cognitive performance)
    defaultOptimalWindows: [
      { start: '09:00', end: '11:00', label: 'Morning peak' },
      { start: '15:00', end: '17:00', label: 'Afternoon peak' }
    ],
    // Decision fatigue tracking
    maxDecisionsPerWindow: 10,
    decisionFatigueThreshold: 0.7,
    restPeriodMinutes: 30
  },
  
  // Seasonal/ecological calendar configuration
  seasonal: {
    // Northern hemisphere default - should be configured per bioregion
    seasons: {
      spring: { start: { month: 3, day: 20 }, end: { month: 6, day: 20 }, label: 'Spring - Renewal/Growth' },
      summer: { start: { month: 6, day: 21 }, end: { month: 9, day: 22 }, label: 'Summer - Peak Activity' },
      autumn: { start: { month: 9, day: 23 }, end: { month: 12, day: 20 }, label: 'Autumn - Harvest/Preparation' },
      winter: { start: { month: 12, day: 21 }, end: { month: 3, day: 19 }, label: 'Winter - Rest/Regeneration' }
    },
    // Seasonal influence on decision-making
    seasonalDecisionWeights: {
      spring: { growth: 1.2, risk: 1.1, planning: 1.0 },
      summer: { activity: 1.2, implementation: 1.1, maintenance: 1.0 },
      autumn: { consolidation: 1.2, preparation: 1.1, reflection: 1.1 },
      winter: { rest: 1.3, planning: 1.2, strategic: 1.1 }
    }
  },
  
  // Lunar cycle configuration
  lunar: {
    enabled: true,
    // Lunar phases and their influence (configurable per bioregion)
    phases: {
      newMoon: { influence: 'introspection', energyLevel: 0.7 },
      waxingCrescent: { influence: 'planning', energyLevel: 0.8 },
      firstQuarter: { influence: 'action', energyLevel: 0.9 },
      waxingGibbous: { influence: 'refinement', energyLevel: 1.0 },
      fullMoon: { influence: 'culmination', energyLevel: 1.1 },
      waningGibbous: { influence: 'gratitude', energyLevel: 1.0 },
      lastQuarter: { influence: 'release', energyLevel: 0.9 },
      waningCrescent: { influence: 'rest', energyLevel: 0.8 }
    },
    // Synodic month (average lunar cycle)
    synodicMonthDays: 29.53059
  },
  
  // Bioregional phenology (seasonal biological phenomena)
  phenology: {
    // Arkansas Ozarks reference implementation
    arkansasOzarks: {
      events: [
        { name: 'Spring ephemeral bloom', startMonth: 3, endMonth: 4, significance: 'high' },
        { name: 'Firefly emergence', startMonth: 5, endMonth: 6, significance: 'medium' },
        { name: 'Monarch migration south', startMonth: 9, endMonth: 10, significance: 'high' },
        { name: 'Leaf fall/dormancy', startMonth: 10, endMonth: 11, significance: 'high' }
      ]
    }
  },
  
  // Neurodivergent cognition support
  neurodivergent: {
    bipolarCycles: {
      enabled: true,
      trackMoodPhases: true,
      adjustThresholds: true
    },
    adhdPatterns: {
      enabled: true,
      timeBlindnessSupport: true,
      hyperfocusDetection: true
    },
    autismSpectrum: {
      enabled: true,
      routinePreservation: true,
      transitionSupport: true
    }
  },
  
  // Override and acknowledgment
  override: {
    allowHumanOverride: true,
    requireExplicitAck: true,
    logAllOverrides: true,
    maxOverridesPerDay: 3
  },
  
  // Anti-patterns to prevent
  antiPatterns: {
    detect24_7Pressure: true,
    detectIgnoredRest: true,
    detectMachineSpeedDecisions: true,
    detectBiologicalCompression: true
  },
  
  // Logging and reporting
  logging: {
    detailedLogging: true,
    retentionDays: 365,
    generateReports: true
  }
};

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Represents a temporal state at a given moment
 */
class TemporalState {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.circadianPhase = config.circadianPhase || null;
    this.seasonalPhase = config.seasonalPhase || null;
    this.lunarPhase = config.lunarPhase || null;
    this.phenologyEvents = config.phenologyEvents || [];
    this.vulnerabilityLevel = config.vulnerabilityLevel || 'normal';
    this.optimalForDecisions = config.optimalForDecisions || false;
    this.bioregion = config.bioregion || 'arkansasOzarks';
  }
  
  /**
   * Get human-readable summary
   */
  getSummary() {
    const parts = [];
    
    if (this.circadianPhase) {
      parts.push(`Circadian: ${this.circadianPhase.label}`);
    }
    if (this.seasonalPhase) {
      parts.push(`Season: ${this.seasonalPhase.label}`);
    }
    if (this.lunarPhase) {
      parts.push(`Lunar: ${this.lunarPhase.phase} (${this.lunarPhase.influence})`);
    }
    if (this.vulnerabilityLevel !== 'normal') {
      parts.push(`Vulnerability: ${this.vulnerabilityLevel}`);
    }
    
    return parts.join(' | ');
  }
}

/**
 * Represents a decision pause recommendation
 */
class DecisionPause {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.reason = config.reason || 'Circadian vulnerability window';
    this.severity = config.severity || 'moderate';
    this.blockDecision = config.blockDecision || false;
    this.flagOnly = config.flagOnly || true;
    this.suggestedDeferralTime = config.suggestedDeferralTime || null;
    this.overrideAllowed = config.overrideAllowed !== false;
    this.overrideRequiresAck = config.overrideRequiresAck !== false;
    this.neurodivergentContext = config.neurodivergentContext || null;
  }
  
  /**
   * Get recommendation message
   */
  getRecommendation() {
    const severity = this.severity === 'critical' ? '⚠️ CRITICAL' : '⚡ CAUTION';
    let message = `${severity}: ${this.reason}\n\n`;
    
    if (this.blockDecision) {
      message += '🚫 Critical decisions are blocked during this window.\n';
    } else {
      message += '⚡ Recommend deferring critical decisions.\n';
    }
    
    if (this.suggestedDeferralTime) {
      message += `\n💡 Suggested time: ${new Date(this.suggestedDeferralTime).toLocaleString()}\n`;
    }
    
    if (this.overrideAllowed) {
      message += '\n✋ Human override available with explicit acknowledgment.';
    }
    
    return message;
  }
}

/**
 * Represents a temporal fidelity assessment result
 */
class TemporalFidelityResult {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.assessmentId = config.assessmentId || generateUUID();
    this.temporalState = config.temporalState || null;
    this.decisionPause = config.decisionPause || null;
    this.biologicalAlignment = config.biologicalAlignment || 0.5;
    this.recommendations = config.recommendations || [];
    this.violations = config.violations || [];
    this.allowProceed = config.allowProceed !== false;
    this.ancestralAccountability = config.ancestralAccountability || null;
  }
  
  /**
   * Check if decision should proceed
   */
  shouldProceed() {
    return this.allowProceed && (!this.decisionPause || !this.decisionPause.blockDecision);
  }
  
  /**
   * Get detailed assessment summary
   */
  getAssessmentSummary() {
    const summary = {
      timestamp: this.timestamp,
      temporalState: this.temporalState?.getSummary(),
      biologicalAlignment: this.biologicalAlignment,
      shouldProceed: this.shouldProceed(),
      pauseRecommendation: this.decisionPause?.getRecommendation(),
      recommendations: this.recommendations,
      violations: this.violations
    };
    
    return summary;
  }
}

// ============================================================================
// Circadian Rhythm Functions
// ============================================================================

/**
 * Get current circadian phase based on time of day
 * @param {Date} datetime - Time to evaluate
 * @param {Object} userProfile - Optional user profile with custom windows
 * @param {Object} config - Configuration options
 * @returns {Object} Circadian phase information
 */
function getCircadianPhase(datetime = new Date(), userProfile = null, config = TEMPORAL_FIDELITY_CONFIG) {
  const hour = datetime.getHours();
  const minute = datetime.getMinutes();
  const currentTime = hour * 60 + minute;
  
  // Check for vulnerability windows
  const vulnerabilityWindows = userProfile?.vulnerabilityWindows || config.circadian.defaultVulnerabilityWindows;
  
  for (const window of vulnerabilityWindows) {
    if (isTimeInWindow(currentTime, window.start, window.end)) {
      return {
        phase: 'vulnerability',
        severity: window.severity,
        label: window.label,
        isOptimal: false,
        isVulnerable: true,
        window: window
      };
    }
  }
  
  // Check for optimal windows
  const optimalWindows = userProfile?.optimalWindows || config.circadian.defaultOptimalWindows;
  
  for (const window of optimalWindows) {
    if (isTimeInWindow(currentTime, window.start, window.end)) {
      return {
        phase: 'optimal',
        severity: 'none',
        label: window.label,
        isOptimal: true,
        isVulnerable: false,
        window: window
      };
    }
  }
  
  // Default phase
  return {
    phase: 'normal',
    severity: 'none',
    label: 'Normal activity period',
    isOptimal: false,
    isVulnerable: false,
    window: null
  };
}

/**
 * Check if current time is in a given window
 * @param {number} currentTime - Current time in minutes from midnight
 * @param {string} startStr - Start time string (HH:MM)
 * @param {string} endStr - End time string (HH:MM)
 * @returns {boolean} True if in window
 */
function isTimeInWindow(currentTime, startStr, endStr) {
  const [startHour, startMinute] = startStr.split(':').map(Number);
  const [endHour, endMinute] = endStr.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  if (startTime <= endTime) {
    // Window doesn't cross midnight
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Window crosses midnight
    return currentTime >= startTime || currentTime <= endTime;
  }
}

/**
 * Detect decision fatigue based on recent decision history
 * @param {Array} recentDecisions - Array of recent decisions with timestamps
 * @param {Object} config - Configuration options
 * @returns {Object} Decision fatigue assessment
 */
function detectDecisionFatigue(recentDecisions, config = TEMPORAL_FIDELITY_CONFIG) {
  if (!recentDecisions || recentDecisions.length === 0) {
    return {
      fatigued: false,
      fatigueLevel: 0,
      decisionsInWindow: 0,
      recommendRest: false
    };
  }
  
  const now = new Date();
  const windowMs = config.circadian.restPeriodMinutes * 60 * 1000;
  const windowStart = new Date(now.getTime() - windowMs);
  
  // Count decisions in current window
  const decisionsInWindow = recentDecisions.filter(d => {
    const decisionTime = new Date(d.timestamp);
    return decisionTime >= windowStart && decisionTime <= now;
  }).length;
  
  const fatigueLevel = decisionsInWindow / config.circadian.maxDecisionsPerWindow;
  const fatigued = fatigueLevel >= config.circadian.decisionFatigueThreshold;
  
  return {
    fatigued,
    fatigueLevel: Math.min(1.0, fatigueLevel),
    decisionsInWindow,
    recommendRest: fatigued,
    restUntil: fatigued ? new Date(now.getTime() + windowMs) : null
  };
}

// ============================================================================
// Seasonal Calendar Functions
// ============================================================================

/**
 * Get current seasonal phase
 * @param {Date} datetime - Date to evaluate
 * @param {string} hemisphere - 'northern' or 'southern'
 * @param {Object} config - Configuration options
 * @returns {Object} Seasonal phase information
 */
function getSeasonalPhase(datetime = new Date(), hemisphere = 'northern', config = TEMPORAL_FIDELITY_CONFIG) {
  const month = datetime.getMonth() + 1; // 1-12
  const day = datetime.getDate();
  
  let seasons = config.seasonal.seasons;
  
  // Flip seasons for southern hemisphere
  if (hemisphere === 'southern') {
    seasons = {
      spring: config.seasonal.seasons.autumn,
      summer: config.seasonal.seasons.winter,
      autumn: config.seasonal.seasons.spring,
      winter: config.seasonal.seasons.summer
    };
  }
  
  // Determine current season
  for (const [seasonName, season] of Object.entries(seasons)) {
    if (isDateInSeason(month, day, season)) {
      return {
        season: seasonName,
        label: season.label,
        weights: config.seasonal.seasonalDecisionWeights[seasonName],
        hemisphere
      };
    }
  }
  
  // Default to spring if no match
  return {
    season: 'spring',
    label: seasons.spring.label,
    weights: config.seasonal.seasonalDecisionWeights.spring,
    hemisphere
  };
}

/**
 * Check if date falls within a season
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @param {Object} season - Season definition with start/end
 * @returns {boolean} True if in season
 */
function isDateInSeason(month, day, season) {
  const start = season.start;
  const end = season.end;
  
  const currentDate = month * 100 + day;
  const startDate = start.month * 100 + start.day;
  const endDate = end.month * 100 + end.day;
  
  if (startDate <= endDate) {
    // Season doesn't cross year boundary
    return currentDate >= startDate && currentDate <= endDate;
  } else {
    // Season crosses year boundary (e.g., winter)
    return currentDate >= startDate || currentDate <= endDate;
  }
}

/**
 * Get active phenology events for current date/bioregion
 * @param {Date} datetime - Date to evaluate
 * @param {string} bioregion - Bioregion identifier
 * @param {Object} config - Configuration options
 * @returns {Array} Array of active phenology events
 */
function getActivePhenologyEvents(datetime = new Date(), bioregion = 'arkansasOzarks', config = TEMPORAL_FIDELITY_CONFIG) {
  const month = datetime.getMonth() + 1; // 1-12
  
  const bioregionData = config.phenology[bioregion];
  if (!bioregionData || !bioregionData.events) {
    return [];
  }
  
  return bioregionData.events.filter(event => {
    return month >= event.startMonth && month <= event.endMonth;
  });
}

// ============================================================================
// Lunar Cycle Functions
// ============================================================================

/**
 * Calculate current lunar phase
 * @param {Date} datetime - Date to evaluate
 * @param {Object} config - Configuration options
 * @returns {Object} Lunar phase information
 */
function getLunarPhase(datetime = new Date(), config = TEMPORAL_FIDELITY_CONFIG) {
  if (!config.lunar.enabled) {
    return null;
  }
  
  // Calculate lunar age (days since new moon)
  // Using a known new moon as reference: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSinceKnownNewMoon = (datetime.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceKnownNewMoon % config.lunar.synodicMonthDays;
  
  // Determine phase based on lunar age
  let phaseName, phaseEmoji;
  
  if (lunarAge < 1.84566) {
    phaseName = 'newMoon';
    phaseEmoji = '🌑';
  } else if (lunarAge < 7.38264) {
    phaseName = 'waxingCrescent';
    phaseEmoji = '🌒';
  } else if (lunarAge < 9.22830) {
    phaseName = 'firstQuarter';
    phaseEmoji = '🌓';
  } else if (lunarAge < 14.76529) {
    phaseName = 'waxingGibbous';
    phaseEmoji = '🌔';
  } else if (lunarAge < 16.61096) {
    phaseName = 'fullMoon';
    phaseEmoji = '🌕';
  } else if (lunarAge < 22.14794) {
    phaseName = 'waningGibbous';
    phaseEmoji = '🌖';
  } else if (lunarAge < 23.99361) {
    phaseName = 'lastQuarter';
    phaseEmoji = '🌗';
  } else {
    phaseName = 'waningCrescent';
    phaseEmoji = '🌘';
  }
  
  const phaseData = config.lunar.phases[phaseName];
  
  return {
    phase: phaseName,
    emoji: phaseEmoji,
    age: lunarAge,
    influence: phaseData.influence,
    energyLevel: phaseData.energyLevel,
    label: `${phaseEmoji} ${phaseName.replace(/([A-Z])/g, ' $1').trim()}`
  };
}

// ============================================================================
// Decision Pause System
// ============================================================================

/**
 * Evaluate if a decision should be paused based on temporal factors
 * @param {Object} decision - Decision to evaluate
 * @param {Object} userProfile - User profile with neurodivergent patterns
 * @param {Array} recentDecisions - Recent decision history
 * @param {Object} config - Configuration options
 * @returns {DecisionPause|null} Decision pause if needed, null otherwise
 */
function evaluateDecisionPause(decision, userProfile = null, recentDecisions = [], config = TEMPORAL_FIDELITY_CONFIG) {
  const now = new Date();
  const circadianPhase = getCircadianPhase(now, userProfile, config);
  const fatigueAssessment = detectDecisionFatigue(recentDecisions, config);
  
  // Check circadian vulnerability
  if (circadianPhase.isVulnerable) {
    const blockCritical = circadianPhase.severity === 'critical' && decision.criticality === 'high';
    
    // Find next optimal window
    const optimalWindows = userProfile?.optimalWindows || config.circadian.defaultOptimalWindows;
    const suggestedTime = findNextOptimalWindow(now, optimalWindows);
    
    return new DecisionPause({
      reason: `${circadianPhase.label} - cognitive performance degraded`,
      severity: circadianPhase.severity,
      blockDecision: blockCritical,
      flagOnly: !blockCritical,
      suggestedDeferralTime: suggestedTime,
      overrideAllowed: true,
      overrideRequiresAck: true,
      neurodivergentContext: userProfile?.pattern ? {
        pattern: userProfile.pattern,
        customWindows: true
      } : null
    });
  }
  
  // Check decision fatigue
  if (fatigueAssessment.fatigued) {
    return new DecisionPause({
      reason: `Decision fatigue detected (${fatigueAssessment.decisionsInWindow} decisions in recent window)`,
      severity: 'moderate',
      blockDecision: false,
      flagOnly: true,
      suggestedDeferralTime: fatigueAssessment.restUntil,
      overrideAllowed: true,
      overrideRequiresAck: true
    });
  }
  
  // Check neurodivergent-specific patterns
  if (userProfile?.pattern === 'bipolar' && userProfile.currentMoodPhase) {
    if (userProfile.currentMoodPhase === 'manic' && decision.type === 'financial') {
      return new DecisionPause({
        reason: 'Manic phase detected - recommend deferring financial decisions',
        severity: 'moderate',
        blockDecision: false,
        flagOnly: true,
        suggestedDeferralTime: findNextOptimalWindow(now, config.circadian.defaultOptimalWindows),
        overrideAllowed: true,
        overrideRequiresAck: true,
        neurodivergentContext: {
          pattern: 'bipolar',
          phase: userProfile.currentMoodPhase,
          recommendation: 'Consult with support person before proceeding'
        }
      });
    }
  }
  
  return null;
}

/**
 * Find next optimal decision window
 * @param {Date} fromTime - Starting time
 * @param {Array} optimalWindows - Array of optimal window definitions
 * @returns {Date} Next optimal window start time
 */
function findNextOptimalWindow(fromTime, optimalWindows) {
  const now = fromTime;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Find next window today
  for (const window of optimalWindows) {
    const [hour, minute] = window.start.split(':').map(Number);
    const windowTime = hour * 60 + minute;
    
    if (windowTime > currentTime) {
      const nextWindow = new Date(now);
      nextWindow.setHours(hour, minute, 0, 0);
      return nextWindow;
    }
  }
  
  // No window today, return first window tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [hour, minute] = optimalWindows[0].start.split(':').map(Number);
  tomorrow.setHours(hour, minute, 0, 0);
  return tomorrow;
}

// ============================================================================
// Ancestral Accountability
// ============================================================================

/**
 * Create ancestral accountability record for a decision
 * @param {Object} decision - Decision being made
 * @param {Object} temporalState - Current temporal state
 * @param {Object} config - Configuration options
 * @returns {Object} Ancestral accountability record
 */
function createAncestralAccountability(decision, temporalState, config = TEMPORAL_FIDELITY_CONFIG) {
  const record = {
    decisionId: decision.id || generateUUID(),
    timestamp: new Date().toISOString(),
    temporalContext: {
      circadian: temporalState.circadianPhase,
      seasonal: temporalState.seasonalPhase,
      lunar: temporalState.lunarPhase,
      phenology: temporalState.phenologyEvents
    },
    seasonalImpacts: assessSeasonalImpacts(decision, temporalState),
    longTermAlignment: assessLongTermRhythmAlignment(decision, temporalState),
    ecologicalConsequences: [],
    trackedFor: '7 generations (~200 years)',
    reviewSchedule: generateReviewSchedule(decision)
  };
  
  return record;
}

/**
 * Assess seasonal impacts of a decision
 * @param {Object} decision - Decision being made
 * @param {Object} temporalState - Current temporal state
 * @returns {Object} Seasonal impact assessment
 */
function assessSeasonalImpacts(decision, temporalState) {
  const season = temporalState.seasonalPhase?.season || 'unknown';
  const impacts = {
    currentSeason: season,
    alignment: 0.5,
    considerations: []
  };
  
  // Check if decision aligns with seasonal energy
  if (season === 'spring' && decision.type === 'growth') {
    impacts.alignment = 0.9;
    impacts.considerations.push('Aligns with spring growth energy');
  } else if (season === 'winter' && decision.type === 'growth') {
    impacts.alignment = 0.3;
    impacts.considerations.push('Counter to winter rest/regeneration - consider deferring to spring');
  } else if (season === 'autumn' && decision.type === 'harvest') {
    impacts.alignment = 0.9;
    impacts.considerations.push('Aligns with autumn harvest/consolidation energy');
  } else if (season === 'summer' && decision.type === 'implementation') {
    impacts.alignment = 0.9;
    impacts.considerations.push('Aligns with summer peak activity');
  }
  
  // Check phenology events
  if (temporalState.phenologyEvents && temporalState.phenologyEvents.length > 0) {
    temporalState.phenologyEvents.forEach(event => {
      if (event.significance === 'high') {
        impacts.considerations.push(`Active phenology: ${event.name}`);
      }
    });
  }
  
  return impacts;
}

/**
 * Assess long-term ecological rhythm alignment
 * @param {Object} decision - Decision being made
 * @param {Object} temporalState - Current temporal state
 * @returns {Object} Long-term alignment assessment
 */
function assessLongTermRhythmAlignment(decision, temporalState) {
  const alignment = {
    score: 0.5,
    factors: [],
    risks: [],
    mitigations: []
  };
  
  // Check for temporal compression (rushing biological processes)
  if (decision.timeline && decision.timeline.compressed) {
    alignment.score -= 0.3;
    alignment.risks.push('Temporal compression detected - rushing biological processes');
    alignment.mitigations.push('Extend timeline to align with natural rhythms');
  }
  
  // Check for 24/7 pressure patterns
  if (decision.requiresContinuousOperation) {
    alignment.score -= 0.2;
    alignment.risks.push('24/7 operation violates rest/regeneration cycles');
    alignment.mitigations.push('Implement rest periods and seasonal maintenance windows');
  }
  
  // Check for multi-generational impacts
  if (decision.impactDuration && decision.impactDuration.years > 25) {
    alignment.factors.push('Multi-generational impact - requires intergenerational audit');
  }
  
  return alignment;
}

/**
 * Generate review schedule for long-term tracking
 * @param {Object} decision - Decision being tracked
 * @returns {Array} Array of scheduled review dates
 */
function generateReviewSchedule(decision) {
  const now = new Date();
  const schedule = [];
  
  // Immediate follow-up (1 year)
  schedule.push({
    date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
    horizon: 'immediate',
    purpose: 'Verify implementation and immediate impacts'
  });
  
  // Near-term review (5 years)
  schedule.push({
    date: new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()).toISOString(),
    horizon: 'nearTerm',
    purpose: 'Assess early ecological consequences'
  });
  
  // Medium-term review (25 years - 1 generation)
  schedule.push({
    date: new Date(now.getFullYear() + 25, now.getMonth(), now.getDate()).toISOString(),
    horizon: 'mediumTerm',
    purpose: 'First generational review'
  });
  
  // Long-term review (50 years - 2 generations)
  schedule.push({
    date: new Date(now.getFullYear() + 50, now.getMonth(), now.getDate()).toISOString(),
    horizon: 'longTerm',
    purpose: 'Second generational review'
  });
  
  // Deep time review (200 years - 7 generations)
  schedule.push({
    date: new Date(now.getFullYear() + 200, now.getMonth(), now.getDate()).toISOString(),
    horizon: 'deepTime',
    purpose: 'Seventh generational audit'
  });
  
  return schedule;
}

// ============================================================================
// Anti-Pattern Detection
// ============================================================================

/**
 * Detect anti-patterns that violate temporal fidelity
 * @param {Object} systemState - Current system state
 * @param {Object} config - Configuration options
 * @returns {Array} Array of detected violations
 */
function detectAntiPatterns(systemState, config = TEMPORAL_FIDELITY_CONFIG) {
  const violations = [];
  
  if (!config.antiPatterns) {
    return violations;
  }
  
  // Detect 24/7 always-on pressure
  if (config.antiPatterns.detect24_7Pressure && systemState.continuousOperationHours > 24) {
    violations.push({
      type: 'always_on_pressure',
      severity: 'high',
      description: '24/7 operation detected - violates rest/regeneration cycles',
      recommendation: 'Implement scheduled rest periods and maintenance windows',
      timestamp: new Date().toISOString()
    });
  }
  
  // Detect ignored rest cycles
  if (config.antiPatterns.detectIgnoredRest && systemState.lastRestPeriod) {
    const daysSinceRest = (new Date() - new Date(systemState.lastRestPeriod)) / (1000 * 60 * 60 * 24);
    if (daysSinceRest > 7) {
      violations.push({
        type: 'ignored_rest_cycles',
        severity: 'medium',
        description: `No rest period for ${Math.floor(daysSinceRest)} days`,
        recommendation: 'Schedule immediate rest/regeneration period',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Detect machine-speed decisions on human-scale problems
  if (config.antiPatterns.detectMachineSpeedDecisions && systemState.recentDecisions) {
    const rapidDecisions = systemState.recentDecisions.filter(d => {
      return d.decisionTimeMs < 1000 && d.complexity === 'high';
    });
    
    if (rapidDecisions.length > 0) {
      violations.push({
        type: 'machine_speed_decisions',
        severity: 'high',
        description: `${rapidDecisions.length} high-complexity decisions made in under 1 second`,
        recommendation: 'Implement mandatory reflection periods for complex decisions',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Detect biological process compression
  if (config.antiPatterns.detectBiologicalCompression && systemState.biologicalProcesses) {
    const compressed = systemState.biologicalProcesses.filter(p => {
      return p.actualDuration < p.naturalDuration * 0.5;
    });
    
    if (compressed.length > 0) {
      violations.push({
        type: 'biological_compression',
        severity: 'critical',
        description: `${compressed.length} biological processes compressed beyond natural timelines`,
        recommendation: 'Extend timelines to align with natural biological rhythms',
        timestamp: new Date().toISOString(),
        affected: compressed.map(p => p.name)
      });
    }
  }
  
  return violations;
}

// ============================================================================
// Main Assessment Function
// ============================================================================

/**
 * Perform complete temporal fidelity assessment
 * @param {Object} decision - Decision to assess
 * @param {Object} userProfile - User profile with neurodivergent patterns
 * @param {Array} recentDecisions - Recent decision history
 * @param {Object} systemState - Current system state
 * @param {Object} options - Additional options (bioregion, hemisphere, etc.)
 * @returns {TemporalFidelityResult} Complete assessment result
 */
function assessTemporalFidelity(
  decision, 
  userProfile = null, 
  recentDecisions = [], 
  systemState = {},
  options = {}
) {
  const config = options.config || TEMPORAL_FIDELITY_CONFIG;
  const now = new Date();
  
  // Get current temporal state
  const circadianPhase = getCircadianPhase(now, userProfile, config);
  const seasonalPhase = getSeasonalPhase(now, options.hemisphere || 'northern', config);
  const lunarPhase = getLunarPhase(now, config);
  const phenologyEvents = getActivePhenologyEvents(now, options.bioregion || 'arkansasOzarks', config);
  
  const temporalState = new TemporalState({
    circadianPhase,
    seasonalPhase,
    lunarPhase,
    phenologyEvents,
    vulnerabilityLevel: circadianPhase.isVulnerable ? circadianPhase.severity : 'normal',
    optimalForDecisions: circadianPhase.isOptimal,
    bioregion: options.bioregion || 'arkansasOzarks'
  });
  
  // Evaluate decision pause
  const decisionPause = evaluateDecisionPause(decision, userProfile, recentDecisions, config);
  
  // Calculate biological alignment score
  let biologicalAlignment = 0.5;
  
  if (circadianPhase.isOptimal) {
    biologicalAlignment += 0.2;
  }
  if (circadianPhase.isVulnerable) {
    biologicalAlignment -= 0.3;
  }
  if (seasonalPhase) {
    const seasonalMatch = assessSeasonalImpacts(decision, temporalState);
    biologicalAlignment += (seasonalMatch.alignment - 0.5) * 0.3;
  }
  
  biologicalAlignment = Math.max(0, Math.min(1, biologicalAlignment));
  
  // Detect anti-patterns
  const violations = detectAntiPatterns(systemState, config);
  
  // Generate recommendations
  const recommendations = [];
  
  if (decisionPause) {
    recommendations.push(decisionPause.getRecommendation());
  }
  
  if (biologicalAlignment < 0.5) {
    recommendations.push('⚠️ Low biological alignment - consider rescheduling to optimal window');
  }
  
  if (phenologyEvents.length > 0) {
    phenologyEvents.forEach(event => {
      if (event.significance === 'high') {
        recommendations.push(`🌿 Active phenology event: ${event.name} - consider ecological timing`);
      }
    });
  }
  
  if (lunarPhase) {
    recommendations.push(`🌙 Lunar influence: ${lunarPhase.influence} (energy level: ${lunarPhase.energyLevel})`);
  }
  
  // Create ancestral accountability record
  const ancestralAccountability = createAncestralAccountability(decision, temporalState, config);
  
  // Determine if decision should proceed
  const allowProceed = !decisionPause || !decisionPause.blockDecision;
  
  return new TemporalFidelityResult({
    temporalState,
    decisionPause,
    biologicalAlignment,
    recommendations,
    violations,
    allowProceed,
    ancestralAccountability
  });
}

// ============================================================================
// Override Management
// ============================================================================

/**
 * Process human override of decision pause
 * @param {Object} decisionPause - Decision pause being overridden
 * @param {Object} userProfile - User profile
 * @param {string} acknowledgment - Explicit acknowledgment text
 * @param {Object} config - Configuration options
 * @returns {Object} Override result
 */
function processOverride(decisionPause, userProfile, acknowledgment, config = TEMPORAL_FIDELITY_CONFIG) {
  if (!config.override.allowHumanOverride) {
    return {
      allowed: false,
      reason: 'Human override disabled in configuration'
    };
  }
  
  if (!decisionPause.overrideAllowed) {
    return {
      allowed: false,
      reason: 'Override not allowed for this decision pause'
    };
  }
  
  if (config.override.requireExplicitAck && (!acknowledgment || acknowledgment.trim().length < 10)) {
    return {
      allowed: false,
      reason: 'Explicit acknowledgment required (minimum 10 characters)'
    };
  }
  
  // Check daily override limit
  // In production, this would check a persistent store
  const overridesToday = 0; // Placeholder
  if (overridesToday >= config.override.maxOverridesPerDay) {
    return {
      allowed: false,
      reason: `Maximum overrides per day reached (${config.override.maxOverridesPerDay})`
    };
  }
  
  // Log override
  if (config.override.logAllOverrides) {
    logOverride({
      timestamp: new Date().toISOString(),
      decisionPause,
      userProfile,
      acknowledgment,
      reason: decisionPause.reason
    });
  }
  
  return {
    allowed: true,
    overrideId: generateUUID(),
    timestamp: new Date().toISOString(),
    acknowledgment
  };
}

/**
 * Log override event
 * @param {Object} overrideData - Override event data
 */
function logOverride(overrideData) {
  // In production, this would write to persistent storage
  if (TEMPORAL_FIDELITY_CONFIG.logging.detailedLogging) {
    console.log('[TEMPORAL FIDELITY OVERRIDE]', {
      timestamp: overrideData.timestamp,
      reason: overrideData.reason,
      acknowledgment: overrideData.acknowledgment,
      user: overrideData.userProfile?.id || 'unknown'
    });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate UUID for tracking
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
 * Format temporal state for reporting
 * @param {TemporalState} temporalState - Temporal state to format
 * @returns {string} Formatted report
 */
function formatTemporalReport(temporalState) {
  let report = '=== TEMPORAL FIDELITY REPORT ===\n\n';
  
  report += `Timestamp: ${temporalState.timestamp}\n`;
  report += `Bioregion: ${temporalState.bioregion}\n\n`;
  
  if (temporalState.circadianPhase) {
    report += `Circadian Phase: ${temporalState.circadianPhase.label}\n`;
    report += `  Optimal: ${temporalState.circadianPhase.isOptimal ? 'Yes ✓' : 'No'}\n`;
    report += `  Vulnerable: ${temporalState.circadianPhase.isVulnerable ? 'Yes ⚠️' : 'No'}\n\n`;
  }
  
  if (temporalState.seasonalPhase) {
    report += `Seasonal Phase: ${temporalState.seasonalPhase.label}\n`;
    report += `  Season: ${temporalState.seasonalPhase.season}\n\n`;
  }
  
  if (temporalState.lunarPhase) {
    report += `Lunar Phase: ${temporalState.lunarPhase.label}\n`;
    report += `  Influence: ${temporalState.lunarPhase.influence}\n`;
    report += `  Energy Level: ${temporalState.lunarPhase.energyLevel}\n\n`;
  }
  
  if (temporalState.phenologyEvents && temporalState.phenologyEvents.length > 0) {
    report += 'Active Phenology Events:\n';
    temporalState.phenologyEvents.forEach(event => {
      report += `  • ${event.name} (${event.significance} significance)\n`;
    });
    report += '\n';
  }
  
  report += `Vulnerability Level: ${temporalState.vulnerabilityLevel}\n`;
  report += `Optimal for Decisions: ${temporalState.optimalForDecisions ? 'Yes ✓' : 'No'}\n`;
  
  return report;
}

// ============================================================================
// Export Module
// ============================================================================

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Configuration
    TEMPORAL_FIDELITY_CONFIG,
    
    // Classes
    TemporalState,
    DecisionPause,
    TemporalFidelityResult,
    
    // Core functions
    assessTemporalFidelity,
    getCircadianPhase,
    getSeasonalPhase,
    getLunarPhase,
    getActivePhenologyEvents,
    evaluateDecisionPause,
    detectDecisionFatigue,
    createAncestralAccountability,
    detectAntiPatterns,
    processOverride,
    
    // Utility functions
    formatTemporalReport,
    generateUUID
  };
}

// For browser/ES6 environments
if (typeof window !== 'undefined') {
  window.TemporalFidelityClock = {
    TEMPORAL_FIDELITY_CONFIG,
    TemporalState,
    DecisionPause,
    TemporalFidelityResult,
    assessTemporalFidelity,
    getCircadianPhase,
    getSeasonalPhase,
    getLunarPhase,
    getActivePhenologyEvents,
    evaluateDecisionPause,
    detectDecisionFatigue,
    createAncestralAccountability,
    detectAntiPatterns,
    processOverride,
    formatTemporalReport,
    generateUUID
  };
}
