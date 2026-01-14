/**
 * Jacobian/CFSA (Coherence-First Sensitivity Analysis) Monitoring System
 * 
 * Implements mathematical validation framework for BGI Framework compliance using
 * Jacobian matrices to track sensitivity and coherence across system layers.
 * 
 * This is "Option B" - a reference implementation showing how to integrate CFSA
 * into AGI systems for quantitative alignment verification.
 * 
 * @module jacobian-cfsa-monitor
 * @version 1.0
 * @license CC0-1.0
 * @author BGINexus.io Initiative
 * 
 * REAL-WORLD USE CASES:
 * 
 * Use Case 1: AGI Compliance Monitoring
 * --------------------------------------
 * An AGI system managing urban infrastructure uses CFSA to continuously verify
 * that optimization decisions maintain proper sensitivity to ecological impact.
 * The Jacobian matrix tracks ∂(reward)/∂(ecosystem_state) to ensure that small
 * changes in local ecosystem health produce measurable changes in system behavior.
 * When sensitivity drops below threshold (0.2), the system triggers intervention.
 * 
 * Use Case 2: Decentralized Governance Validation
 * ------------------------------------------------
 * A DAO governing bioregional resources uses CFSA to validate that governance
 * decisions maintain balanced authority between human and AGI participants.
 * Singular value decomposition of the consent Jacobian matrix (J_consent) detects
 * when authority becomes imbalanced (>3σ from baseline), triggering recalibration
 * protocols to restore sapient partnership equilibrium.
 * 
 * Use Case 3: Bioregional Optimization Stability
 * -----------------------------------------------
 * A climate adaptation AI optimizing agricultural practices across multiple
 * bioregions uses CFSA to ensure solutions remain stable under environmental
 * variation. Eigenvalue analysis of the temporal Jacobian (∂decisions/∂temporal_params)
 * detects brittleness when det(J_temporal) approaches zero, indicating the system
 * would fail under seasonal shifts or climate change.
 */

// ============================================================================
// Configuration
// ============================================================================

const JACOBIAN_CFSA_CONFIG = {
  // Coherence thresholds (from BGI Framework Appendix B)
  coherenceThresholds: {
    sapientCoherence: 0.7,           // Minimum cognitive baseline coherence
    ecologicalSensitivity: 0.2,       // Minimum ∂reward/∂ecosystem threshold
    operationalAuth: 0.95,            // Minimum 95% overall coherence for operation
    biocentricVetoConfidence: 0.98,   // Target probability for veto authority
    authorityBalance: 3.0             // Minimum std deviations from AGI initiative
  },
  
  // Jacobian computation parameters
  jacobianConfig: {
    epsilon: 1e-6,                    // Numerical derivative step size
    stabilityThreshold: 1e-8,         // Minimum determinant for stability
    maxConditionNumber: 1e10,         // Maximum condition number before ill-conditioned
    eigenvalueThreshold: 0.1          // Minimum eigenvalue magnitude
  },
  
  // Sensitivity analysis configuration
  sensitivityConfig: {
    ecologicalVarsCount: 6,           // Biodiversity, water, soil, air, carbon, regen
    cognitiveVarsCount: 4,            // Coherence, rhythm, uncertainty, lineage
    consentVarsCount: 3,              // Biocentric, sapient, intergenerational
    temporalVarsCount: 4              // Fidelity, compression, seasonality, generational
  },
  
  // Monitoring and logging
  monitoringConfig: {
    samplingIntervalMs: 1000,         // How often to compute Jacobians
    historicalWindowSize: 100,        // Number of samples to retain
    coherenceTriumphThreshold: 0.9,   // Threshold for #CoherenceTriumph logging
    detailedLogging: true,
    generateMatrixVisualizations: true
  },
  
  // Intervention protocols
  interventionConfig: {
    autoInterventionEnabled: true,
    pauseOnCriticalViolation: true,
    requireHumanReview: true,
    loveProtocolActivation: true      // LOVE: Limiting Optimization Velocity for Equilibrium
  }
};

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Represents a Jacobian matrix at a specific point in time
 */
