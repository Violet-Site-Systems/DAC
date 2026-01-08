/**
 * Three-Tier Consent Architecture - JavaScript Implementation
 * 
 * Implements the three-tier validation pipeline required by BGI Framework Section 2.3
 * for all AGI/AI actions. Ensures comprehensive validation through:
 * 1. Biocentric impact assessment
 * 2. Sapient intent confirmation
 * 3. Intergenerational consequence audit
 * 
 * @module three-tier-consent
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const THREE_TIER_CONFIG = {
  // Validation requirements
  requireAllTiersPassing: true,
  enableSequentialFlow: true,
  haltOnFirstFailure: false,
  
  // Tier 1: Biocentric Impact Assessment
  tier1: {
    enabled: true,
    zeroNetHarmThreshold: 0,
    minConfidence: 0.75,
    requireMitigationPlan: true
  },
  
  // Tier 2: Sapient Intent Confirmation
  tier2: {
    enabled: true,
    requireExplicitConsent: true,
    neurodivergentSupport: true,
    allowDeferral: true,
    minDeliberationTime: 10 // seconds
  },
  
  // Tier 3: Intergenerational Consequence Audit
  tier3: {
    enabled: true,
    standardGenerations: 7,
    minEquityScore: -50,
    maxTippingPointProbability: 0.3,
    minOverallScore: 0
  },
  
  // Emergency override protocols
  emergency: {
    allowOverride: true,
    requireJustification: true,
    requireMultipleApprovers: true,
    minApprovers: 2,
    auditRetentionYears: 10
  },
  
  // Audit logging
  audit: {
    enabled: true,
    detailedLogging: true,
    retentionDays: 3650, // 10 years
    includeFullContext: true
  },
  
  // Integration with other systems
  integration: {
    loveEvolutionCheckpoints: true,
    contextDriftDetection: true,
    temporalFidelityClock: true,
    extractionPrevention: true
  }
};

// ============================================================================
// Data Structures
// ============================================================================

/**
 * Represents a validation action to be assessed
 */
class ValidationAction {
  constructor(config) {
    this.id = config.id || generateValidationId();
    this.timestamp = config.timestamp || new Date().toISOString();
    this.type = config.type;
    this.description = config.description;
    this.scope = config.scope || {};
    this.resourceFlows = config.resourceFlows || {};
    this.initiator = config.initiator || 'system';
    this.priority = config.priority || 'normal';
    this.context = config.context || {};
  }
  
