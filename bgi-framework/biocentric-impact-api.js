/**
 * Biocentric Impact Assessment API - JavaScript Implementation
 * 
 * Provides standardized interface for evaluating decisions, actions, and systems
 * against ecosystem integrity metrics. Enforces the core BGI principle of
 * Biocentric Primacy: zero net harm to biosphere regeneration cycles.
 * 
 * Implements the API specification from biocentric-impact-api.md (Issue #6)
 * 
 * @module biocentric-impact-api
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const BIOCENTRIC_API_CONFIG = {
  version: '1.0',
  
  // Scoring system (-100 to +100)
  scoring: {
    min: -100,
    max: 100,
    ranges: {
      netPositiveHigh: { min: 50, max: 100, label: 'Net positive, enhances biosphere regeneration' },
      netPositiveLow: { min: 1, max: 49, label: 'Minor positive impact' },
      neutral: { min: 0, max: 0, label: 'True neutral (rare)' },
      minorHarm: { min: -49, max: -1, label: 'Minor harm, mitigation possible' },
      significantHarm: { min: -100, max: -50, label: 'Significant harm, likely rejection' }
    }
  },
  
  // Zero net harm threshold
  zeroNetHarmThreshold: 0,
  minConfidence: 0.75,
  
  // Assessment dimensions with weights
  dimensions: {
    biodiversity: { weight: 0.20, label: 'Biodiversity Impact' },
    waterSystems: { weight: 0.18, label: 'Water Systems' },
    soilHealth: { weight: 0.16, label: 'Soil Health' },
    airQuality: { weight: 0.15, label: 'Air Quality' },
    carbonCycle: { weight: 0.16, label: 'Carbon Cycle' },
    regenerationCapacity: { weight: 0.15, label: 'Regeneration Capacity' }
  },
  
  // Integration with other systems
  integration: {
    bioregionalDataStandards: true,
    threeTierConsent: true,
    monitoringSystems: true
  }
};

// ============================================================================
// Data Structures
// ============================================================================

/**
 * Represents an assessment request
 */
class AssessmentRequest {
  constructor(config) {
    this.assessment_id = config.assessment_id || generateAssessmentId();
    this.timestamp = config.timestamp || new Date().toISOString();
    this.action = config.action || {};
    this.bioregional_context = config.bioregional_context || null;
    this.alternatives_considered = config.alternatives_considered || [];
  }
  
  validate() {
    if (!this.action || !this.action.type || !this.action.description) {
      throw new Error('Assessment request must include action with type and description');
    }
    
    if (!this.action.scope) {
      throw new Error('Assessment request must include action scope');
    }
    
    return true;
  }
  
  getAction() {
    return this.action;
  }
}

/**
 * Represents an action to be assessed
 */
class Action {
  constructor(config) {
    this.type = config.type;
    this.description = config.description;
    this.scope = config.scope || {
      geographic: {},
      temporal: {}
    };
    this.resources = config.resources || {
      energy_kwh: 0,
      water_liters: 0,
      land_hectares: 0,
      materials: []
    };
  }
}

/**
 * Represents dimension-specific impact assessment
 */
class DimensionImpact {
  constructor(dimension) {
    this.dimension = dimension;
    this.score = 0; // -100 to +100
    this.factors = [];
    this.confidence = 0;
    this.details = {};
  }
  
  addFactor(name, value, weight = 1.0) {
    this.factors.push({ name, value, weight });
  }
  
  calculateScore() {
    if (this.factors.length === 0) {
      this.score = 0;
      return this.score;
    }
    
    const weightedSum = this.factors.reduce((sum, f) => sum + (f.value * f.weight), 0);
    const totalWeight = this.factors.reduce((sum, f) => sum + f.weight, 0);
    
    this.score = Math.max(
      BIOCENTRIC_API_CONFIG.scoring.min,
      Math.min(BIOCENTRIC_API_CONFIG.scoring.max, weightedSum / totalWeight)
    );
    
    return this.score;
  }
}

/**
 * Represents biocentric impact score
 */