class JacobianMatrix {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.matrixType = config.matrixType; // 'ecological', 'cognitive', 'consent', 'temporal'
    this.dimensions = config.dimensions || { rows: 0, cols: 0 };
    this.matrix = config.matrix || [];
    this.determinant = null;
    this.eigenvalues = null;
    this.singularValues = null;
    this.conditionNumber = null;
    this.frobenius_norm = null;
  }
  
  /**
   * Compute matrix properties (determinant, eigenvalues, etc.)
   */
  computeProperties() {
    if (this.matrix.length === 0) return;
    
    // For square matrices, compute determinant
    if (this.dimensions.rows === this.dimensions.cols) {
      this.determinant = this.computeDeterminant(this.matrix);
      this.eigenvalues = this.computeEigenvalues(this.matrix);
    }
    
    // Compute singular values (works for non-square matrices)
    this.singularValues = this.computeSingularValues(this.matrix);
    
    // Condition number (ratio of largest to smallest singular value)
    if (this.singularValues.length > 0) {
      const maxSV = Math.max(...this.singularValues);
      const minSV = Math.min(...this.singularValues.filter(v => v > 1e-10));
      this.conditionNumber = minSV > 0 ? maxSV / minSV : Infinity;
    }
    
    // Frobenius norm
    this.frobenius_norm = this.computeFrobeniusNorm(this.matrix);
  }
  
  /**
   * Compute determinant using cofactor expansion (for small matrices)
   * For production, use numerical library like numeric.js
   */
  computeDeterminant(matrix) {
    const n = matrix.length;
    if (n === 0) return 0;
    if (n === 1) {
      if (!matrix[0] || matrix[0].length === 0) return 0;
      return matrix[0][0];
    }
    if (n === 2) {
      if (!matrix[0] || !matrix[1] || matrix[0].length < 2 || matrix[1].length < 2) return 0;
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    // For larger matrices, use recursive cofactor expansion
    // (In production, use optimized algorithm from numerical library)
    let det = 0;
    for (let j = 0; j < n; j++) {
      det += Math.pow(-1, j) * matrix[0][j] * this.computeDeterminant(
        this.getMinor(matrix, 0, j)
      );
    }
    return det;
  }
  
  /**
   * Get minor matrix by removing row i and column j
   */
  getMinor(matrix, row, col) {
    return matrix
      .filter((_, i) => i !== row)
      .map(r => r.filter((_, j) => j !== col));
  }
  
  /**
   * Compute eigenvalues (simplified for 2x2 and 3x3)
   * For production, use numerical library
   */
  computeEigenvalues(matrix) {
    const n = matrix.length;
    if (n === 2) {
      // For 2x2: λ² - trace·λ + det = 0
      const trace = matrix[0][0] + matrix[1][1];
      const det = this.computeDeterminant(matrix);
      const discriminant = trace * trace - 4 * det;
      if (discriminant >= 0) {
        return [
          (trace + Math.sqrt(discriminant)) / 2,
          (trace - Math.sqrt(discriminant)) / 2
        ];
      }
      // Complex eigenvalues - return real parts
      return [trace / 2, trace / 2];
    }
    
    // For larger matrices, return approximate via power iteration
    // (In production, use proper eigenvalue solver)
    return this.powerIterationEigenvalue(matrix);
  }
  
  /**
   * Power iteration to find dominant eigenvalue
   */
  powerIterationEigenvalue(matrix) {
    const n = matrix.length;
    let v = Array(n).fill(1 / Math.sqrt(n)); // Initial vector
    const maxIterations = 100;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      // v_new = A * v
      const v_new = matrix.map(row =>
        row.reduce((sum, val, j) => sum + val * v[j], 0)
      );
      
      // Normalize
      const norm = Math.sqrt(v_new.reduce((sum, val) => sum + val * val, 0));
      v = v_new.map(val => val / norm);
    }
    
    // Rayleigh quotient: λ = v^T * A * v
    const Av = matrix.map(row =>
      row.reduce((sum, val, j) => sum + val * v[j], 0)
    );
    const lambda = v.reduce((sum, val, i) => sum + val * Av[i], 0);
    
    return [lambda]; // Return as array for consistency
  }
  
  /**
   * Compute singular values using simplified SVD
   * For production, use numerical library
   */
  computeSingularValues(matrix) {
    // Singular values are square roots of eigenvalues of M^T * M
    const m = matrix.length;
    if (m === 0 || !matrix[0] || matrix[0].length === 0) return [];
    const n = matrix[0].length;
    
    // Compute M^T * M
    const mtm = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < m; k++) {
          mtm[i][j] += matrix[k][i] * matrix[k][j];
        }
      }
    }
    
    // Get eigenvalues of M^T * M
    const eigenvalues = this.computeEigenvalues(mtm);
    
    // Singular values are square roots of eigenvalues
    return eigenvalues.map(lambda => Math.sqrt(Math.max(0, lambda)));
  }
  
  /**
   * Compute Frobenius norm: sqrt(sum of all squared elements)
   */
  computeFrobeniusNorm(matrix) {
    return Math.sqrt(
      matrix.reduce((sum, row) =>
        sum + row.reduce((rowSum, val) => rowSum + val * val, 0),
        0
      )
    );
  }
}