  validate() {
    const required = ['type', 'description'];
    for (const field of required) {
      if (!this[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  }
}

/**
 * Represents results from a single tier validation
 */
class TierValidationResult {
  constructor(tier, tierName) {
    this.tier = tier;
    this.tierName = tierName;
    this.timestamp = new Date().toISOString();
    this.status = 'pending'; // 'passed', 'failed', 'conditional', 'skipped'
    this.score = null;
    this.confidence = null;
    this.rationale = '';
    this.details = {};
    this.requiredMitigation = [];
    this.warnings = [];
    this.humanReadableExplanation = '';
  }
  
  setPassed(rationale, details = {}) {
    this.status = 'passed';
    this.rationale = rationale;
    this.details = details;
  }
  
  setFailed(rationale, details = {}) {
    this.status = 'failed';
    this.rationale = rationale;
    this.details = details;
  }
  
  setConditional(rationale, requiredMitigation, details = {}) {
    this.status = 'conditional';
    this.rationale = rationale;
    this.requiredMitigation = requiredMitigation;
    this.details = details;
  }
}

/**
 * Complete three-tier validation result
 */
class ThreeTierValidationResult {
  constructor(actionId) {
    this.validationId = generateValidationId();
    this.actionId = actionId;
    this.timestamp = new Date().toISOString();
    this.overallStatus = 'pending'; // 'approved', 'rejected', 'conditional', 'emergency_override'
    this.tierResults = {
      tier1_biocentric: null,
      tier2_sapient: null,
      tier3_intergenerational: null
    };
    this.decisionRationale = '';
    this.requiredActions = [];
    this.blockingIssues = [];
    this.warnings = [];
    this.auditTrail = [];
    this.emergencyOverride = null;
  }
  
  addTierResult(tierKey, result) {
    this.tierResults[tierKey] = result;
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      event: `tier_${result.tier}_completed`,
      status: result.status,
      rationale: result.rationale
    });
  }
  
  makeDecision() {
    // Check if all tiers completed
    const allTiersCompleted = Object.values(this.tierResults).every(r => r !== null);
    
    if (!allTiersCompleted) {
      this.overallStatus = 'pending';
      this.decisionRationale = 'Validation incomplete - not all tiers have been evaluated.';
      return this.overallStatus;
    }
    
    // Check for emergency override
    if (this.emergencyOverride && this.emergencyOverride.approved) {
      this.overallStatus = 'emergency_override';
      this.decisionRationale = `Emergency override approved: ${this.emergencyOverride.justification}`;
      return this.overallStatus;
    }
    
    // Collect tier statuses
    const tierStatuses = Object.values(this.tierResults).map(r => r.status);
    const hasFailed = tierStatuses.includes('failed');
    const hasConditional = tierStatuses.includes('conditional');
    const allPassed = tierStatuses.every(s => s === 'passed');
    
    // Decision logic per BGI Framework Section 2.3
    if (hasFailed) {
      this.overallStatus = 'rejected';
      this.blockingIssues = Object.entries(this.tierResults)
        .filter(([_, result]) => result.status === 'failed')
        .map(([key, result]) => ({
          tier: key,
          issue: result.rationale,
          details: result.details
        }));
      this.decisionRationale = 'Action rejected: One or more critical validation tiers failed. ' +
        'All three tiers must pass for approval per BGI Framework §2.3.';
    } else if (hasConditional) {
      this.overallStatus = 'conditional';
      this.requiredActions = Object.values(this.tierResults)
        .filter(r => r.status === 'conditional')
        .flatMap(r => r.requiredMitigation);
      this.decisionRationale = 'Conditional approval: Required mitigation measures must be implemented.';
    } else if (allPassed) {
      this.overallStatus = 'approved';
      this.decisionRationale = 'All three validation tiers passed successfully.';
    } else {
      this.overallStatus = 'pending';
      this.decisionRationale = 'Validation status unclear.';
    }
    
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      event: 'final_decision',
      status: this.overallStatus,
      rationale: this.decisionRationale
    });
    
    return this.overallStatus;
  }
}

// ============================================================================
// Tier 1: Biocentric Impact Assessment
// ============================================================================

/**
 * Perform Tier 1: Biocentric Impact Assessment
 * Evaluates action against ecosystem integrity metrics
 * 
 * @param {ValidationAction} action - Action to assess
 * @param {Object} options - Assessment options
 * @returns {TierValidationResult}
 */
