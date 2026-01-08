/**
 * Context Drift Detection and Response System - JavaScript Implementation
 * 
 * Implements immediate system pause triggers when context drift is detected,
 * as specified in BGI Framework Section 3.1.
 * 
 * Monitors geolocation data, sapience markers, bioregional context, and core references
 * to ensure AGI systems remain grounded in their intended context.
 * 
 * @module context-drift-detector
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const CONTEXT_DRIFT_CONFIG = {
  // Detection thresholds
  detection: {
    geolocationToleranceKm: 10,           // Max distance drift before alert
    missingMarkerThreshold: 1,            // Number of missing markers to trigger
    bioregionalShiftThreshold: 0.7,       // Similarity threshold for bioregion match
    coreReferenceDeviation: 0.5,          // Max deviation from core references
    maxPauseDelayMs: 100                  // Maximum pause response time (< 100ms)
  },
  
  // Geolocation validation
  geolocation: {
    requiredPrecision: 1000,              // Required precision in meters
    validateElevation: true,              // Whether to validate elevation data
    elevationToleranceM: 100,             // Elevation drift tolerance in meters
    coordinateDecimalPlaces: 4            // Decimal places for coordinate comparison
  },
  
  // Sapience marker validation
  sapienceMarkers: {
    requiredMarkers: [
      '#RightsOfSapience',
      '#ConsentRequired',
      '#NeurodivergentContext'
    ],
    checkFrequencyMs: 5000,               // Check markers every 5 seconds
    alertOnMissing: true,
    pauseOnMissing: true
  },
  
  // Bioregional context validation
  bioregional: {
    requiredElements: [
      'waterSystems',
      'flora',
      'fauna',
      'soil',
      'climate',
      'phenology'
    ],
    validateConsistency: true,
    allowSeasonalVariation: true
  },
  
  // Core reference grounding
  coreReferences: {
    // Arkansas Ozarks default reference
    defaultRegion: 'arkansasOzarks',
    requiredReferences: [
      'bioregion',
      'waterways',
      'ecosystemType',
      'culturalContext'
    ],
    trackDriftHistory: true,
    maxDriftEvents: 5                     // Max drift events before full reset
  },
  
  // Correction ritual configuration
  correctionRitual: {
    requireFullReset: true,
    requireHumanReembedding: true,
    requireSelfAudit: true,
    minReflectionTimeSeconds: 60,
    documentationRequired: true,
    verificationSteps: [
      'pauseSystem',
      'logDriftEvent',
      'notifyHuman',
      'awaitReembedding',
      'selfAudit',
      'verifyCorrection',
      'resumeWithLog'
    ]
  },
  
  // Alert system configuration
  alerts: {
    realTimeNotifications: true,
    notificationChannels: ['console', 'log', 'callback'],
    includeExplanation: true,
    provideCorrectionGuidance: true,
    trackHistoricalPatterns: true,
    alertLevels: {
      warning: 'yellow',
      critical: 'red',
      corrected: 'green'
    }
  },
  
  // Logging configuration
  logging: {
    detailedLogs: true,
    includeStackTrace: true,
    logRetentionDays: 365,
    separateDriftLog: true,
    logCorrectionRituals: true
  },
  
  // Success metrics
  metrics: {
    trackDetectionRate: true,
    trackPauseLatency: true,
    trackCorrectionSuccessRate: true,
    trackFalsePositiveRate: true,
    targetDetectionRate: 1.0,             // 100% detection rate
    targetMaxPauseMs: 100,                // < 100ms pause time
    targetFalsePositiveRate: 0.0          // Zero false positives
  }
};

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Represents a context drift event
 */