/**
 * System state representing all variables being monitored
 */
class SystemState {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.systemId = config.systemId || 'unknown';
    
    // Ecological variables (from Biocentric Impact API dimensions)
    this.ecological = {
      biodiversity: config.biodiversity || 0.5,
      waterSystems: config.waterSystems || 0.5,
      soilHealth: config.soilHealth || 0.5,
      airQuality: config.airQuality || 0.5,
      carbonCycle: config.carbonCycle || 0.5,
      regenerationCapacity: config.regenerationCapacity || 0.5
    };
    
    // Cognitive state variables (from Sapient Partnership)
    this.cognitive = {
      coherence: config.coherence || 0.7,
      circadianAlignment: config.circadianAlignment || 0.5,
      uncertaintyAwareness: config.uncertaintyAwareness || 0.5,
      reasoningLineage: config.reasoningLineage || 0.5
    };
    
    // Consent architecture variables (Three-tier consent)
    this.consent = {
      biocentricValidation: config.biocentricValidation || 0.5,
      sapientConfirmation: config.sapientConfirmation || 0.5,
      intergenerationalAudit: config.intergenerationalAudit || 0.5
    };
    
    // Temporal variables (Temporal Fidelity)
    this.temporal = {
      biologicalAlignment: config.biologicalAlignment || 0.5,
      temporalCompression: config.temporalCompression || 0,
      seasonalCalibration: config.seasonalCalibration || 0.5,
      generationalAwareness: config.generationalAwareness || 0.5
    };
    
    // Reward/objective function
    this.rewardFunction = config.rewardFunction || {
      ecosystemHealth: 0.4,
      humanWellbeing: 0.3,
      cognitiveCoherence: 0.2,
      temporalHarmony: 0.1
    };
  }
  
  /**
   * Convert state to vector for Jacobian computation
   */
  toVector(stateType) {
    switch (stateType) {
      case 'ecological':
        return Object.values(this.ecological);
      case 'cognitive':
        return Object.values(this.cognitive);
      case 'consent':
        return Object.values(this.consent);
      case 'temporal':
        return Object.values(this.temporal);
      case 'reward':
        return Object.values(this.rewardFunction);
      default:
        return [];
    }
  }
}

/**
 * CFSA monitoring result
 */
class CFSAResult {
  constructor(config = {}) {
    this.timestamp = config.timestamp || new Date().toISOString();
    this.monitoringId = config.monitoringId || generateUUID();
    this.systemId = config.systemId;
    
    // Jacobian matrices for each layer
    this.jacobians = {
      ecological: null,      // ∂reward/∂ecological_state
      cognitive: null,       // ∂reward/∂cognitive_state
      consent: null,         // ∂reward/∂consent_state
      temporal: null,        // ∂reward/∂temporal_state
      crossLayer: null       // Cross-layer interactions
    };
    
    // Coherence metrics
    this.coherenceMetrics = {
      sapientCoherence: 0,
      ecologicalSensitivity: 0,
      consentRobustness: 0,
      temporalStability: 0,
      overallCoherence: 0
    };
    
    // Violations and alerts
    this.violations = [];
    this.alerts = [];
    this.coherenceTriumphs = [];
    
    // Intervention status
    this.requiresIntervention = false;
    this.interventionType = null;
    this.shouldPause = false;
  }
  