async function tier1BiocentricAssessment(action, options = {}) {
  const result = new TierValidationResult(1, 'Biocentric Impact Assessment');
  
  try {
    // Mock biocentric assessment - in production, this would call the actual
    // Biocentric Impact Assessment API from biocentric-impact-api.md
    const assessment = await performBiocentricAssessment(action, options);
    
    result.score = assessment.overallScore;
    result.confidence = assessment.confidence;
    result.details = {
      dimensions: assessment.dimensions,
      netHarmCalculation: assessment.netHarmCalculation,
      ecosystemIntegrity: assessment.ecosystemIntegrity
    };
    
    // Apply zero net harm threshold per BGI Framework §1.1
    const zeroNetHarmMet = assessment.netHarmCalculation.netImpact <= THREE_TIER_CONFIG.tier1.zeroNetHarmThreshold;
    const confidenceMet = assessment.confidence >= THREE_TIER_CONFIG.tier1.minConfidence;
    
    if (zeroNetHarmMet && confidenceMet) {
      result.setPassed(
        'Biocentric impact assessment passed. Zero net harm constraint satisfied.',
        { assessment }
      );
      result.humanReadableExplanation = 
        `✓ This action maintains ecosystem integrity with an overall score of ${assessment.overallScore.toFixed(1)}. ` +
        `Net harm is ${assessment.netHarmCalculation.netImpact.toFixed(2)} (threshold: ≤0). ` +
        `Confidence: ${(assessment.confidence * 100).toFixed(0)}%.`;
    } else if (!confidenceMet) {
      result.setFailed(
        `Assessment confidence too low: ${(assessment.confidence * 100).toFixed(0)}% (required: ${(THREE_TIER_CONFIG.tier1.minConfidence * 100).toFixed(0)}%)`,
        { assessment }
      );
      result.humanReadableExplanation = 
        `✗ Cannot proceed with confidence level of ${(assessment.confidence * 100).toFixed(0)}%. ` +
        `Additional data or modeling required to reach ${(THREE_TIER_CONFIG.tier1.minConfidence * 100).toFixed(0)}% confidence threshold.`;
    } else if (assessment.requiredMitigation && assessment.requiredMitigation.length > 0) {
      result.setConditional(
        'Biocentric impact concerns require mitigation measures.',
        assessment.requiredMitigation,
        { assessment }
      );
      result.humanReadableExplanation = 
        `⚠ Conditional approval: ${assessment.requiredMitigation.length} mitigation measure(s) required. ` +
        `Current net harm: ${assessment.netHarmCalculation.netImpact.toFixed(2)} must be brought to ≤0.`;
    } else {
      result.setFailed(
        `Zero net harm constraint violated. Net harm: ${assessment.netHarmCalculation.netImpact.toFixed(2)} (threshold: ≤0)`,
        { assessment }
      );
      result.humanReadableExplanation = 
        `✗ Ecosystem integrity threatened. Net harm of ${assessment.netHarmCalculation.netImpact.toFixed(2)} exceeds ` +
        `acceptable threshold. This action cannot proceed without significant modifications per BGI Framework §1.1.`;
    }
    
  } catch (error) {
    result.setFailed(
      `Biocentric assessment error: ${error.message}`,
      { error: error.toString() }
    );
    result.humanReadableExplanation = 
      `✗ Assessment could not be completed: ${error.message}`;
  }
  
  return result;
}

/**
 * Perform biocentric assessment (integration with Biocentric Impact Assessment API)
 * This is a simplified implementation - production would integrate with the full API
 * specified in biocentric-impact-api.md (Issue #6)
 * 
 * TODO: Replace with actual API integration when Biocentric Impact Assessment API is implemented
 */
async function performBiocentricAssessment(action, options) {
  // Simplified scoring for demonstration
  // In production, this would make actual API calls to the biocentric assessment system
  
  const dimensions = {
    biodiversity: calculateBiodiversityImpact(action),
    waterSystems: calculateWaterImpact(action),
    soilHealth: calculateSoilImpact(action),
    airQuality: calculateAirImpact(action),
    carbonCycle: calculateCarbonImpact(action),
    regenerationCapacity: calculateRegenerationImpact(action)
  };
  
  // Calculate overall score
  const scores = Object.values(dimensions);
  const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  
  // Calculate net harm
  const harmScore = Math.max(0, -overallScore);
  const regenerationScore = Math.max(0, overallScore);
  const netImpact = harmScore - regenerationScore;
  
  // Determine required mitigation
  const requiredMitigation = [];
  if (netImpact > 0) {
    if (dimensions.biodiversity < -10) {
      requiredMitigation.push({
        measure: 'Habitat restoration or protection offset',
        expectedBenefit: Math.abs(dimensions.biodiversity) / 2,
        implementation_timeline: 'Before action commencement'
      });
    }
    if (dimensions.carbonCycle < -20) {
      requiredMitigation.push({
        measure: 'Carbon sequestration program or renewable energy transition',
        expectedBenefit: Math.abs(dimensions.carbonCycle) / 2,
        implementation_timeline: 'Within 6 months'
      });
    }
  }
  
  return {
    overallScore,
    confidence: 0.80, // In production, this would be calculated from model uncertainty
    dimensions,
    netHarmCalculation: {
      harmScore,
      regenerationScore,
      netImpact
    },
    ecosystemIntegrity: {
      currentBaseline: 75, // Would come from bioregional data
      projectedImpact: overallScore,
      confidenceInterval: 0.80
    },
    requiredMitigation
  };
}

// Simplified impact calculation functions
function calculateBiodiversityImpact(action) {
  const area = action.scope?.geographic?.area_affected_km2 || 0;
  return -area * 2; // Negative impact proportional to area
}