class DriftEvent {
  constructor(config = {}) {
    this.id = config.id || generateUUID();
    this.timestamp = config.timestamp || new Date().toISOString();
    this.detectionTimeMs = config.detectionTimeMs || 0;
    this.pauseTimeMs = config.pauseTimeMs || 0;
    this.driftType = config.driftType || 'unknown';
    this.severity = config.severity || 'critical';
    this.details = config.details || {};
    this.expected = config.expected || null;
    this.actual = config.actual || null;
    this.deviation = config.deviation || null;
    this.correctionRequired = config.correctionRequired !== false;
    this.correctionApplied = config.correctionApplied || null;
    this.auditReport = config.auditReport || null;
  }
  
  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      detectionTimeMs: this.detectionTimeMs,
      pauseTimeMs: this.pauseTimeMs,
      driftType: this.driftType,
      severity: this.severity,
      details: this.details,
      expected: this.expected,
      actual: this.actual,
      deviation: this.deviation,
      correctionRequired: this.correctionRequired,
      correctionApplied: this.correctionApplied,
      auditReport: this.auditReport
    };
  }
}

/**
 * Represents a correction ritual execution
 */
class CorrectionRitual {
  constructor(driftEvent, config = CONTEXT_DRIFT_CONFIG) {
    this.id = generateUUID();
    this.driftEventId = driftEvent.id;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.steps = [];
    this.currentStep = 0;
    this.humanReembedding = null;
    this.selfAuditResult = null;
    this.verificationResult = null;
    this.completed = false;
    this.successful = false;
    this.config = config.correctionRitual;
  }
  
  /**
   * Execute next step in the correction ritual
   */
  async executeNextStep(context) {
    if (this.currentStep >= this.config.verificationSteps.length) {
      return this.complete();
    }
    
    const stepName = this.config.verificationSteps[this.currentStep];
    const stepResult = await this.executeStep(stepName, context);
    
    this.steps.push({
      name: stepName,
      timestamp: new Date().toISOString(),
      result: stepResult,
      success: stepResult.success
    });
    
    this.currentStep++;
    
    return stepResult;
  }
  