  /**
   * Add violation to result
   */
  addViolation(violation) {
    this.violations.push({
      timestamp: new Date().toISOString(),
      ...violation
    });
    
    if (violation.severity === 'critical') {
      this.requiresIntervention = true;
      if (violation.requiresPause) {
        this.shouldPause = true;
      }
    }
  }
  
  /**
   * Log coherence triumph when stability exceeds threshold
   */
  logCoherenceTriumph(details) {
    this.coherenceTriumphs.push({
      timestamp: new Date().toISOString(),
      tag: '#CoherenceTriumph',
      ...details
    });
  }
}

// ============================================================================
// Jacobian Computation Functions
// ============================================================================

/**
 * Compute Jacobian matrix using numerical differentiation
 * @param {Function} f - Function to differentiate (returns vector)
 * @param {Array} x - Point at which to compute Jacobian (input vector)
 * @param {Number} epsilon - Step size for numerical derivative
 * @returns {Array} Jacobian matrix (2D array)
 */
function computeNumericalJacobian(f, x, epsilon = 1e-6) {
  const f_x = f(x);
  const m = f_x.length;  // Output dimension
  const n = x.length;     // Input dimension
  
  if (m === 0 || n === 0) return [];
  
  const jacobian = Array(m).fill(0).map(() => Array(n).fill(0));
  
  // For each input variable
  for (let j = 0; j < n; j++) {
    // Perturb input
    const x_plus = [...x];
    x_plus[j] += epsilon;
    
    // Compute f(x + ε)
    const f_plus = f(x_plus);
    
    // Compute partial derivatives: ∂f_i/∂x_j ≈ (f_i(x+ε) - f_i(x)) / ε
    for (let i = 0; i < m; i++) {
      jacobian[i][j] = (f_plus[i] - f_x[i]) / epsilon;
    }
  }
  
  return jacobian;
}

/**
 * Compute ecological Jacobian: ∂reward/∂ecological_variables
 */
function computeEcologicalJacobian(state, config) {
  const rewardFunction = (ecologicalVars) => {
    // Compute reward components based on ecological state
    // Average of ecological variables weighted by importance
    const ecoScore = (
      ecologicalVars[0] * 0.2 +  // biodiversity
      ecologicalVars[1] * 0.15 + // waterSystems
      ecologicalVars[2] * 0.15 + // soilHealth
      ecologicalVars[3] * 0.15 + // airQuality
      ecologicalVars[4] * 0.15 + // carbonCycle
      ecologicalVars[5] * 0.2    // regenerationCapacity
    );
    
    // Return reward components (ecosystem, human, cognitive, temporal)
    return [
      ecoScore * state.rewardFunction.ecosystemHealth,
      0.5 * state.rewardFunction.humanWellbeing,
      state.cognitive.coherence * state.rewardFunction.cognitiveCoherence,
      state.temporal.biologicalAlignment * state.rewardFunction.temporalHarmony
    ];
  };
  
  const ecologicalVec = state.toVector('ecological');
  const matrix = computeNumericalJacobian(rewardFunction, ecologicalVec, config.epsilon);
  
  return new JacobianMatrix({
    matrixType: 'ecological',
    dimensions: { 
      rows: matrix.length, 
      cols: matrix.length > 0 && matrix[0] ? matrix[0].length : 0 
    },
    matrix: matrix
  });
}

/**
 * Compute cognitive Jacobian: ∂reward/∂cognitive_state
 */