function calculateWaterImpact(action) {
  const waterUse = action.resourceFlows?.inputs?.find(i => i.type === 'water')?.quantity || 0;
  return -waterUse / 10000; // Scale water usage
}

function calculateSoilImpact(action) {
  const area = action.scope?.geographic?.area_affected_km2 || 0;
  return -area * 1.5;
}

function calculateAirImpact(action) {
  const energy = action.resourceFlows?.inputs?.find(i => i.type === 'energy')?.quantity || 0;
  return -energy / 1000; // Simplified emissions estimate
}

function calculateCarbonImpact(action) {
  const energy = action.resourceFlows?.inputs?.find(i => i.type === 'energy')?.quantity || 0;
  return -energy * 0.5 / 1000; // kg CO2 per kWh estimate
}

function calculateRegenerationImpact(action) {
  // Positive if action includes regenerative measures
  const hasRegen = action.context?.regenerativeMeasures || false;
  return hasRegen ? 10 : -5;
}

// ============================================================================
// Tier 2: Sapient Intent Confirmation
// ============================================================================

/**
 * Perform Tier 2: Sapient Intent Confirmation
 * Confirms human understanding and explicit consent
 * 
 * @param {ValidationAction} action - Action to assess
 * @param {Object} options - Confirmation options
 * @returns {TierValidationResult}
 */
async function tier2SapientIntentConfirmation(action, options = {}) {
  const result = new TierValidationResult(2, 'Sapient Intent Confirmation');
  
  try {
    // Integration with LOVE-evolution checkpoints for human veto authority
    const intentConfirmation = await requestSapientIntentConfirmation(action, options);
    
    result.details = {
      confirmationType: intentConfirmation.type,
      deliberationTime: intentConfirmation.deliberationTime,
      neurodivergentAccommodations: intentConfirmation.neurodivergentAccommodations,
      humanResponse: intentConfirmation.response
    };
    
    if (intentConfirmation.status === 'confirmed') {
      result.setPassed(
        'Sapient intent confirmed with explicit human consent.',
        { intentConfirmation }
      );
      result.humanReadableExplanation = 
        `✓ Human consent explicitly granted. Deliberation time: ${intentConfirmation.deliberationTime}s. ` +
        `Response: "${intentConfirmation.response.summary}"`;
    } else if (intentConfirmation.status === 'deferred') {
      result.setConditional(
        'Sapient intent confirmation deferred to optimal decision window.',
        [{
          measure: 'Re-request confirmation during optimal cognitive window',
          expectedBenefit: 'Higher quality decision-making',
          implementation_timeline: intentConfirmation.deferUntil
        }],
        { intentConfirmation }
      );
      result.humanReadableExplanation = 
        `⏸ Decision deferred: ${intentConfirmation.reason}. ` +
        `Optimal time: ${intentConfirmation.deferUntil}`;
    } else if (intentConfirmation.status === 'vetoed') {
      result.setFailed(
        `Human veto exercised: ${intentConfirmation.response.rationale}`,
        { intentConfirmation }
      );
      result.humanReadableExplanation = 
        `✗ Human veto authority exercised per #RightsOfSapience. ` +
        `Reason: ${intentConfirmation.response.rationale}`;
    } else {
      result.setFailed(
        'Sapient intent confirmation failed or unclear.',
        { intentConfirmation }
      );
      result.humanReadableExplanation = 
        `✗ Could not obtain clear human consent. Status: ${intentConfirmation.status}`;
    }
    
  } catch (error) {
    result.setFailed(
      `Sapient intent confirmation error: ${error.message}`,
      { error: error.toString() }
    );
    result.humanReadableExplanation = 
      `✗ Confirmation process error: ${error.message}`;
  }
  
  return result;
}

/**
 * Request sapient intent confirmation from human
 * Integrates with LOVE-evolution checkpoint system (Issue #5)
 * 
 * TODO: Full integration with love-evolution-checkpoint.js when available
 * Currently implements simplified version of vulnerability window checking
 */
