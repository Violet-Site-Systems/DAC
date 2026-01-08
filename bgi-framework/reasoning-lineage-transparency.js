/**
 * Reasoning Lineage Transparency Standard - JavaScript Implementation
 * 
 * Implements "no black-box decisions" as required by BGI Framework §1.2.
 * Provides complete, real-time traceable reasoning chains from input to output.
 * 
 * @module reasoning-lineage-transparency
 * @version 1.0
 * @license CC0-1.0
 */

// ============================================================================
// Configuration
// ============================================================================

const REASONING_LINEAGE_CONFIG = {
  // Capture settings
  capture: {
    enableRealTime: true,
    captureLatencyMs: 10,
    maxNodesPerLineage: 10000,
    autoArchiveOnComplete: true
  },
  
  // Privacy settings
  privacy: {
    enableAutoRedaction: true,
    detectPII: true,
    defaultAccessLevel: 'internal',
    encryptSensitiveData: true
  },
  
  // Storage settings
  storage: {
    retentionDays: 3650, // 10 years per EAL-1.0 §4d
    compressionEnabled: true,
    archiveOldLineages: true,
    archiveAfterDays: 90
  },
  
  // Validation settings
  validation: {
    requireHumanReadable: true,
    requireBGIContext: true,
    requireTimestamps: true,
    checkCompleteness: true
  },
  
  // Integration settings
  integration: {
    loveEvolutionThreshold: 0.25,
    contextDriftDetection: true,
    extractionMonitoring: true,
    biocentricAssessment: true
  },
  
  // Performance settings
  performance: {
    enableCaching: true,
    cacheTTLSeconds: 300,
    enableStreaming: true,
    maxStreamingNodes: 1000
  }
};

// ============================================================================
// Data Structures
// ============================================================================

/**
 * Represents a single reasoning node/decision point
 */
class ReasoningNode {
  constructor(config) {
    this.id = config.id || generateNodeId();
    this.timestamp = config.timestamp || new Date().toISOString();
    this.type = config.type || 'decision'; // decision|evaluation|transformation|integration
    
    // Position in lineage
    this.parentNodes = config.parentNodes || [];
    this.childNodes = config.childNodes || [];
    this.depth = config.depth || 0;
    this.pathIndex = config.pathIndex || '1';
    
    // Decision content
    this.input = config.input || {};
    this.process = config.process || {};
    this.output = config.output || {};
    
    // Reasoning transparency
    this.rationale = config.rationale || {};
    
    // BGI Framework integration
    this.bgiContext = config.bgiContext || {};
    
    // Metadata
    this.metadata = config.metadata || {};
    
    // Audit trail
    this.audit = config.audit || {
      reviewed: false,
      reviewers: [],
      flags: [],
      validationStatus: 'pending'
    };
  }
  