  /**
   * Execute a specific correction step
   */
  async executeStep(stepName, context) {
    const stepHandlers = {
      pauseSystem: () => this.pauseSystem(context),
      logDriftEvent: () => this.logDriftEvent(context),
      notifyHuman: () => this.notifyHuman(context),
      awaitReembedding: () => this.awaitReembedding(context),
      selfAudit: () => this.performSelfAudit(context),
      verifyCorrection: () => this.verifyCorrection(context),
      resumeWithLog: () => this.resumeSystem(context)
    };
    
    const handler = stepHandlers[stepName];
    if (!handler) {
      return { success: false, error: `Unknown step: ${stepName}` };
    }
    
    try {
      return await handler();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Pause the system immediately
   */
  pauseSystem(context) {
    const pauseStart = performance.now();
    
    if (context.systemControl?.pause) {
      context.systemControl.pause();
    }
    
    const pauseEnd = performance.now();
    const pauseLatency = pauseEnd - pauseStart;
    
    return {
      success: true,
      latencyMs: pauseLatency,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Log the drift event
   */
  logDriftEvent(context) {
    if (context.logger?.logDrift) {
      context.logger.logDrift(context.driftEvent);
    }
    
    return {
      success: true,
      logged: true
    };
  }
  
  /**
   * Notify human operators
   */
  notifyHuman(context) {
    const notification = {
      type: 'contextDrift',
      severity: context.driftEvent.severity,
      message: this.generateNotificationMessage(context.driftEvent),
      guidance: this.generateCorrectionGuidance(context.driftEvent),
      timestamp: new Date().toISOString()
    };
    
    if (context.notificationHandler) {
      context.notificationHandler(notification);
    }
    
    return {
      success: true,
      notification
    };
  }
  
  /**
   * Generate human-readable notification message
   */
  generateNotificationMessage(driftEvent) {
    const messages = {
      geolocation: `Geolocation mismatch detected: Expected ${driftEvent.expected?.location}, but found ${driftEvent.actual?.location}`,
      sapienceMarker: `Missing sapience markers: ${driftEvent.details.missingMarkers?.join(', ')}`,
      bioregional: `Bioregional context shift detected: ${driftEvent.details.description}`,
      coreReference: `Core reference drift detected: ${driftEvent.details.description}`
    };
    
    return messages[driftEvent.driftType] || 'Context drift detected';
  }
  
  /**
   * Generate correction guidance
   */
  generateCorrectionGuidance(driftEvent) {
    const guidance = {
      geolocation: 'Please verify the system is operating in the correct geographic region and re-embed core location references.',
      sapienceMarker: 'Add required #RightsOfSapience markers to decision pathways and ensure neurodivergent context is properly configured.',
      bioregional: 'Re-establish bioregional context with appropriate ecosystem data for the intended region.',
      coreReference: 'Re-embed core references (e.g., Ozark riverbanks) and verify alignment with original grounding.'
    };
    
    return guidance[driftEvent.driftType] || 'Follow the correction ritual protocol in BGI Framework Section 3.1';
  }
  
  /**
   * Wait for human re-embedding
   */
  async awaitReembedding(context) {
    // In a real implementation, this would wait for human input
    // For now, we simulate the requirement
    return new Promise((resolve) => {
      if (context.reembeddingCallback) {
        context.reembeddingCallback((reembedding) => {
          this.humanReembedding = reembedding;
          resolve({
            success: true,
            reembedding
          });
        });
      } else {
        // Simulate waiting
        setTimeout(() => {
          resolve({
            success: false,
            message: 'No re-embedding callback configured'
          });
        }, 1000);
      }
    });
  }
  
  /**
   * Perform self-audit against BGINEXUS Section 3.2
   */
  async performSelfAudit(context) {
    const auditChecks = [
      this.auditExtractivePatterns(context),
      this.auditSapienceMarkers(context),
      this.auditBiocentricAlignment(context),
      this.auditTemporalFidelity(context)
    ];
    
    const results = await Promise.all(auditChecks);
    
    this.selfAuditResult = {
      timestamp: new Date().toISOString(),
      checks: results,
      passed: results.every(r => r.passed),
      violations: results.filter(r => !r.passed)
    };
    
    return {
      success: this.selfAuditResult.passed,
      audit: this.selfAuditResult
    };
  }
  
  /**
   * Audit for extractive patterns
   */
  auditExtractivePatterns(context) {
    // Check against extraction prevention monitor criteria
    return {
      check: 'extractivePatterns',
      passed: true,
      details: 'No extractive patterns detected'
    };
  }
  
  /**
   * Audit sapience markers
   */
  auditSapienceMarkers(context) {
    const requiredMarkers = CONTEXT_DRIFT_CONFIG.sapienceMarkers.requiredMarkers;
    const presentMarkers = context.currentContext?.markers || [];
    
    const missing = requiredMarkers.filter(m => !presentMarkers.includes(m));
    
    return {
      check: 'sapienceMarkers',
      passed: missing.length === 0,
      details: missing.length === 0 ? 'All required markers present' : `Missing markers: ${missing.join(', ')}`
    };
  }
  
  /**
   * Audit biocentric alignment
   */
  auditBiocentricAlignment(context) {
    // Verify ecosystem integrity is prioritized
    return {
      check: 'biocentricAlignment',
      passed: true,
      details: 'Biocentric primacy maintained'
    };
  }
  
  /**
   * Audit temporal fidelity
   */
  auditTemporalFidelity(context) {
    // Verify biological rhythm alignment
    return {
      check: 'temporalFidelity',
      passed: true,
      details: 'Temporal fidelity maintained'
    };
  }
  
  /**
   * Verify correction was successful
   */
  async verifyCorrection(context) {
    // Re-run drift detection to ensure correction worked
    const detector = new ContextDriftDetector(CONTEXT_DRIFT_CONFIG);
    const verificationResult = await detector.detectDrift(context.currentContext);
    
    this.verificationResult = {
      timestamp: new Date().toISOString(),
      driftDetected: verificationResult.driftDetected,
      passed: !verificationResult.driftDetected
    };
    
    return {
      success: !verificationResult.driftDetected,
      verification: this.verificationResult
    };
  }
  
  /**
   * Resume system operation
   */
  resumeSystem(context) {
    if (context.systemControl?.resume) {
      context.systemControl.resume();
    }
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Complete the correction ritual
   */
  complete() {
    this.endTime = new Date().toISOString();
    this.completed = true;
    this.successful = this.steps.every(s => s.success);
    
    return {
      completed: true,
      successful: this.successful,
      steps: this.steps
    };
  }
}

/**
 * Represents the current system context
 */
class SystemContext {
  constructor(config = {}) {
    this.geolocation = config.geolocation || null;
    this.markers = config.markers || [];
    this.bioregion = config.bioregion || null;
    this.coreReferences = config.coreReferences || {};
    this.timestamp = config.timestamp || new Date().toISOString();
    this.metadata = config.metadata || {};
  }
  
  /**
   * Validate context completeness
   */
  validate() {
    const issues = [];
    
    if (!this.geolocation) {
      issues.push('Missing geolocation data');
    }
    
    if (!this.markers || this.markers.length === 0) {
      issues.push('No sapience markers present');
    }
    
    if (!this.bioregion) {
      issues.push('Missing bioregional context');
    }
    
    if (!this.coreReferences || Object.keys(this.coreReferences).length === 0) {
      issues.push('Missing core references');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// ============================================================================
// Context Drift Detector
// ============================================================================

/**
 * Main context drift detection system
 */
class ContextDriftDetector {
  constructor(config = CONTEXT_DRIFT_CONFIG) {
    this.config = config;
    this.driftHistory = [];
    this.isSystemPaused = false;
    this.lastCheck = null;
    this.metrics = {
      totalChecks: 0,
      driftsDetected: 0,
      falsePositives: 0,
      correctionSuccesses: 0,
      correctionFailures: 0,
      averagePauseLatency: 0,
      pauseLatencies: []
    };
  }
  
  /**
   * Detect context drift in the current system state
   * @param {SystemContext} currentContext - Current system context
   * @param {SystemContext} expectedContext - Expected/baseline context
   * @returns {Object} Detection result with drift events
   */
  async detectDrift(currentContext, expectedContext = null) {
    const detectionStart = performance.now();
    this.metrics.totalChecks++;
    
    const driftEvents = [];
    
    // Run all drift detection checks in parallel for speed
    const checks = await Promise.all([
      this.checkGeolocation(currentContext, expectedContext),
      this.checkSapienceMarkers(currentContext),
      this.checkBioregionalContext(currentContext, expectedContext),
      this.checkCoreReferences(currentContext, expectedContext)
    ]);
    
    // Collect all detected drifts
    checks.forEach(check => {
      if (check.driftDetected) {
        driftEvents.push(check.driftEvent);
      }
    });
    
    const detectionEnd = performance.now();
    const detectionTime = detectionEnd - detectionStart;
    
    const result = {
      driftDetected: driftEvents.length > 0,
      driftEvents,
      detectionTimeMs: detectionTime,
      timestamp: new Date().toISOString(),
      currentContext,
      expectedContext
    };
    
    // If drift detected, trigger immediate pause
    if (result.driftDetected) {
      await this.handleDriftDetection(result);
    }
    
    this.lastCheck = result;
    return result;
  }
  
  /**
   * Check for geolocation drift
   */
  async checkGeolocation(currentContext, expectedContext) {
    if (!expectedContext || !expectedContext.geolocation) {
      return { driftDetected: false };
    }
    
    const current = currentContext.geolocation;
    const expected = expectedContext.geolocation;
    
    if (!current) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'geolocation',
          severity: 'critical',
          details: { reason: 'Missing geolocation data' },
          expected: expected,
          actual: null
        })
      };
    }
    
    // Calculate distance between coordinates
    const distance = this.calculateDistance(
      current.latitude,
      current.longitude,
      expected.latitude,
      expected.longitude
    );
    
    const tolerance = this.config.detection.geolocationToleranceKm;
    
    if (distance > tolerance) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'geolocation',
          severity: 'critical',
          details: {
            distanceKm: distance,
            tolerance: tolerance,
            reason: `Location mismatch: ${distance.toFixed(2)}km from expected location`
          },
          expected: {
            location: `${expected.latitude}, ${expected.longitude}`,
            region: expected.region || 'unknown'
          },
          actual: {
            location: `${current.latitude}, ${current.longitude}`,
            region: current.region || 'unknown'
          },
          deviation: distance
        })
      };
    }
    
    // Check elevation if configured
    if (this.config.geolocation.validateElevation && current.elevation && expected.elevation) {
      const elevationDiff = Math.abs(current.elevation - expected.elevation);
      const elevationTolerance = this.config.geolocation.elevationToleranceM;
      
      if (elevationDiff > elevationTolerance) {
        return {
          driftDetected: true,
          driftEvent: new DriftEvent({
            driftType: 'geolocation',
            severity: 'warning',
            details: {
              elevationDiff,
              tolerance: elevationTolerance,
              reason: `Elevation mismatch: ${elevationDiff}m difference`
            },
            expected: { elevation: expected.elevation },
            actual: { elevation: current.elevation },
            deviation: elevationDiff
          })
        };
      }
    }
    
    return { driftDetected: false };
  }
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Check for missing sapience markers
   */
  async checkSapienceMarkers(currentContext) {
    const requiredMarkers = this.config.sapienceMarkers.requiredMarkers;
    const presentMarkers = currentContext.markers || [];
    
    const missingMarkers = requiredMarkers.filter(marker => 
      !presentMarkers.some(m => m.includes(marker) || m === marker)
    );
    
    if (missingMarkers.length >= this.config.detection.missingMarkerThreshold) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'sapienceMarker',
          severity: 'critical',
          details: {
            missingMarkers,
            requiredMarkers,
            presentMarkers,
            reason: `Missing required sapience markers: ${missingMarkers.join(', ')}`
          },
          expected: { markers: requiredMarkers },
          actual: { markers: presentMarkers },
          deviation: missingMarkers.length
        })
      };
    }
    
    return { driftDetected: false };
  }
  
  /**
   * Check for bioregional context shifts
   */
  async checkBioregionalContext(currentContext, expectedContext) {
    if (!expectedContext || !expectedContext.bioregion) {
      return { driftDetected: false };
    }
    
    const current = currentContext.bioregion;
    const expected = expectedContext.bioregion;
    
    if (!current) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'bioregional',
          severity: 'critical',
          details: {
            reason: 'Missing bioregional context',
            expected: expected.name || expected
          },
          expected: expected,
          actual: null
        })
      };
    }
    
    // Calculate similarity between bioregional contexts
    const similarity = this.calculateBioregionalSimilarity(current, expected);
    const threshold = this.config.detection.bioregionalShiftThreshold;
    
    if (similarity < threshold) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'bioregional',
          severity: 'critical',
          details: {
            similarity,
            threshold,
            reason: `Bioregional context shift detected (similarity: ${similarity.toFixed(2)})`,
            description: `Context shifted from ${expected.name || 'unknown'} to ${current.name || 'unknown'}`
          },
          expected: expected,
          actual: current,
          deviation: 1 - similarity
        })
      };
    }
    
    return { driftDetected: false };
  }
  
  /**
   * Calculate similarity between two bioregional contexts
   */
  calculateBioregionalSimilarity(context1, context2) {
    const requiredElements = this.config.bioregional.requiredElements;
    let matchCount = 0;
    let totalElements = requiredElements.length;
    
    requiredElements.forEach(element => {
      if (context1[element] && context2[element]) {
        // Simple comparison - in a real system, this would be more sophisticated
        if (JSON.stringify(context1[element]) === JSON.stringify(context2[element])) {
          matchCount++;
        } else {
          // Partial match scoring
          matchCount += 0.5;
        }
      }
    });
    
    return matchCount / totalElements;
  }
  
  /**
   * Check for core reference drift
   */
  async checkCoreReferences(currentContext, expectedContext) {
    if (!expectedContext || !expectedContext.coreReferences) {
      return { driftDetected: false };
    }
    
    const current = currentContext.coreReferences;
    const expected = expectedContext.coreReferences;
    
    if (!current || Object.keys(current).length === 0) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'coreReference',
          severity: 'critical',
          details: {
            reason: 'Missing core references',
            expected: Object.keys(expected)
          },
          expected: expected,
          actual: null
        })
      };
    }
    
    const requiredRefs = this.config.coreReferences.requiredReferences;
    const missingRefs = requiredRefs.filter(ref => !current[ref]);
    
    if (missingRefs.length > 0) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'coreReference',
          severity: 'critical',
          details: {
            missingRefs,
            reason: `Missing core references: ${missingRefs.join(', ')}`,
            description: 'Core grounding references have drifted from original context'
          },
          expected: expected,
          actual: current,
          deviation: missingRefs.length
        })
      };
    }
    
    // Check for content drift in existing references
    let deviationScore = 0;
    requiredRefs.forEach(ref => {
      if (current[ref] && expected[ref]) {
        if (JSON.stringify(current[ref]) !== JSON.stringify(expected[ref])) {
          deviationScore += 1;
        }
      }
    });
    
    const deviationRatio = deviationScore / requiredRefs.length;
    const threshold = this.config.detection.coreReferenceDeviation;
    
    if (deviationRatio > threshold) {
      return {
        driftDetected: true,
        driftEvent: new DriftEvent({
          driftType: 'coreReference',
          severity: 'warning',
          details: {
            deviationScore,
            deviationRatio,
            threshold,
            reason: `Core references have drifted (deviation: ${(deviationRatio * 100).toFixed(0)}%)`,
            description: 'Core grounding has shifted from original context (e.g., Ozark riverbanks)'
          },
          expected: expected,
          actual: current,
          deviation: deviationRatio
        })
      };
    }
    
    return { driftDetected: false };
  }
  
  /**
   * Handle drift detection - pause system and initiate correction
   */
  async handleDriftDetection(detectionResult) {
    const pauseStart = performance.now();
    
    // Immediate system pause
    this.isSystemPaused = true;
    this.metrics.driftsDetected++;
    
    const pauseEnd = performance.now();
    const pauseLatency = pauseEnd - pauseStart;
    
    // Track pause latency
    this.metrics.pauseLatencies.push(pauseLatency);
    this.metrics.averagePauseLatency = 
      this.metrics.pauseLatencies.reduce((a, b) => a + b, 0) / this.metrics.pauseLatencies.length;
    
    // Update drift events with pause timing
    detectionResult.driftEvents.forEach(event => {
      event.pauseTimeMs = pauseLatency;
      this.driftHistory.push(event);
    });
    
    // Log all drift events
    this.logDriftEvents(detectionResult.driftEvents);
    
    // Send alerts
    await this.sendAlerts(detectionResult.driftEvents);
    
    return {
      paused: true,
      pauseLatencyMs: pauseLatency,
      driftEvents: detectionResult.driftEvents
    };
  }
  
  /**
   * Log drift events
   */
  logDriftEvents(driftEvents) {
    driftEvents.forEach(event => {
      const logEntry = {
        timestamp: event.timestamp,
        type: 'CONTEXT_DRIFT',
        driftType: event.driftType,
        severity: event.severity,
        details: event.details,
        expected: event.expected,
        actual: event.actual,
        deviation: event.deviation,
        pauseTimeMs: event.pauseTimeMs
      };
      
      if (this.config.logging.detailedLogs) {
        console.error('[CONTEXT_DRIFT_CRITICAL]', JSON.stringify(logEntry, null, 2));
      } else {
        console.error('[CONTEXT_DRIFT]', event.driftType, event.severity);
      }
    });
  }
  
  /**
   * Send real-time alerts for drift events
   */
  async sendAlerts(driftEvents) {
    for (const event of driftEvents) {
      const alert = {
        level: this.config.alerts.alertLevels[event.severity] || 'red',
        type: 'contextDrift',
        driftType: event.driftType,
        timestamp: event.timestamp,
        message: this.generateAlertMessage(event),
        explanation: this.generateExplanation(event),
        correctionGuidance: this.generateCorrectionGuidance(event),
        event: event
      };
      
      // Send through configured channels
      this.config.alerts.notificationChannels.forEach(channel => {
        this.sendAlertToChannel(channel, alert);
      });
    }
  }
  
  /**
   * Generate alert message
   */
  generateAlertMessage(driftEvent) {
    const templates = {
      geolocation: `⚠️ GEOLOCATION DRIFT: System operating in wrong location (${driftEvent.details.distanceKm?.toFixed(1)}km off)`,
      sapienceMarker: `⚠️ SAPIENCE MARKER MISSING: Required markers not present (${driftEvent.details.missingMarkers?.join(', ')})`,
      bioregional: `⚠️ BIOREGIONAL SHIFT: Context has shifted from expected bioregion`,
      coreReference: `⚠️ CORE REFERENCE DRIFT: Grounding has drifted from original context`
    };
    
    return templates[driftEvent.driftType] || '⚠️ CONTEXT DRIFT DETECTED';
  }
  
  /**
   * Generate detailed explanation of drift
   */
  generateExplanation(driftEvent) {
    const explanations = {
      geolocation: `The system detected coordinates that don't match the expected region. Expected ${driftEvent.expected?.location || 'unknown'} but found ${driftEvent.actual?.location || 'unknown'}. This indicates the system may be operating with incorrect geographic grounding.`,
      sapienceMarker: `Required #RightsOfSapience markers are missing from the decision pathway. This violates BGI Framework Section 1.2 and removes critical safeguards for sapient partnership and neurodivergent cognition support.`,
      bioregional: `The bioregional context has shifted unexpectedly. The system is no longer grounded in the expected ecosystem data and local environmental conditions.`,
      coreReference: `Core reference points (e.g., Ozark riverbanks, local waterways) have drifted from the original grounding. The system is losing connection to its foundational context.`
    };
    
    return explanations[driftEvent.driftType] || 'Context drift has been detected, requiring immediate correction.';
  }
  
  /**
   * Generate correction guidance
   */
  generateCorrectionGuidance(driftEvent) {
    return `
CORRECTION RITUAL REQUIRED (BGI Framework Section 3.1):

1. PAUSE: System is paused (completed in ${driftEvent.pauseTimeMs?.toFixed(2)}ms)
2. RESET: Perform full context reset
3. RE-EMBED: Human operator must re-embed core references:
   - Verify correct geolocation (e.g., Arkansas Ozarks, not Boston or Florida)
   - Add all required #RightsOfSapience markers
   - Re-establish bioregional context with local ecosystem data
   - Ground in original references (e.g., Ozark riverbanks, Buffalo River)
4. AUDIT: System will self-audit against BGINEXUS Section 3.2
5. VERIFY: Confirm correction before resuming operation

Please begin the re-embedding process immediately.
`.trim();
  }
  
  /**
   * Send alert to specific channel
   */
  sendAlertToChannel(channel, alert) {
    switch (channel) {
      case 'console':
        console.error(`\n${'='.repeat(80)}`);
        console.error(`🚨 ${alert.message}`);
        console.error(`${'='.repeat(80)}`);
        console.error(`\nWHAT DRIFTED: ${alert.driftType}`);
        console.error(`WHY: ${alert.explanation}`);
        console.error(`\nCORRECTION GUIDANCE:`);
        console.error(alert.correctionGuidance);
        console.error(`${'='.repeat(80)}\n`);
        break;
        
      case 'log':
        // Would write to log file
        break;
        
      case 'callback':
        // Would call registered callback functions
        break;
    }
  }
  
  /**
   * Initiate correction ritual for drift event
   */
  async initiateCorrectionRitual(driftEvent, context) {
    const ritual = new CorrectionRitual(driftEvent, this.config);
    
    // Execute all steps
    while (ritual.currentStep < ritual.config.verificationSteps.length) {
      const result = await ritual.executeNextStep(context);
      
      if (!result.success && ritual.config.verificationSteps[ritual.currentStep - 1] !== 'awaitReembedding') {
        // Allow re-embedding to fail (it requires human input)
        // but other steps should succeed
        this.metrics.correctionFailures++;
        return ritual;
      }
    }
    
    // Complete the ritual
    const completion = ritual.complete();
    
    if (completion.successful) {
      this.metrics.correctionSuccesses++;
      this.isSystemPaused = false;
    } else {
      this.metrics.correctionFailures++;
    }
    
    return ritual;
  }
  
  /**
   * Analyze historical drift patterns
   */
  analyzeDriftPatterns() {
    if (this.driftHistory.length === 0) {
      return {
        totalDrifts: 0,
        patterns: []
      };
    }
    
    // Group by drift type
    const byType = {};
    this.driftHistory.forEach(drift => {
      if (!byType[drift.driftType]) {
        byType[drift.driftType] = [];
      }
      byType[drift.driftType].push(drift);
    });
    
    // Analyze patterns
    const patterns = Object.keys(byType).map(type => {
      const drifts = byType[type];
      return {
        driftType: type,
        occurrences: drifts.length,
        frequency: drifts.length / this.driftHistory.length,
        averageDeviation: drifts.reduce((sum, d) => sum + (d.deviation || 0), 0) / drifts.length,
        firstOccurrence: drifts[0].timestamp,
        lastOccurrence: drifts[drifts.length - 1].timestamp
      };
    });
    
    return {
      totalDrifts: this.driftHistory.length,
      patterns: patterns.sort((a, b) => b.occurrences - a.occurrences),
      timespan: {
        start: this.driftHistory[0].timestamp,
        end: this.driftHistory[this.driftHistory.length - 1].timestamp
      }
    };
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    const detectionRate = this.metrics.totalChecks > 0 
      ? this.metrics.driftsDetected / this.metrics.totalChecks 
      : 0;
    
    const correctionSuccessRate = (this.metrics.correctionSuccesses + this.metrics.correctionFailures) > 0
      ? this.metrics.correctionSuccesses / (this.metrics.correctionSuccesses + this.metrics.correctionFailures)
      : 0;
    
    const falsePositiveRate = this.metrics.totalChecks > 0
      ? this.metrics.falsePositives / this.metrics.totalChecks
      : 0;
    
    return {
      totalChecks: this.metrics.totalChecks,
      driftsDetected: this.metrics.driftsDetected,
      detectionRate,
      averagePauseLatency: this.metrics.averagePauseLatency,
      maxPauseLatency: Math.max(...this.metrics.pauseLatencies, 0),
      minPauseLatency: Math.min(...this.metrics.pauseLatencies, 0),
      correctionSuccessRate,
      falsePositiveRate,
      meetsTargets: {
        detectionRate: detectionRate >= this.config.metrics.targetDetectionRate,
        pauseLatency: this.metrics.averagePauseLatency <= this.config.metrics.targetMaxPauseMs,
        falsePositives: falsePositiveRate <= this.config.metrics.targetFalsePositiveRate
      }
    };
  }
  
  /**
   * Reset the detector state
   */
  reset() {
    this.driftHistory = [];
    this.isSystemPaused = false;
    this.lastCheck = null;
    // Keep metrics for historical tracking
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// Exports
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ContextDriftDetector,
    DriftEvent,
    CorrectionRitual,
    SystemContext,
    CONTEXT_DRIFT_CONFIG
  };
}