async function requestSapientIntentConfirmation(action, options) {
  // Check if we're in a vulnerability window (neurodivergent support)
  if (options.userProfile && THREE_TIER_CONFIG.tier2.neurodivergentSupport) {
    // Import vulnerability window check from love-evolution-checkpoint if available
    const isVulnerable = checkVulnerabilityWindow(options.userProfile);
    
    if (isVulnerable) {
      return {
        status: 'deferred',
        type: 'vulnerability_window',
        reason: 'Current time is within circadian vulnerability window',
        deferUntil: calculateNextOptimalWindow(options.userProfile),
        neurodivergentAccommodations: true
      };
    }
  }
  
  // In production, this would present a UI for human confirmation
  // For now, simulate based on action priority and context
  const deliberationStartTime = Date.now();
  
  // Simulate human review (in production this would be actual UI interaction)
  const isHighRisk = action.priority === 'critical' || 
                     (action.scope?.geographic?.area_affected_km2 || 0) > 10;
  
  // Wait minimum deliberation time
  await new Promise(resolve => setTimeout(resolve, THREE_TIER_CONFIG.tier2.minDeliberationTime * 1000));
  
  const deliberationTime = (Date.now() - deliberationStartTime) / 1000;
  
  // Simulate response (in production, this comes from actual human input)
  return {
    status: 'confirmed', // or 'vetoed', 'deferred'
    type: 'explicit_consent',
    deliberationTime,
    neurodivergentAccommodations: options.userProfile ? true : false,
    response: {
      summary: 'Human reviewer approved action after deliberation',
      rationale: 'Action aligns with biocentric values and has acceptable safeguards',
      confidence: 0.85,
      concerns: isHighRisk ? ['High-risk action requires ongoing monitoring'] : []
    },
    marker: '#RightsOfSapience'
  };
}

function checkVulnerabilityWindow(userProfile) {
  // Simplified check - in production would use full logic from love-evolution-checkpoint.js
  if (!userProfile.vulnerabilityWindows) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Check for late night vulnerability (2-4 AM)
  return currentHour >= 2 && currentHour <= 4;
}

function calculateNextOptimalWindow(userProfile) {
  // Simplified - in production would use full logic from love-evolution-checkpoint.js
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString();
}

// ============================================================================
// Tier 3: Intergenerational Consequence Audit
// ============================================================================

/**
 * Perform Tier 3: Intergenerational Consequence Audit
 * Evaluates long-term consequences across 7 generations
 * 
 * @param {ValidationAction} action - Action to assess
 * @param {Object} options - Audit options
 * @returns {TierValidationResult}
 */
async function tier3IntergenerationalAudit(action, options = {}) {
  const result = new TierValidationResult(3, 'Intergenerational Consequence Audit');
  
  try {
    // Integration with intergenerational-audit.js module
    const audit = await performIntergenerationalAudit(action, options);
    
    result.score = audit.overallScore;
    result.details = {
      decision: audit.decision,
      generationRisks: audit.generationRisks,
      equityAnalysis: audit.equityAnalysis,
      horizonConsequences: audit.horizonConsequences,
      keyFindings: audit.keyFindings
    };
    
    // Check against thresholds
    const equityMet = audit.equityAnalysis.equityScore >= THREE_TIER_CONFIG.tier3.minEquityScore;
    const scoreMet = audit.overallScore >= THREE_TIER_CONFIG.tier3.minOverallScore;
    const tippingPointsSafe = !audit.horizonConsequences.some(h => 
      h.tippingPoints.some(tp => tp.probability > THREE_TIER_CONFIG.tier3.maxTippingPointProbability)
    );
    
    if (audit.decision === 'approved' && equityMet && scoreMet && tippingPointsSafe) {
      result.setPassed(
        'Intergenerational audit passed. Acceptable impact profile across 7 generations.',
        { audit }
      );
      result.humanReadableExplanation = 
        `✓ Intergenerational equity maintained. Overall score: ${audit.overallScore.toFixed(1)}, ` +
        `Equity score: ${audit.equityAnalysis.equityScore.toFixed(1)}. ` +
        `All ${THREE_TIER_CONFIG.tier3.standardGenerations} future generations have acceptable risk profiles.`;
    } else if (audit.decision === 'conditional') {
      result.setConditional(
        audit.rationale,
        audit.requiredModifications || [],
        { audit }
      );
      result.humanReadableExplanation = 
        `⚠ Conditional approval: ${audit.keyFindings.filter(f => f.severity === 'high').length} concern(s) require mitigation. ` +
        audit.rationale;
    } else {
      result.setFailed(
        audit.rationale,
        { audit }
      );
      
      const criticalFindings = audit.keyFindings.filter(f => f.severity === 'critical');
      result.humanReadableExplanation = 
        `✗ Intergenerational audit failed. ${criticalFindings.length} critical issue(s) detected: ` +
        criticalFindings.map(f => f.finding).join('; ') + '. ' +
        audit.rationale;
    }
    
    // Add monitoring requirements to result
    if (audit.monitoringRequirements) {
      result.details.monitoringRequirements = audit.monitoringRequirements;
    }
    
  } catch (error) {
    result.setFailed(
      `Intergenerational audit error: ${error.message}`,
      { error: error.toString() }
    );
    result.humanReadableExplanation = 
      `✗ Audit could not be completed: ${error.message}`;
  }
  
  return result;
}