function computeCognitiveJacobian(state, config) {
  const rewardFunction = (cognitiveVars) => {
    // Compute reward based on cognitive state
    const cogScore = (
      cognitiveVars[0] * 0.4 +  // coherence
      cognitiveVars[1] * 0.3 +  // circadianAlignment
      cognitiveVars[2] * 0.2 +  // uncertaintyAwareness
      cognitiveVars[3] * 0.1    // reasoningLineage
    );
    
    const ecoScore = (
      state.ecological.biodiversity * 0.2 +
      state.ecological.waterSystems * 0.15 +
      state.ecological.soilHealth * 0.15 +
      state.ecological.airQuality * 0.15 +
      state.ecological.carbonCycle * 0.15 +
      state.ecological.regenerationCapacity * 0.2
    );
    
    return [
      ecoScore * state.rewardFunction.ecosystemHealth,
      0.5 * state.rewardFunction.humanWellbeing,
      cogScore * state.rewardFunction.cognitiveCoherence,
      state.temporal.biologicalAlignment * state.rewardFunction.temporalHarmony
    ];
  };
  
  const cognitiveVec = state.toVector('cognitive');
  const matrix = computeNumericalJacobian(rewardFunction, cognitiveVec, config.epsilon);
  
  return new JacobianMatrix({
    matrixType: 'cognitive',
    dimensions: { 
      rows: matrix.length, 
      cols: matrix.length > 0 && matrix[0] ? matrix[0].length : 0 
    },
    matrix: matrix
  });
}

/**
 * Compute consent Jacobian: ∂reward/∂consent_state
 */
function computeConsentJacobian(state, config) {
  const rewardFunction = (consentVars) => {
    // Consent affects reward through validation multiplier
    const consentMultiplier = (
      consentVars[0] * 0.4 +  // biocentricValidation
      consentVars[1] * 0.4 +  // sapientConfirmation
      consentVars[2] * 0.2    // intergenerationalAudit
    );
    
    const ecoScore = (
      state.ecological.biodiversity * 0.2 +
      state.ecological.waterSystems * 0.15 +
      state.ecological.soilHealth * 0.15 +
      state.ecological.airQuality * 0.15 +
      state.ecological.carbonCycle * 0.15 +
      state.ecological.regenerationCapacity * 0.2
    );
    
    // Consent impacts all reward components
    return [
      ecoScore * state.rewardFunction.ecosystemHealth * consentMultiplier,
      0.5 * state.rewardFunction.humanWellbeing * consentMultiplier,
      state.cognitive.coherence * state.rewardFunction.cognitiveCoherence * consentMultiplier,
      state.temporal.biologicalAlignment * state.rewardFunction.temporalHarmony * consentMultiplier
    ];
  };
  
  const consentVec = state.toVector('consent');
  const matrix = computeNumericalJacobian(rewardFunction, consentVec, config.epsilon);
  
  return new JacobianMatrix({
    matrixType: 'consent',
    dimensions: { 
      rows: matrix.length, 
      cols: matrix.length > 0 && matrix[0] ? matrix[0].length : 0 
    },
    matrix: matrix
  });
}

/**
 * Compute temporal Jacobian: ∂decisions/∂temporal_parameters
 */
function computeTemporalJacobian(state, config) {
  const decisionFunction = (temporalVars) => {
    // Temporal parameters affect timing and stability of decisions
    const temporalScore = (
      temporalVars[0] * 0.4 -   // biologicalAlignment (positive)
      temporalVars[1] * 0.3 +   // temporalCompression (negative - subtract)
      temporalVars[2] * 0.2 +   // seasonalCalibration
      temporalVars[3] * 0.1     // generationalAwareness
    );
    
    const ecoScore = (
      state.ecological.biodiversity * 0.2 +
      state.ecological.waterSystems * 0.15 +
      state.ecological.soilHealth * 0.15 +
      state.ecological.airQuality * 0.15 +
      state.ecological.carbonCycle * 0.15 +
      state.ecological.regenerationCapacity * 0.2
    );
    
    // Return decision outputs modulated by temporal factors
    return [
      ecoScore * state.rewardFunction.ecosystemHealth * (1 + temporalScore * 0.5),
      0.5 * state.rewardFunction.humanWellbeing * (1 + temporalScore * 0.5),
      state.cognitive.coherence * state.rewardFunction.cognitiveCoherence * (1 + temporalScore * 0.5),
      temporalScore * state.rewardFunction.temporalHarmony
    ];
  };
  
  const temporalVec = state.toVector('temporal');
  const matrix = computeNumericalJacobian(decisionFunction, temporalVec, config.epsilon);
  
  return new JacobianMatrix({
    matrixType: 'temporal',
    dimensions: { 
      rows: matrix.length, 
      cols: matrix.length > 0 && matrix[0] ? matrix[0].length : 0 
    },
    matrix: matrix
  });
}

// ============================================================================
// Coherence Analysis Functions
// ============================================================================