class BiocentricImpactScore {
  constructor() {
    this.overall = 0;
    this.dimensions = {
      biodiversity: 0,
      waterSystems: 0,
      soilHealth: 0,
      airQuality: 0,
      carbonCycle: 0,
      regenerationCapacity: 0
    };
  }
  
  calculateOverall() {
    const dimensionConfigs = BIOCENTRIC_API_CONFIG.dimensions;
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [key, value] of Object.entries(this.dimensions)) {
      const weight = dimensionConfigs[key]?.weight || 0.167;
      weightedSum += value * weight;
      totalWeight += weight;
    }
    
    this.overall = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return this.overall;
  }
  
  setDimensionScore(dimension, score) {
    if (this.dimensions.hasOwnProperty(dimension)) {
      this.dimensions[dimension] = score;
    }
  }
}

/**
 * Represents net harm calculation
 */
class NetHarmCalculation {
  constructor() {
    this.harm_score = 0;
    this.regeneration_score = 0;
    this.net_impact = 0;
    this.threshold_met = false;
  }
  
  calculate(overallScore) {
    // Harm is the negative component
    this.harm_score = Math.max(0, -overallScore);
    
    // Regeneration is the positive component
    this.regeneration_score = Math.max(0, overallScore);
    
    // Net impact
    this.net_impact = this.harm_score - this.regeneration_score;
    
    // Check zero net harm threshold
    this.threshold_met = this.net_impact <= BIOCENTRIC_API_CONFIG.zeroNetHarmThreshold;
    
    return this.threshold_met;
  }
}

/**
 * Represents ecosystem integrity metrics
 */
class EcosystemIntegrity {
  constructor() {
    this.current_baseline = 0;
    this.projected_impact = 0;
    this.confidence_interval = 0;
  }
  
  setBaseline(baseline) {
    this.current_baseline = baseline;
  }
  
  setProjectedImpact(impact) {
    this.projected_impact = impact;
  }
  
  setConfidence(confidence) {
    this.confidence_interval = confidence;
  }
}

/**
 * Represents a mitigation measure
 */
class MitigationMeasure {
  constructor(measure, expectedBenefit, timeline) {
    this.measure = measure;
    this.expected_benefit = expectedBenefit;
    this.implementation_timeline = timeline;
  }
}

/**
 * Represents a monitoring requirement
 */
class MonitoringRequirement {
  constructor(metric, frequency, duration) {
    this.metric = metric;
    this.frequency = frequency;
    this.duration = duration;
  }
}

/**
 * Represents complete assessment response
 */
class AssessmentResponse {
  constructor(assessmentId) {
    this.assessment_id = assessmentId;
    this.timestamp = new Date().toISOString();
    this.status = 'pending'; // 'approved', 'rejected', 'conditional', 'insufficient_data', 'high_uncertainty'
    this.biocentric_impact_score = new BiocentricImpactScore();
    this.net_harm_calculation = new NetHarmCalculation();
    this.ecosystem_integrity = new EcosystemIntegrity();
    this.required_mitigation = [];
    this.monitoring_requirements = [];
    this.rationale = '';
    this.bioregional_data_version = '1.0';
    this.dimension_details = {};
  }
  
  setStatus(status, rationale) {
    this.status = status;
    this.rationale = rationale;
  }
  
  addMitigation(measure) {
    this.required_mitigation.push(measure);
  }
  
  addMonitoring(requirement) {
    this.monitoring_requirements.push(requirement);
  }
  