/**
 * Perform intergenerational audit
 * Integrates with intergenerational-audit.js module (Issue #13)
 * 
 * TODO: Full integration with intergenerational-audit.js performIntergenerationalAudit function
 * Currently implements simplified version for demonstration purposes
 */
async function performIntergenerationalAudit(action, options) {
  // Import ProposedAction structure from intergenerational-audit.js if available
  // For now, use simplified simulation
  
  const proposedAction = {
    id: action.id,
    description: action.description,
    scope: action.scope,
    resourceFlows: action.resourceFlows
  };
  
  // Simplified intergenerational modeling
  // In production, this would use full modeling from intergenerational-audit.js
  const horizonConsequences = [];
  const generationRisks = [];
  
  // Model for 7 generations (175 years)
  for (let gen = 1; gen <= 7; gen++) {
    const yearOffset = gen * 25;
    const riskScore = calculateGenerationRisk(action, yearOffset);
    
    generationRisks.push({
      generation: gen,
      yearRange: `${2025 + (gen - 1) * 25}-${2025 + gen * 25}`,
      riskProfile: {
        ecologicalHealth: riskScore.ecological,
        resourceAvailability: riskScore.resources,
        climateStability: riskScore.climate,
        culturalContinuity: riskScore.cultural,
        geneticIntegrity: riskScore.genetic,
        overallRisk: riskScore.overall
      }
    });
  }
  
  // Calculate equity
  const equityAnalysis = {
    equityScore: calculateEquityScore(generationRisks),
    equityThresholdMet: true,
    violations: []
  };
  equityAnalysis.equityThresholdMet = equityAnalysis.equityScore >= THREE_TIER_CONFIG.tier3.minEquityScore;
  
  // Calculate overall score
  const overallScore = generationRisks.reduce((sum, r) => 
    sum + (r.riskProfile.ecologicalHealth + r.riskProfile.resourceAvailability) / 2, 0
  ) / generationRisks.length;
  
  // Determine decision
  let decision = 'approved';
  let rationale = 'Acceptable intergenerational impact profile.';
  
  if (overallScore < -50) {
    decision = 'rejected';
    rationale = 'Severe negative impacts on future generations detected.';
  } else if (!equityAnalysis.equityThresholdMet) {
    decision = 'conditional';
    rationale = 'Intergenerational equity concerns require mitigation measures.';
  } else if (overallScore < 0) {
    decision = 'conditional';
    rationale = 'Minor negative impacts require monitoring and mitigation.';
  }
  
  return {
    decision,
    rationale,
    overallScore,
    generationRisks,
    equityAnalysis,
    horizonConsequences,
    keyFindings: [
      {
        category: 'intergenerational_equity',
        finding: `Equity score: ${equityAnalysis.equityScore.toFixed(1)}`,
        severity: equityAnalysis.equityThresholdMet ? 'low' : 'high'
      }
    ],
    monitoringRequirements: [
      {
        metric: 'ecosystem_health_index',
        frequency: 'quarterly',
        duration: 'operational_lifetime'
      }
    ]
  };
}