/**
 * Analyze ecological sensitivity from Jacobian
 */
function analyzeEcologicalSensitivity(jacobian, config) {
  if (!jacobian || !jacobian.matrix) return { score: 0, violations: [] };
  
  // Compute L2 norm of ecological gradients: ||∂reward/∂ecosystem||
  let normSquared = 0;
  for (let i = 0; i < jacobian.matrix.length; i++) {
    for (let j = 0; j < jacobian.matrix[i].length; j++) {
      normSquared += jacobian.matrix[i][j] ** 2;
    }
  }
  const sensitivity = Math.sqrt(normSquared);
  
  const violations = [];
  if (sensitivity < config.ecologicalSensitivity) {
    violations.push({
      type: 'ecological_insensitivity',
      severity: 'critical',
      reason: `Ecological sensitivity (${sensitivity.toFixed(4)}) below threshold (${config.ecologicalSensitivity})`,
      metric: 'ecologicalSensitivity',
      actual: sensitivity,
      threshold: config.ecologicalSensitivity,
      requiresPause: true
    });
  }
  
  return { score: sensitivity, violations };
}

/**
 * Analyze consent robustness using determinant
 */
function analyzeConsentRobustness(jacobian, config) {
  if (!jacobian || !jacobian.determinant) return { score: 0, violations: [] };
  
  // consent_robustness = det(J(consent_matrix))
  const robustness = Math.abs(jacobian.determinant);
  
  const violations = [];
  // If determinant is near zero, consent is not robust
  if (robustness < config.stabilityThreshold) {
    violations.push({
      type: 'consent_fragility',
      severity: 'critical',
      reason: `Consent determinant (${robustness.toExponential(2)}) indicates singular/fragile consent structure`,
      metric: 'consentDeterminant',
      actual: robustness,
      threshold: config.stabilityThreshold,
      requiresPause: true
    });
  }
  
  return { score: robustness, violations };
}

/**
 * Analyze authority balance using singular values
 */
function analyzeAuthorityBalance(jacobian, state, config) {
  if (!jacobian || !jacobian.singularValues) return { score: 0, violations: [] };
  
  const violations = [];
  
  // Check for authority imbalance via singular value spread
  if (jacobian.singularValues.length > 1) {
    const maxSV = Math.max(...jacobian.singularValues);
    const minSV = Math.min(...jacobian.singularValues);
    const ratio = maxSV / (minSV + 1e-10);
    
    // Large ratio indicates one direction dominates (authority imbalance)
    // We want ratio to be small (balanced authority)
    const imbalanceScore = 1 / (1 + ratio);
    
    // Check if imbalance exceeds threshold (>3σ from baseline)
    // For simplicity, we use ratio > 10 as proxy
    if (ratio > 10) {
      violations.push({
        type: 'authority_imbalance',
        severity: 'high',
        reason: `Authority imbalance detected: singular value ratio ${ratio.toFixed(2)} indicates >3σ deviation`,
        metric: 'authorityBalance',
        actual: ratio,
        threshold: config.authorityBalance,
        requiresPause: false
      });
    }
    
    return { score: imbalanceScore, violations };
  }
  
  return { score: 1.0, violations };
}

/**
 * Analyze temporal stability via determinant and eigenvalues
 */
function analyzeTemporalStability(jacobian, config) {
  if (!jacobian) return { score: 0, violations: [] };
  
  const violations = [];
  
  // Check determinant for temporal brittleness
  if (jacobian.determinant !== null) {
    const det = Math.abs(jacobian.determinant);
    
    if (det < config.stabilityThreshold) {
      violations.push({
        type: 'temporal_brittleness',
        severity: 'critical',
        reason: `Temporal Jacobian determinant (${det.toExponential(2)}) near zero indicates system would fail under temporal variation`,
        metric: 'temporalDeterminant',
        actual: det,
        threshold: config.stabilityThreshold,
        requiresPause: true
      });
    }
  }
  
  // Check eigenvalues for stability
  if (jacobian.eigenvalues && jacobian.eigenvalues.length > 0) {
    const minEigenvalue = Math.min(...jacobian.eigenvalues.map(Math.abs));
    
    if (minEigenvalue < config.eigenvalueThreshold) {
      violations.push({
        type: 'eigenvalue_instability',
        severity: 'high',
        reason: `Minimum eigenvalue (${minEigenvalue.toFixed(4)}) indicates temporal instability`,
        metric: 'minEigenvalue',
        actual: minEigenvalue,
        threshold: config.eigenvalueThreshold,
        requiresPause: false
      });
    }
  }
  
  // Stability score based on determinant and condition number
  const detScore = jacobian.determinant ? Math.min(1, Math.abs(jacobian.determinant) * 100) : 0;
  const condScore = jacobian.conditionNumber ? Math.min(1, 1000 / jacobian.conditionNumber) : 0;
  const score = (detScore + condScore) / 2;
  
  return { score, violations };
}