  /**
   * Validate node completeness
   */
  validate() {
    const errors = [];
    
    if (!this.timestamp) errors.push('Missing timestamp');
    if (!this.type) errors.push('Missing type');
    if (!this.rationale?.humanReadable) errors.push('Missing human-readable rationale');
    if (!this.bgiContext) errors.push('Missing BGI context');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get human-readable explanation
   */
  getExplanation() {
    return this.rationale.humanReadable || 'No explanation available';
  }
  
  /**
   * Add child node
   */
  addChild(childId) {
    if (!this.childNodes.includes(childId)) {
      this.childNodes.push(childId);
    }
  }
  
  /**
   * Add parent node
   */
  addParent(parentId) {
    if (!this.parentNodes.includes(parentId)) {
      this.parentNodes.push(parentId);
    }
  }
  
  /**
   * Check if node has high uncertainty
   */
  hasHighUncertainty(threshold = 0.25) {
    return (this.process.uncertainty || 0) > threshold;
  }
  
  /**
   * Export node to JSON
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      parentNodes: this.parentNodes,
      childNodes: this.childNodes,
      depth: this.depth,
      pathIndex: this.pathIndex,
      input: this.input,
      process: this.process,
      output: this.output,
      rationale: this.rationale,
      bgiContext: this.bgiContext,
      metadata: this.metadata,
      audit: this.audit
    };
  }
}

/**
 * Represents complete reasoning lineage from input to output
 */
class ReasoningLineage {
  constructor(config) {
    this.id = config.id || generateLineageId();
    this.created = config.created || new Date().toISOString();
    this.completed = config.completed || null;
    this.status = config.status || 'active'; // active|completed|aborted
    
    // Lineage structure
    this.rootNodes = config.rootNodes || [];
    this.leafNodes = config.leafNodes || [];
    this.nodes = config.nodes || {};
    this.structure = config.structure || 'chain'; // chain|tree|dag
    
    // Decision summary
    this.summary = {
      input: config.summary?.input || null,
      output: config.summary?.output || null,
      totalNodes: config.summary?.totalNodes || 0,
      depth: config.summary?.depth || 0,
      branches: config.summary?.branches || 0,
      averageConfidence: config.summary?.averageConfidence || 0,
      uncertaintyPoints: config.summary?.uncertaintyPoints || []
    };
    
    // Human oversight
    this.humanInterventions = config.humanInterventions || [];
    
    // BGI Framework validation
    this.validation = config.validation || {
      biocentricAssessment: { tier: 1, passed: false, score: 0 },
      sapienceConsent: { tier: 2, passed: false },
      intergenerationalAudit: { tier: 3, passed: false, generations: 7 }
    };
    
    // Audit trail
    this.audit = config.audit || {
      exported: false,
      reviewed: false,
      retentionUntil: calculateRetentionDate(),
      complianceChecks: []
    };
    
    // Privacy
    this.privacy = config.privacy || {
      containsSensitiveData: false,
      redactedFields: [],
      accessControl: 'internal'
    };
  }
  
  /**
   * Add node to lineage
   */
  addNode(node, parentNodeId = null) {
    if (!(node instanceof ReasoningNode)) {
      throw new Error('Node must be instance of ReasoningNode');
    }
    
    // Add to nodes collection
    this.nodes[node.id] = node;
    
    // Set up parent-child relationships
    if (parentNodeId) {
      if (this.nodes[parentNodeId]) {
        node.addParent(parentNodeId);
        this.nodes[parentNodeId].addChild(node.id);
        node.depth = this.nodes[parentNodeId].depth + 1;
        node.pathIndex = `${this.nodes[parentNodeId].pathIndex}.${this.nodes[parentNodeId].childNodes.length}`;
      }
    } else {
      // This is a root node
      this.rootNodes.push(node.id);
      node.depth = 0;
      node.pathIndex = String(this.rootNodes.length);
    }
    
    // Update summary
    this.updateSummary();
    
    // Check for uncertainty and trigger LOVE-evolution if needed
    if (node.hasHighUncertainty(REASONING_LINEAGE_CONFIG.integration.loveEvolutionThreshold)) {
      this.summary.uncertaintyPoints.push({
        nodeId: node.id,
        uncertainty: node.process.uncertainty,
        triggered: 'LOVE-evolution checkpoint'
      });
    }
    
    return node.id;
  }
  
  /**
   * Get node by ID
   */
  getNode(nodeId) {
    return this.nodes[nodeId];
  }
  
  /**
   * Complete the lineage
   */
  complete(output = null) {
    this.status = 'completed';
    this.completed = new Date().toISOString();
    if (output) {
      this.summary.output = output;
    }
    
    // Update leaf nodes
    this.updateLeafNodes();
    
    // Final summary update
    this.updateSummary();
    
    // Auto-archive if configured
    if (REASONING_LINEAGE_CONFIG.capture.autoArchiveOnComplete) {
      this.markForArchive();
    }
  }
  
  /**
   * Abort the lineage
   */
  abort(reason = null) {
    this.status = 'aborted';
    this.completed = new Date().toISOString();
    this.audit.abortReason = reason;
  }
  
  /**
   * Update summary statistics
   */
  updateSummary() {
    const nodeArray = Object.values(this.nodes);
    
    this.summary.totalNodes = nodeArray.length;
    this.summary.depth = Math.max(...nodeArray.map(n => n.depth), 0);
    
    // Calculate average confidence
    const confidences = nodeArray
      .map(n => n.process.confidence || 0.5)
      .filter(c => c > 0);
    
    this.summary.averageConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
    
    // Count branches (nodes with multiple children)
    this.summary.branches = nodeArray.filter(n => n.childNodes.length > 1).length;
    
    // Determine structure
    if (this.summary.branches === 0) {
      this.structure = 'chain';
    } else if (this.summary.branches < nodeArray.length * 0.3) {
      this.structure = 'tree';
    } else {
      this.structure = 'dag';
    }
  }
  
  /**
   * Update leaf nodes (nodes with no children)
   */
  updateLeafNodes() {
    this.leafNodes = Object.values(this.nodes)
      .filter(node => node.childNodes.length === 0)
      .map(node => node.id);
  }
  
  /**
   * Record human intervention
   */
  recordHumanIntervention(nodeId, intervention) {
    this.humanInterventions.push({
      nodeId,
      timestamp: new Date().toISOString(),
      type: intervention.type,
      operator: intervention.operator,
      rationale: intervention.rationale,
      outcome: intervention.outcome
    });
  }
  
  /**
   * Set BGI validation results
   */
  setBGIValidation(tier, results) {
    if (tier === 1) {
      this.validation.biocentricAssessment = {
        tier: 1,
        passed: results.passed,
        score: results.score
      };
    } else if (tier === 2) {
      this.validation.sapienceConsent = {
        tier: 2,
        passed: results.passed,
        confirmedBy: results.confirmedBy
      };
    } else if (tier === 3) {
      this.validation.intergenerationalAudit = {
        tier: 3,
        passed: results.passed,
        equityScore: results.equityScore,
        generations: results.generations || 7
      };
    }
  }
  
  /**
   * Get full reasoning path from root to leaf
   */
  getPath(leafNodeId) {
    const path = [];
    let currentId = leafNodeId;
    
    while (currentId) {
      const node = this.nodes[currentId];
      if (!node) break;
      
      path.unshift(node);
      
      // Move to parent (take first parent if multiple)
      currentId = node.parentNodes[0] || null;
    }
    
    return path;
  }
  
  /**
   * Get all paths from roots to leaves
   */
  getAllPaths() {
    const paths = [];
    
    for (const leafId of this.leafNodes) {
      paths.push(this.getPath(leafId));
    }
    
    return paths;
  }
  
  /**
   * Generate human-readable narrative
   */
  generateNarrative(depth = 'full') {
    const lines = [];
    
    lines.push(`DECISION: ${this.summary.input || 'Unknown'}`);
    lines.push('');
    lines.push(`REASONING PATH (${this.summary.depth} steps, ${this.summary.totalNodes} nodes explored):`);
    lines.push('');
    
    // Get primary path (longest or highest confidence)
    const primaryPath = this.getPrimaryPath();
    
    primaryPath.forEach((node, index) => {
      lines.push(`${index + 1}. ${node.type.toUpperCase()} [Confidence: ${(node.process.confidence || 0.5).toFixed(2)}]`);
      
      if (depth === 'full') {
        lines.push(`   ${node.rationale.humanReadable || 'No explanation'}`);
        
        // Show alternatives if present
        if (node.rationale.alternatives && node.rationale.alternatives.length > 0) {
          lines.push('   ');
          lines.push('   Considered alternatives:');
          node.rationale.alternatives.forEach(alt => {
            lines.push(`   ${alt.selected ? '✓' : '✗'} ${alt.option} ${alt.rejectionReason ? '- ' + alt.rejectionReason : ''}`);
          });
        }
        
        // Show BGI context
        if (node.bgiContext?.biocentricImpact) {
          lines.push(`   Biocentric Impact: ${node.bgiContext.biocentricImpact.score}`);
        }
        
        // Show uncertainty points
        if (node.hasHighUncertainty()) {
          lines.push('   🤝 LOVE-Evolution Checkpoint Triggered');
        }
        
        lines.push('');
      }
    });
    
    // Add validation summary
    lines.push('BGI FRAMEWORK VALIDATION:');
    lines.push(`✅ Tier 1 - Biocentric Assessment: ${this.validation.biocentricAssessment.passed ? 'PASSED' : 'FAILED'}`);
    lines.push(`✅ Tier 2 - Sapient Consent: ${this.validation.sapienceConsent.passed ? 'PASSED' : 'FAILED'}`);
    lines.push(`✅ Tier 3 - Intergenerational Audit: ${this.validation.intergenerationalAudit.passed ? 'PASSED' : 'FAILED'}`);
    lines.push('');
    
    lines.push(`FINAL DECISION: ${this.summary.output || 'Pending'}`);
    lines.push(`Status: ${this.status.toUpperCase()}`);
    lines.push(`Human interventions: ${this.humanInterventions.length}`);
    lines.push(`Uncertainty points: ${this.summary.uncertaintyPoints.length}`);
    
    return lines.join('\n');
  }
  
  /**
   * Get primary reasoning path (longest or highest confidence)
   */
  getPrimaryPath() {
    const allPaths = this.getAllPaths();
    
    if (allPaths.length === 0) return [];
    
    // Return longest path, or highest confidence if same length
    return allPaths.reduce((best, current) => {
      if (current.length > best.length) return current;
      if (current.length === best.length) {
        const currentAvg = current.reduce((sum, n) => sum + (n.process.confidence || 0.5), 0) / current.length;
        const bestAvg = best.reduce((sum, n) => sum + (n.process.confidence || 0.5), 0) / best.length;
        return currentAvg > bestAvg ? current : best;
      }
      return best;
    }, allPaths[0]);
  }
  
  /**
   * Generate visual tree representation
   */
  generateTreeVisualization() {
    const lines = [];
    const visited = new Set();
    
    const renderNode = (nodeId, prefix = '', isLast = true) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = this.nodes[nodeId];
      if (!node) return;
      
      const connector = isLast ? '└─' : '├─';
      const confidence = (node.process.confidence || 0.5).toFixed(2);
      const icon = node.hasHighUncertainty() ? '🤝' : '';
      
      lines.push(`${prefix}${connector}[${node.type}] ${node.rationale.humanReadable?.substring(0, 50) || 'No explanation'}... (${confidence}) ${icon}`);
      
      const childPrefix = prefix + (isLast ? '  ' : '│ ');
      node.childNodes.forEach((childId, index) => {
        renderNode(childId, childPrefix, index === node.childNodes.length - 1);
      });
    };
    
    lines.push('[INPUT]');
    this.rootNodes.forEach((rootId, index) => {
      renderNode(rootId, '', index === this.rootNodes.length - 1);
    });
    
    return lines.join('\n');
  }
  
  /**
   * Mark lineage for archival
   */
  markForArchive() {
    this.audit.markedForArchive = true;
    this.audit.archiveDate = new Date(Date.now() + REASONING_LINEAGE_CONFIG.storage.archiveAfterDays * 24 * 60 * 60 * 1000).toISOString();
  }
  
  /**
   * Validate lineage completeness
   */
  validateCompleteness() {
    const checks = {
      hasRootNode: this.rootNodes.length > 0,
      hasLeafNode: this.leafNodes.length > 0,
      allNodesHaveRationale: true,
      noOrphanNodes: true,
      allNodesHaveTimestamps: true,
      allNodesHaveBGIContext: true,
      hasHumanReadableExplanation: true
    };
    
    // Check all nodes for specific validation requirements
    for (const node of Object.values(this.nodes)) {
      if (!node.rationale?.humanReadable) {
        checks.allNodesHaveRationale = false;
        checks.hasHumanReadableExplanation = false;
      }
      if (!node.timestamp) {
        checks.allNodesHaveTimestamps = false;
      }
      if (!node.bgiContext) {
        checks.allNodesHaveBGIContext = false;
      }
    }
    
    // Check for orphan nodes (nodes not in root/leaf and not referenced by any parent/child)
    const referencedNodes = new Set([...this.rootNodes, ...this.leafNodes]);
    for (const node of Object.values(this.nodes)) {
      node.parentNodes.forEach(id => referencedNodes.add(id));
      node.childNodes.forEach(id => referencedNodes.add(id));
    }
    
    for (const nodeId of Object.keys(this.nodes)) {
      if (!referencedNodes.has(nodeId)) {
        checks.noOrphanNodes = false;
        break;
      }
    }
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    return {
      valid: allPassed,
      checks,
      warnings: this.generateWarnings(checks)
    };
  }
  
  /**
   * Generate warnings from validation checks
   */
  generateWarnings(checks) {
    const warnings = [];
    
    if (!checks.hasRootNode) warnings.push('No root node found');
    if (!checks.hasLeafNode) warnings.push('No leaf node found');
    if (!checks.allNodesHaveRationale) warnings.push('Some nodes missing rationale');
    if (!checks.noOrphanNodes) warnings.push('Orphan nodes detected');
    if (!checks.allNodesHaveTimestamps) warnings.push('Some nodes missing timestamps');
    if (!checks.allNodesHaveBGIContext) warnings.push('Some nodes missing BGI context');
    if (!checks.hasHumanReadableExplanation) warnings.push('Some nodes missing human-readable explanation');
    
    return warnings;
  }
  
  /**
   * Export lineage to JSON
   */
  toJSON() {
    return {
      id: this.id,
      created: this.created,
      completed: this.completed,
      status: this.status,
      rootNodes: this.rootNodes,
      leafNodes: this.leafNodes,
      nodes: Object.fromEntries(
        Object.entries(this.nodes).map(([id, node]) => [id, node.toJSON()])
      ),
      structure: this.structure,
      summary: this.summary,
      humanInterventions: this.humanInterventions,
      validation: this.validation,
      audit: this.audit,
      privacy: this.privacy
    };
  }
  
  /**
   * Export lineage to JSON-LD with semantic markup
   */
  toJSONLD() {
    return {
      '@context': {
        '@vocab': 'https://bginexus.io/reasoning-lineage/v1/',
        'bgi': 'https://bginexus.io/bgi-framework/v2.1/',
        'prov': 'http://www.w3.org/ns/prov#'
      },
      '@type': 'ReasoningLineage',
      '@id': `urn:uuid:${this.id}`,
      'prov:startedAtTime': this.created,
      'prov:endedAtTime': this.completed,
      'nodes': Object.values(this.nodes).map(node => node.toJSON()),
      'bgi:compliance': {
        'bgi:biocentricPrimacy': this.validation.biocentricAssessment.passed,
        'bgi:sapientPartnership': this.validation.sapienceConsent.passed,
        'bgi:temporalFidelity': this.validation.intergenerationalAudit.passed
      }
    };
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate BGI Framework compliance
 */
function validateBGICompliance(lineage) {
  return {
    biocentricPrimacy: {
      passed: lineage.validation.biocentricAssessment.passed,
      score: lineage.validation.biocentricAssessment.score,
      requirement: 'Zero net harm to biosphere'
    },
    sapientPartnership: {
      passed: lineage.validation.sapienceConsent.passed,
      humanVetoAvailable: lineage.humanInterventions.length >= 0,
      transparencyComplete: lineage.validateCompleteness().valid
    },
    temporalFidelity: {
      passed: lineage.validation.intergenerationalAudit.passed,
      generations: lineage.validation.intergenerationalAudit.generations,
      requirement: '7 generations assessed'
    },
    overall: (
      lineage.validation.biocentricAssessment.passed &&
      lineage.validation.sapienceConsent.passed &&
      lineage.validation.intergenerationalAudit.passed
    )
  };
}

/**
 * Validate EAL-1.0 compliance
 */
function validateEALCompliance(lineage) {
  const completeness = lineage.validateCompleteness();
  
  return {
    transparency: {
      documentationComplete: completeness.valid,
      decisionExplanations: completeness.checks.allNodesHaveRationale,
      aiDisclosure: true, // Lineage itself is AI disclosure
      auditTrails: completeness.valid
    },
    retention: {
      retentionPeriod: REASONING_LINEAGE_CONFIG.storage.retentionDays / 365,
      requirement: '10 years',
      compliant: REASONING_LINEAGE_CONFIG.storage.retentionDays >= 3650
    },
    machineReadable: {
      format: 'JSON/JSON-LD',
      compliant: true
    },
    overall: (
      completeness.valid &&
      REASONING_LINEAGE_CONFIG.storage.retentionDays >= 3650
    )
  };
}

/**
 * Check for extractive patterns in reasoning lineage
 */
function analyzeForExtraction(lineage) {
  const patterns = {
    detected: false,
    type: null,
    evidence: [],
    nodes: []
  };
  
  // Check each node for extractive indicators
  for (const node of Object.values(lineage.nodes)) {
    // Check if optimization favors engagement over ecosystem
    if (node.rationale?.factors) {
      const engagementFactor = node.rationale.factors.find(f => 
        f.name.toLowerCase().includes('engagement') || 
        f.name.toLowerCase().includes('growth') ||
        f.name.toLowerCase().includes('revenue')
      );
      
      const ecosystemFactor = node.rationale.factors.find(f => 
        f.name.toLowerCase().includes('ecosystem') || 
        f.name.toLowerCase().includes('biocentric') ||
        f.name.toLowerCase().includes('environmental')
      );
      
      if (engagementFactor && ecosystemFactor && 
          engagementFactor.weight > ecosystemFactor.weight * 2) {
        patterns.detected = true;
        patterns.type = 'engagement_prioritized';
        patterns.evidence.push(`Node ${node.id}: Engagement weighted ${engagementFactor.weight} vs ecosystem ${ecosystemFactor.weight}`);
        patterns.nodes.push(node.id);
      }
    }
    
    // Check for temporal compression (rushed decisions)
    if (node.metadata?.computeTimeMs < 10 && node.process.confidence > 0.9) {
      patterns.detected = true;
      patterns.type = 'temporal_compression';
      patterns.evidence.push(`Node ${node.id}: Suspiciously fast decision (${node.metadata.computeTimeMs}ms) with high confidence`);
      patterns.nodes.push(node.id);
    }
  }
  
  return patterns;
}

/**
 * Check for context drift in reasoning lineage
 */
function checkContextDrift(lineage, expectedContext = {}) {
  const driftCheck = {
    driftDetected: false,
    driftedNodes: [],
    expectedContext: expectedContext,
    driftTypes: []
  };
  
  for (const node of Object.values(lineage.nodes)) {
    // Check bioregion drift
    if (expectedContext.bioregion && 
        node.bgiContext?.bioregion && 
        node.bgiContext.bioregion !== expectedContext.bioregion) {
      driftCheck.driftDetected = true;
      driftCheck.driftedNodes.push(node.id);
      driftCheck.driftTypes.push('bioregion');
    }
    
    // Check for missing sapience markers
    if (node.bgiContext?.sapienceMarkers?.length === 0) {
      driftCheck.driftDetected = true;
      driftCheck.driftedNodes.push(node.id);
      driftCheck.driftTypes.push('missing_sapience_markers');
    }
  }
  
  return driftCheck;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique node ID
 */
function generateNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).substring(2, 15).padEnd(13, '0')}`;
}

/**
 * Generate unique lineage ID
 */
function generateLineageId() {
  return `lineage-${Date.now()}-${Math.random().toString(36).substring(2, 15).padEnd(13, '0')}`;
}

/**
 * Calculate retention date based on config
 */
function calculateRetentionDate() {
  const retentionMs = REASONING_LINEAGE_CONFIG.storage.retentionDays * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + retentionMs).toISOString();
}

/**
 * Redact sensitive data from lineage
 */
function redactSensitiveData(lineage) {
  // Create deep copy
  const redacted = JSON.parse(JSON.stringify(lineage.toJSON()));
  
  // Redact PII patterns
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b[\w.-]+@[\w.-]+\.\w+\b/g, // Email
    /\b\d{3}-\d{3}-\d{4}\b/g // Phone
  ];
  
  const redactString = (str) => {
    if (typeof str !== 'string') return str;
    let redactedStr = str;
    for (const pattern of piiPatterns) {
      redactedStr = redactedStr.replace(pattern, '[REDACTED]');
    }
    return redactedStr;
  };
  
  // Recursively redact all string values
  const redactObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = redactString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactObject(obj[key]);
      }
    }
  };
  
  redactObject(redacted);
  redacted.privacy.containsSensitiveData = true;
  redacted.privacy.redactedFields.push('PII detected and redacted');
  
  return redacted;
}

// ============================================================================
// Export
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ReasoningNode,
    ReasoningLineage,
    validateBGICompliance,
    validateEALCompliance,
    analyzeForExtraction,
    checkContextDrift,
    redactSensitiveData,
    REASONING_LINEAGE_CONFIG
  };
}