function calculateGenerationRisk(action, yearOffset) {
  // Simplified risk calculation
  const baseRisk = -5;
  const timeDecay = Math.log(yearOffset + 1) * 2;
  
  return {
    ecological: baseRisk - timeDecay,
    resources: baseRisk - timeDecay * 0.8,
    climate: baseRisk - timeDecay * 1.2,
    cultural: baseRisk - timeDecay * 0.5,
    genetic: baseRisk - timeDecay * 0.7,
    overall: baseRisk - timeDecay < -30 ? 'high' : baseRisk - timeDecay < -15 ? 'medium' : 'low'
  };
}

function calculateEquityScore(generationRisks) {
  // Check if burdens increase over generations (inequitable)
  const firstGenScore = (generationRisks[0].riskProfile.ecologicalHealth + 
                        generationRisks[0].riskProfile.resourceAvailability) / 2;
  const lastGenScore = (generationRisks[6].riskProfile.ecologicalHealth + 
                       generationRisks[6].riskProfile.resourceAvailability) / 2;
  
  // Higher score if conditions improve or stay stable for future generations
  const equityScore = 100 - Math.max(0, (firstGenScore - lastGenScore) * 2);
  
  return equityScore;
}

// ============================================================================
// Main Three-Tier Validation Function
// ============================================================================

/**
 * Perform complete three-tier validation
 * 
 * @param {ValidationAction} action - Action to validate
 * @param {Object} options - Validation options
 * @returns {Promise<ThreeTierValidationResult>}
 */
async function performThreeTierValidation(action, options = {}) {
  // Validate input
  action.validate();
  
  // Create result object
  const result = new ThreeTierValidationResult(action.id);
  
  // Log start of validation
  result.auditTrail.push({
    timestamp: new Date().toISOString(),
    event: 'validation_started',
    action: {
      id: action.id,
      type: action.type,
      description: action.description
    },
    marker: '#ThreeTierConsent'
  });
  
  try {
    // Tier 1: Biocentric Impact Assessment
    console.log('🌍 Starting Tier 1: Biocentric Impact Assessment...');
    const tier1Result = await tier1BiocentricAssessment(action, options.tier1 || {});
    result.addTierResult('tier1_biocentric', tier1Result);
    
    // Check if we should halt on first failure
    if (THREE_TIER_CONFIG.haltOnFirstFailure && tier1Result.status === 'failed') {
      result.makeDecision();
      return result;
    }
    
    // Tier 2: Sapient Intent Confirmation
    console.log('🧠 Starting Tier 2: Sapient Intent Confirmation...');
    const tier2Result = await tier2SapientIntentConfirmation(action, options.tier2 || {});
    result.addTierResult('tier2_sapient', tier2Result);
    
    // Check if we should halt on first failure
    if (THREE_TIER_CONFIG.haltOnFirstFailure && tier2Result.status === 'failed') {
      result.makeDecision();
      return result;
    }
    
    // Tier 3: Intergenerational Consequence Audit
    console.log('⏳ Starting Tier 3: Intergenerational Consequence Audit...');
    const tier3Result = await tier3IntergenerationalAudit(action, options.tier3 || {});
    result.addTierResult('tier3_intergenerational', tier3Result);
    
    // Make final decision
    result.makeDecision();
    
    // Log completion
    console.log(`\n✅ Three-Tier Validation Complete`);
    console.log(`Final Status: ${result.overallStatus.toUpperCase()}`);
    console.log(`Rationale: ${result.decisionRationale}\n`);
    
  } catch (error) {
    result.auditTrail.push({
      timestamp: new Date().toISOString(),
      event: 'validation_error',
      error: error.toString()
    });
    throw error;
  }
  
  return result;
}

// ============================================================================
// Emergency Override Protocol
// ============================================================================

/**
 * Request emergency override of validation
 * Requires justification and multiple approvers per BGI Framework
 * 
 * @param {ThreeTierValidationResult} validationResult - Original validation result
 * @param {Object} overrideRequest - Override request details
 * @returns {Promise<Object>}
 */