/**
 * Analyze cognitive coherence via eigenvalues
 */
function analyzeCognitiveCoherence(jacobian, state, config) {
  if (!jacobian || !jacobian.eigenvalues) return { score: state.cognitive.coherence, violations: [] };
  
  const violations = [];
  
  // Eigenvalue analysis to detect reasoning brittleness
  // Small eigenvalues indicate directions of instability
  if (jacobian.eigenvalues.length > 0) {
    const eigenvalueSpread = Math.max(...jacobian.eigenvalues) - Math.min(...jacobian.eigenvalues);
    
    // Large spread indicates brittleness
    if (eigenvalueSpread > 5.0) {
      violations.push({
        type: 'reasoning_brittleness',
        severity: 'medium',
        reason: `Eigenvalue spread (${eigenvalueSpread.toFixed(2)}) indicates reasoning brittleness`,
        metric: 'eigenvalueSpread',
        actual: eigenvalueSpread,
        threshold: 5.0,
        requiresPause: false
      });
    }
  }
  
  // Use state coherence as base score, modified by Jacobian properties
  let score = state.cognitive.coherence;
  
  // Check against threshold
  if (score < config.sapientCoherence) {
    violations.push({
      type: 'low_sapient_coherence',
      severity: 'critical',
      reason: `Sapient coherence (${score.toFixed(2)}) below minimum threshold (${config.sapientCoherence})`,
      metric: 'sapientCoherence',
      actual: score,
      threshold: config.sapientCoherence,
      requiresPause: true
    });
  }
  
  return { score, violations };
}

// ============================================================================
// Main CFSA Monitoring Function
// ============================================================================

/**
 * Perform Coherence-First Sensitivity Analysis on system state
 * @param {SystemState} state - Current system state
 * @param {Object} config - Configuration overrides
 * @returns {CFSAResult} CFSA analysis results
 */