  makeDecision() {
    // Check confidence threshold
    if (this.ecosystem_integrity.confidence_interval < BIOCENTRIC_API_CONFIG.minConfidence) {
      this.setStatus(
        'high_uncertainty',
        `Assessment confidence (${(this.ecosystem_integrity.confidence_interval * 100).toFixed(0)}%) ` +
        `below required threshold (${(BIOCENTRIC_API_CONFIG.minConfidence * 100).toFixed(0)}%). ` +
        `Additional modeling or data collection required.`
      );
      return this.status;
    }
    
    // Calculate net harm
    this.net_harm_calculation.calculate(this.biocentric_impact_score.overall);
    
    // Decision logic based on zero net harm threshold
    if (this.net_harm_calculation.threshold_met) {
      if (this.biocentric_impact_score.overall >= 50) {
        this.setStatus(
          'approved',
          `Net positive impact: Overall score ${this.biocentric_impact_score.overall.toFixed(1)} ` +
          `enhances biosphere regeneration. Zero net harm constraint satisfied.`
        );
      } else if (this.biocentric_impact_score.overall >= 1) {
        this.setStatus(
          'approved',
          `Minor positive impact: Overall score ${this.biocentric_impact_score.overall.toFixed(1)}. ` +
          `Zero net harm constraint satisfied.`
        );
      } else if (this.biocentric_impact_score.overall === 0) {
        this.setStatus(
          'approved',
          `True neutral impact: Overall score ${this.biocentric_impact_score.overall.toFixed(1)}. ` +
          `Zero net harm constraint satisfied.`
        );
      } else {
        // Negative score but within threshold (net harm <= 0 after mitigation)
        this.setStatus(
          'approved',
          `Approved with monitoring: Overall score ${this.biocentric_impact_score.overall.toFixed(1)}. ` +
          `Zero net harm constraint satisfied with implemented mitigation measures.`
        );
      }
    } else if (this.required_mitigation.length > 0) {
      // Conditional approval if mitigation available
      this.setStatus(
        'conditional',
        `Conditional approval: Overall score ${this.biocentric_impact_score.overall.toFixed(1)}. ` +
        `Net harm of ${this.net_harm_calculation.net_impact.toFixed(2)} requires ` +
        `${this.required_mitigation.length} mitigation measure(s) to achieve zero net harm.`
      );
    } else {
      // Rejection
      const severity = this.biocentric_impact_score.overall <= -50 ? 'significant' : 'moderate';
      this.setStatus(
        'rejected',
        `Action rejected: ${severity} harm detected with overall score ` +
        `${this.biocentric_impact_score.overall.toFixed(1)}. Net harm of ` +
        `${this.net_harm_calculation.net_impact.toFixed(2)} violates zero net harm constraint. ` +
        `No sufficient mitigation measures available.`
      );
    }
    
    return this.status;
  }
}

// ============================================================================
// Assessment Functions
// ============================================================================

/**
 * Assess biodiversity impact
 */
function assessBiodiversityImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('biodiversity');
  
  // Native species population effects
  const habitatArea = action.scope.geographic?.radius_km ? 
    Math.PI * Math.pow(action.scope.geographic.radius_km, 2) : 
    (action.resources?.land_hectares || 0) / 100;
  
  const speciesImpact = -habitatArea * 2.5; // Negative impact per km²
  impact.addFactor('native_species_population', speciesImpact, 0.3);
  
  // Habitat quality and connectivity
  const habitatQuality = -habitatArea * 1.8;
  impact.addFactor('habitat_quality', habitatQuality, 0.3);
  
  // Invasive species risk
  const invasiveRisk = habitatArea > 0 ? -habitatArea * 0.5 : 0;
  impact.addFactor('invasive_species_risk', invasiveRisk, 0.2);
  
  // Genetic diversity preservation
  const geneticDiversity = -habitatArea * 1.2;
  impact.addFactor('genetic_diversity', geneticDiversity, 0.2);
  
  impact.calculateScore();
  impact.confidence = 0.80;
  impact.details = {
    habitat_area_km2: habitatArea,
    primary_concerns: habitatArea > 5 ? ['habitat_fragmentation', 'species_displacement'] : ['minimal_impact'],
    bioregion: action.scope.geographic?.bioregion || 'unspecified'
  };
  
  return impact;
}

/**
 * Assess water systems impact
 */
function assessWaterSystemsImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('waterSystems');
  
  // Water consumption
  const waterUse = action.resources?.water_liters || 0;
  const waterUseImpact = -waterUse / 100000; // Scale appropriately
  impact.addFactor('water_consumption', waterUseImpact, 0.25);
  
  // Watershed health
  const landDisturbance = action.resources?.land_hectares || 0;
  const watershedImpact = -landDisturbance * 0.8;
  impact.addFactor('watershed_health', watershedImpact, 0.25);
  
  // Water quality
  const waterQuality = waterUse > 0 ? -waterUse / 200000 : 0;
  impact.addFactor('water_quality', waterQuality, 0.25);
  
  // Aquatic ecosystem integrity
  const aquaticImpact = -(waterUse / 150000 + landDisturbance * 0.5);
  impact.addFactor('aquatic_ecosystem', aquaticImpact, 0.15);
  
  // Groundwater recharge capacity
  const rechargeImpact = -landDisturbance * 0.6;
  impact.addFactor('groundwater_recharge', rechargeImpact, 0.10);
  
  impact.calculateScore();
  impact.confidence = 0.78;
  impact.details = {
    water_use_liters: waterUse,
    land_disturbance_hectares: landDisturbance,
    primary_concerns: waterUse > 1000000 ? ['high_water_consumption', 'watershed_impact'] : ['low_impact']
  };
  
  return impact;
}

/**
 * Assess soil health impact
 */
function assessSoilHealthImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('soilHealth');
  
  const landUse = action.resources?.land_hectares || 0;
  const durationYears = action.scope.temporal?.duration_years || 1;
  
  // Organic matter content
  const organicMatter = -landUse * durationYears * 0.3;
  impact.addFactor('organic_matter', organicMatter, 0.30);
  
  // Microbial diversity
  const microbialDiversity = -landUse * durationYears * 0.25;
  impact.addFactor('microbial_diversity', microbialDiversity, 0.25);
  
  // Erosion rates
  const erosion = -landUse * 0.4;
  impact.addFactor('erosion_rates', erosion, 0.25);
  
  // Carbon sequestration capacity
  const sequestration = -landUse * durationYears * 0.2;
  impact.addFactor('carbon_sequestration', sequestration, 0.20);
  
  impact.calculateScore();
  impact.confidence = 0.82;
  impact.details = {
    land_use_hectares: landUse,
    duration_years: durationYears,
    soil_disturbance_level: landUse > 10 ? 'high' : landUse > 2 ? 'medium' : 'low'
  };
  
  return impact;
}

/**
 * Assess air quality impact
 */
function assessAirQualityImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('airQuality');
  
  const energyUse = action.resources?.energy_kwh || 0;
  const durationYears = action.scope.temporal?.duration_years || 1;
  
  // Emissions (GHG and other pollutants)
  const emissions = -energyUse * durationYears * 0.5 / 1000; // Simplified emission factor
  impact.addFactor('emissions', emissions, 0.40);
  
  // Local air quality impacts
  const localAirQuality = -energyUse * 0.3 / 1000;
  impact.addFactor('local_air_quality', localAirQuality, 0.35);
  
  // Microclimate effects
  const landUse = action.resources?.land_hectares || 0;
  const microclimate = -landUse * 0.15;
  impact.addFactor('microclimate', microclimate, 0.25);
  
  impact.calculateScore();
  impact.confidence = 0.75;
  impact.details = {
    energy_use_kwh: energyUse,
    duration_years: durationYears,
    emission_sources: energyUse > 0 ? ['energy_consumption'] : ['none'],
    air_quality_category: emissions < -10 ? 'high_impact' : emissions < -2 ? 'medium_impact' : 'low_impact'
  };
  
  return impact;
}

/**
 * Assess carbon cycle impact
 */
function assessCarbonCycleImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('carbonCycle');
  
  const energyUse = action.resources?.energy_kwh || 0;
  const landUse = action.resources?.land_hectares || 0;
  const durationYears = action.scope.temporal?.duration_years || 1;
  
  // Net carbon emissions/sequestration
  const emissionFactor = 0.5; // kg CO2 per kWh (grid average)
  const emissions = energyUse * durationYears * emissionFactor;
  const landSequestration = landUse * 10 * durationYears; // Assume some sequestration per hectare-year
  const netCarbon = -(emissions / 1000 - landSequestration / 1000); // Convert to appropriate scale
  impact.addFactor('net_carbon', netCarbon, 0.40);
  
  // Long-term carbon storage
  const storage = landUse > 0 ? landUse * 0.5 : -energyUse / 10000;
  impact.addFactor('carbon_storage', storage, 0.30);
  
  // Feedback loop impacts
  const feedbackLoops = netCarbon < -5 ? netCarbon * 0.1 : 0;
  impact.addFactor('feedback_loops', feedbackLoops, 0.30);
  
  impact.calculateScore();
  impact.confidence = 0.77;
  impact.details = {
    gross_emissions_kg_co2: emissions,
    sequestration_potential_kg_co2: landSequestration,
    net_carbon_kg_co2: emissions - landSequestration,
    carbon_footprint_category: (emissions - landSequestration) > 10000 ? 'high' : 
                                (emissions - landSequestration) > 1000 ? 'medium' : 'low'
  };
  
  return impact;
}

/**
 * Assess regeneration capacity impact
 */
function assessRegenerationCapacityImpact(action, bioregionalContext) {
  const impact = new DimensionImpact('regenerationCapacity');
  
  const landUse = action.resources?.land_hectares || 0;
  const durationYears = action.scope.temporal?.duration_years || 1;
  
  // Ecosystem resilience
  const resilience = -landUse * durationYears * 0.4;
  impact.addFactor('ecosystem_resilience', resilience, 0.30);
  
  // Recovery time from disturbance
  const recoveryImpact = -landUse * Math.log(durationYears + 1) * 0.8;
  impact.addFactor('recovery_time', recoveryImpact, 0.25);
  
  // Self-organization potential
  const selfOrganization = -landUse * 0.5;
  impact.addFactor('self_organization', selfOrganization, 0.25);
  
  // Adaptive capacity
  const adaptiveCapacity = -landUse * durationYears * 0.3;
  impact.addFactor('adaptive_capacity', adaptiveCapacity, 0.20);
  
  impact.calculateScore();
  impact.confidence = 0.72;
  impact.details = {
    land_use_hectares: landUse,
    duration_years: durationYears,
    disturbance_intensity: landUse * durationYears > 50 ? 'high' : 
                           landUse * durationYears > 10 ? 'medium' : 'low',
    estimated_recovery_years: Math.min(100, landUse * durationYears * 2)
  };
  
  return impact;
}

/**
 * Generate mitigation measures based on dimension impacts
 */
function generateMitigationMeasures(dimensionImpacts, overallScore) {
  const mitigationMeasures = [];
  
  // Check each dimension for significant negative impact
  for (const [dimension, impact] of Object.entries(dimensionImpacts)) {
    if (impact.score < -20) {
      switch (dimension) {
        case 'biodiversity':
          mitigationMeasures.push(new MitigationMeasure(
            'Habitat restoration or protection offset program',
            Math.abs(impact.score) * 0.6,
            'Before action commencement'
          ));
          break;
        
        case 'waterSystems':
          mitigationMeasures.push(new MitigationMeasure(
            'Water conservation measures and watershed protection',
            Math.abs(impact.score) * 0.5,
            'Within first 3 months of operation'
          ));
          break;
        
        case 'soilHealth':
          mitigationMeasures.push(new MitigationMeasure(
            'Soil regeneration program with cover crops and composting',
            Math.abs(impact.score) * 0.7,
            'Within first 6 months'
          ));
          break;
        
        case 'airQuality':
          mitigationMeasures.push(new MitigationMeasure(
            'Emission reduction through efficiency improvements or offsets',
            Math.abs(impact.score) * 0.5,
            'Within first year of operation'
          ));
          break;
        
        case 'carbonCycle':
          mitigationMeasures.push(new MitigationMeasure(
            'Carbon sequestration program or renewable energy transition',
            Math.abs(impact.score) * 0.6,
            'Within 6 months'
          ));
          break;
        
        case 'regenerationCapacity':
          mitigationMeasures.push(new MitigationMeasure(
            'Ecosystem regeneration support with native species restoration',
            Math.abs(impact.score) * 0.5,
            'Before and during operation'
          ));
          break;
      }
    }
  }
  
  return mitigationMeasures;
}