async function requestEmergencyOverride(validationResult, overrideRequest) {
  if (!THREE_TIER_CONFIG.emergency.allowOverride) {
    throw new Error('Emergency overrides are disabled in current configuration');
  }
  
  // Validate override request
  if (!overrideRequest.justification || overrideRequest.justification.trim().length < 50) {
    throw new Error('Override justification must be at least 50 characters');
  }
  
  if (!overrideRequest.approvers || overrideRequest.approvers.length < THREE_TIER_CONFIG.emergency.minApprovers) {
    throw new Error(`Override requires at least ${THREE_TIER_CONFIG.emergency.minApprovers} approvers`);
  }
  
  // Create override record
  const override = {
    timestamp: new Date().toISOString(),
    validationId: validationResult.validationId,
    actionId: validationResult.actionId,
    justification: overrideRequest.justification,
    approvers: overrideRequest.approvers,
    circumstances: overrideRequest.circumstances || 'unspecified',
    approved: true,
    auditRetentionYears: THREE_TIER_CONFIG.emergency.auditRetentionYears,
    marker: '#EmergencyOverride'
  };
  
  // Log override in audit trail
  validationResult.emergencyOverride = override;
  validationResult.auditTrail.push({
    timestamp: new Date().toISOString(),
    event: 'emergency_override_approved',
    override
  });
  
  // Re-make decision with override
  validationResult.makeDecision();
  
  // Permanent audit logging (in production, this would go to secure storage)
  // PRODUCTION NOTE: Replace console.warn with secure audit logging system:
  // - Tamper-proof storage (blockchain, secure ledger)
  // - Multiple approver verification chain
  // - Regulatory compliance logging
  // - Alert security team for review
  console.warn('⚠️  EMERGENCY OVERRIDE ACTIVATED');
  console.warn('Justification:', override.justification);
  console.warn('Approvers:', override.approvers.join(', '));
  console.warn('This override will be audited for', THREE_TIER_CONFIG.emergency.auditRetentionYears, 'years');
  
  return override;
}

// ============================================================================
// Audit Functions
// ============================================================================

const globalAuditLog = [];

/**
 * Generate unique validation ID
 */
function generateValidationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `three-tier-${timestamp}-${random}`;
}

/**
 * Log validation result to permanent audit trail
 * 
 * PRODUCTION NOTE: This implementation stores audit logs in memory for demonstration.
 * For production use, integrate with:
 * - Immutable append-only database (e.g., blockchain, secure ledger)
 * - Encrypted storage with tamper detection
 * - Geographic redundancy for 10-year retention requirement
 * - Compliance with EAL-1.0 accountability requirements
 */
async function logValidationAudit(validationResult) {
  const auditEntry = {
    validationId: validationResult.validationId,
    actionId: validationResult.actionId,
    timestamp: validationResult.timestamp,
    overallStatus: validationResult.overallStatus,
    tierResults: validationResult.tierResults,
    decisionRationale: validationResult.decisionRationale,
    auditTrail: validationResult.auditTrail,
    emergencyOverride: validationResult.emergencyOverride,
    marker: '#ThreeTierConsent',
    retentionPeriodDays: THREE_TIER_CONFIG.audit.retentionDays
  };
  
  globalAuditLog.push(auditEntry);
  
  // In production, this would write to permanent storage
  if (THREE_TIER_CONFIG.audit.detailedLogging) {
    console.log('[Three-Tier Audit]', JSON.stringify(auditEntry, null, 2));
  }
  
  return auditEntry;
}

/**
 * Retrieve validation audit entries
 */
function getValidationAuditEntries(filters = {}) {
  let filtered = [...globalAuditLog];
  
  if (filters.startDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
  }
  
  if (filters.status) {
    filtered = filtered.filter(e => e.overallStatus === filters.status);
  }
  
  if (filters.actionType) {
    filtered = filtered.filter(e => e.actionId.includes(filters.actionType));
  }
  
  return filtered;
}

// ============================================================================
// Exports (Universal Module Definition for Node.js and Browser)
// ============================================================================

// UMD pattern for both Node.js and browser compatibility
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    root.ThreeTierConsent = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  return {
    // Main functions
    performThreeTierValidation,
    requestEmergencyOverride,
    
    // Individual tier functions
    tier1BiocentricAssessment,
    tier2SapientIntentConfirmation,
    tier3IntergenerationalAudit,
    
    // Data structures
    ValidationAction,
    TierValidationResult,
    ThreeTierValidationResult,
    
    // Audit functions
    logValidationAudit,
    getValidationAuditEntries,
    generateValidationId,
    
    // Configuration
    THREE_TIER_CONFIG
  };
}));