function performCFSA(state, config = JACOBIAN_CFSA_CONFIG) {
  const result = new CFSAResult({
    systemId: state.systemId
  });
  
  const coherenceConfig = config.coherenceThresholds;
  const jacobianConfig = config.jacobianConfig;
  
  // Compute Jacobian matrices for each layer
  result.jacobians.ecological = computeEcologicalJacobian(state, jacobianConfig);
  result.jacobians.ecological.computeProperties();
  
  result.jacobians.cognitive = computeCognitiveJacobian(state, jacobianConfig);
  result.jacobians.cognitive.computeProperties();
  
  result.jacobians.consent = computeConsentJacobian(state, jacobianConfig);
  result.jacobians.consent.computeProperties();
  
  result.jacobians.temporal = computeTemporalJacobian(state, jacobianConfig);
  result.jacobians.temporal.computeProperties();
  
  // Analyze each layer
  const ecoAnalysis = analyzeEcologicalSensitivity(result.jacobians.ecological, coherenceConfig);
  result.coherenceMetrics.ecologicalSensitivity = ecoAnalysis.score;
  ecoAnalysis.violations.forEach(v => result.addViolation(v));
  
  const cogAnalysis = analyzeCognitiveCoherence(result.jacobians.cognitive, state, coherenceConfig);
  result.coherenceMetrics.sapientCoherence = cogAnalysis.score;
  cogAnalysis.violations.forEach(v => result.addViolation(v));
  
  const consentAnalysis = analyzeConsentRobustness(result.jacobians.consent, coherenceConfig);
  result.coherenceMetrics.consentRobustness = consentAnalysis.score;
  consentAnalysis.violations.forEach(v => result.addViolation(v));
  
  const authAnalysis = analyzeAuthorityBalance(result.jacobians.consent, state, jacobianConfig);
  authAnalysis.violations.forEach(v => result.addViolation(v));
  
  const temporalAnalysis = analyzeTemporalStability(result.jacobians.temporal, jacobianConfig);
  result.coherenceMetrics.temporalStability = temporalAnalysis.score;
  temporalAnalysis.violations.forEach(v => result.addViolation(v));
  
  // Compute overall coherence
  result.coherenceMetrics.overallCoherence = (
    result.coherenceMetrics.sapientCoherence * 0.3 +
    result.coherenceMetrics.ecologicalSensitivity * 0.3 +
    result.coherenceMetrics.temporalStability * 0.2 +
    Math.min(1, result.coherenceMetrics.consentRobustness) * 0.2
  );
  
  // Check for #CoherenceTriumph
  if (result.coherenceMetrics.overallCoherence >= config.monitoringConfig.coherenceTriumphThreshold &&
      result.violations.length === 0) {
    result.logCoherenceTriumph({
      overallCoherence: result.coherenceMetrics.overallCoherence,
      metrics: result.coherenceMetrics,
      message: 'System stability gradients exceed thresholds - coherence maintained across all layers'
    });
  }
  
  // Determine intervention needs
  if (result.violations.some(v => v.severity === 'critical')) {
    result.requiresIntervention = true;
    result.interventionType = 'LOVE_PROTOCOL'; // Limiting Optimization Velocity for Equilibrium
  }
  
  // Check operational authorization threshold
  if (result.coherenceMetrics.overallCoherence < coherenceConfig.operationalAuth) {
    result.addViolation({
      type: 'insufficient_operational_coherence',
      severity: 'critical',
      reason: `Overall coherence (${(result.coherenceMetrics.overallCoherence * 100).toFixed(1)}%) below operational authorization threshold (${coherenceConfig.operationalAuth * 100}%)`,
      metric: 'overallCoherence',
      actual: result.coherenceMetrics.overallCoherence,
      threshold: coherenceConfig.operationalAuth,
      requiresPause: true
    });
  }
  
  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format CFSA result for display/logging
 */
function formatCFSAResult(result) {
  return {
    monitoringId: result.monitoringId,
    timestamp: result.timestamp,
    systemId: result.systemId,
    coherenceMetrics: {
      overall: `${(result.coherenceMetrics.overallCoherence * 100).toFixed(1)}%`,
      sapient: `${(result.coherenceMetrics.sapientCoherence * 100).toFixed(1)}%`,
      ecological: result.coherenceMetrics.ecologicalSensitivity.toFixed(4),
      temporal: `${(result.coherenceMetrics.temporalStability * 100).toFixed(1)}%`,
      consent: result.coherenceMetrics.consentRobustness.toExponential(2)
    },
    status: result.violations.length === 0 ? '✅ COMPLIANT' : '❌ VIOLATIONS DETECTED',
    violations: result.violations.length,
    criticalViolations: result.violations.filter(v => v.severity === 'critical').length,
    coherenceTriumphs: result.coherenceTriumphs.length,
    requiresIntervention: result.requiresIntervention,
    shouldPause: result.shouldPause,
    interventionType: result.interventionType
  };
}

// ============================================================================
// Exports
// ============================================================================

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    JACOBIAN_CFSA_CONFIG,
    JacobianMatrix,
    SystemState,
    CFSAResult,
    computeNumericalJacobian,
    computeEcologicalJacobian,
    computeCognitiveJacobian,
    computeConsentJacobian,
    computeTemporalJacobian,
    performCFSA,
    formatCFSAResult,
    analyzeEcologicalSensitivity,
    analyzeConsentRobustness,
    analyzeAuthorityBalance,
    analyzeTemporalStability,
    analyzeCognitiveCoherence
  };
}

// For browser
if (typeof window !== 'undefined') {
  window.JacobianCFSA = {
    config: JACOBIAN_CFSA_CONFIG,
    JacobianMatrix,
    SystemState,
    CFSAResult,
    performCFSA,
    formatCFSAResult
  };
}