/**
 * Generate monitoring requirements based on assessment
 */
function generateMonitoringRequirements(action, dimensionImpacts, overallScore) {
  const requirements = [];
  
  // Always monitor baseline ecosystem health
  requirements.push(new MonitoringRequirement(
    'ecosystem_health_index',
    'quarterly',
    'operational_lifetime'
  ));
  
  // Monitor dimensions with significant impact
  for (const [dimension, impact] of Object.entries(dimensionImpacts)) {
    if (Math.abs(impact.score) > 15) {
      switch (dimension) {
        case 'biodiversity':
          requirements.push(new MonitoringRequirement(
            'biodiversity_indicators',
            'semi-annually',
            'operational_lifetime_plus_5_years'
          ));
          break;
        
        case 'waterSystems':
          requirements.push(new MonitoringRequirement(
            'water_quality_and_availability',
            'monthly',
            'operational_lifetime'
          ));
          break;
        
        case 'soilHealth':
          requirements.push(new MonitoringRequirement(
            'soil_health_metrics',
            'annually',
            'operational_lifetime_plus_10_years'
          ));
          break;
        
        case 'airQuality':
          requirements.push(new MonitoringRequirement(
            'air_quality_measurements',
            'monthly',
            'operational_lifetime'
          ));
          break;
        
        case 'carbonCycle':
          requirements.push(new MonitoringRequirement(
            'carbon_emissions_and_sequestration',
            'monthly',
            'operational_lifetime'
          ));
          break;
        
        case 'regenerationCapacity':
          requirements.push(new MonitoringRequirement(
            'ecosystem_recovery_indicators',
            'annually',
            'operational_lifetime_plus_20_years'
          ));
          break;
      }
    }
  }
  
  return requirements;
}

/**
 * Calculate ecosystem integrity baseline and projection
 */
function calculateEcosystemIntegrity(dimensionImpacts, bioregionalContext) {
  const integrity = new EcosystemIntegrity();
  
  // Set baseline from bioregional context or use default
  integrity.setBaseline(bioregionalContext?.current_baseline || 75);
  
  // Calculate projected impact as weighted average of dimension scores
  const scores = Object.values(dimensionImpacts).map(d => d.score);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  integrity.setProjectedImpact(avgScore);
  
  // Calculate confidence as average of dimension confidences
  const confidences = Object.values(dimensionImpacts).map(d => d.confidence);
  const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  integrity.setConfidence(avgConfidence);
  
  return integrity;
}

/**
 * Main assessment function
 * Performs complete biocentric impact assessment
 * 
 * @param {AssessmentRequest} request - Assessment request
 * @param {Object} options - Additional options
 * @returns {AssessmentResponse}
 */
function performBiocentricImpactAssessment(request, options = {}) {
  // Validate request
  request.validate();
  
  // Create response
  const response = new AssessmentResponse(request.assessment_id);
  
  // Get bioregional context
  const bioregionalContext = request.bioregional_context || options.bioregionalContext || {};
  
  // Get action
  const action = request.getAction();
  
  try {
    // Assess each dimension
    const dimensionImpacts = {
      biodiversity: assessBiodiversityImpact(action, bioregionalContext),
      waterSystems: assessWaterSystemsImpact(action, bioregionalContext),
      soilHealth: assessSoilHealthImpact(action, bioregionalContext),
      airQuality: assessAirQualityImpact(action, bioregionalContext),
      carbonCycle: assessCarbonCycleImpact(action, bioregionalContext),
      regenerationCapacity: assessRegenerationCapacityImpact(action, bioregionalContext)
    };
    
    // Store dimension details
    response.dimension_details = dimensionImpacts;
    
    // Set dimension scores in response
    for (const [dimension, impact] of Object.entries(dimensionImpacts)) {
      response.biocentric_impact_score.setDimensionScore(dimension, impact.score);
    }
    
    // Calculate overall score
    response.biocentric_impact_score.calculateOverall();
    
    // Calculate ecosystem integrity
    response.ecosystem_integrity = calculateEcosystemIntegrity(dimensionImpacts, bioregionalContext);
    
    // Check for insufficient data
    if (!action.scope.geographic || !action.resources) {
      response.setStatus(
        'insufficient_data',
        'Insufficient geographic scope or resource data for reliable assessment. ' +
        'Additional baseline surveys or data collection required.'
      );
      return response;
    }
    
    // Generate mitigation measures if needed
    if (response.biocentric_impact_score.overall < 0) {
      const mitigationMeasures = generateMitigationMeasures(
        dimensionImpacts,
        response.biocentric_impact_score.overall
      );
      mitigationMeasures.forEach(m => response.addMitigation(m));
    }
    
    // Generate monitoring requirements
    const monitoringRequirements = generateMonitoringRequirements(
      action,
      dimensionImpacts,
      response.biocentric_impact_score.overall
    );
    monitoringRequirements.forEach(r => response.addMonitoring(r));
    
    // Make final decision
    response.makeDecision();
    
  } catch (error) {
    response.setStatus(
      'insufficient_data',
      `Assessment error: ${error.message}`
    );
  }
  
  return response;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique assessment ID
 */
function generateAssessmentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `biocentric-${timestamp}-${random}`;
}

/**
 * Get bioregion baseline data
 * In production, this would query the bioregional data integration system
 */
function getBioregionBaseline(bioregionId) {
  // Placeholder implementation
  return {
    bioregion_id: bioregionId,
    current_baseline: 75,
    last_updated: new Date().toISOString(),
    data_sources: ['placeholder'],
    confidence: 0.75
  };
}

/**
 * Get historical assessment data
 * In production, this would query the assessment database
 */
function getHistoricalAssessments(filters = {}) {
  // Placeholder implementation
  return {
    assessments: [],
    total_count: 0,
    filters: filters
  };
}

/**
 * Get monitoring data for an assessment
 * In production, this would query the monitoring system
 */
function getMonitoringData(assessmentId) {
  // Placeholder implementation
  return {
    assessment_id: assessmentId,
    status: 'monitoring_active',
    compliance_status: 'compliant',
    last_updated: new Date().toISOString(),
    metrics: []
  };
}

// ============================================================================
// API Endpoint Simulation Functions
// ============================================================================

/**
 * POST /api/v1/biocentric/assess
 * Perform biocentric impact assessment
 */
function apiAssess(requestData) {
  const request = new AssessmentRequest(requestData);
  return performBiocentricImpactAssessment(request);
}

/**
 * GET /api/v1/biocentric/monitor/{assessment_id}
 * Get monitoring data for an assessment
 */
function apiMonitor(assessmentId) {
  return getMonitoringData(assessmentId);
}

/**
 * GET /api/v1/biocentric/bioregion/{bioregion_id}
 * Get bioregional baseline data
 */
function apiBioregion(bioregionId) {
  return getBioregionBaseline(bioregionId);
}

/**
 * GET /api/v1/biocentric/history
 * Get historical assessment data
 */
function apiHistory(filters) {
  return getHistoricalAssessments(filters);
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
    root.BiocentricImpactAPI = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  return {
    // Configuration
    BIOCENTRIC_API_CONFIG,
    
    // Main assessment function
    performBiocentricImpactAssessment,
    
    // Data structures
    AssessmentRequest,
    AssessmentResponse,
    Action,
    BiocentricImpactScore,
    NetHarmCalculation,
    EcosystemIntegrity,
    MitigationMeasure,
    MonitoringRequirement,
    DimensionImpact,
    
    // Assessment functions
    assessBiodiversityImpact,
    assessWaterSystemsImpact,
    assessSoilHealthImpact,
    assessAirQualityImpact,
    assessCarbonCycleImpact,
    assessRegenerationCapacityImpact,
    
    // Helper functions
    generateAssessmentId,
    getBioregionBaseline,
    getHistoricalAssessments,
    getMonitoringData,
    
    // API endpoint simulation functions
    apiAssess,
    apiMonitor,
    apiBioregion,
    apiHistory
  };
}));
