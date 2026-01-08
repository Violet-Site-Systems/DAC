# Three-Tier Consent Architecture Specification

**Version**: 1.0  
**Status**: Implementation  
**Related**: BGI Framework §2.3 | Issue #7

## Overview

The Three-Tier Consent Architecture implements the validation pipeline required by BGI Framework Section 2.3 for all AGI/AI actions. This system ensures comprehensive evaluation through three sequential validation tiers, with each tier providing a critical perspective on the proposed action.

## Core Principle

> **Non-negotiable constraint**: All three validation tiers must pass before any AGI/AI action proceeds.

## Architecture

### Sequential Validation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   Action Proposed                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Biocentric Impact Assessment                        │
│  ─────────────────────────────────────                       │
│  • Ecosystem integrity evaluation                            │
│  • Zero net harm validation                                  │
│  • Bioregional context analysis                              │
│  • Required mitigation identification                        │
│                                                              │
│  Threshold: Net harm ≤ 0, Confidence ≥ 75%                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓ [PASS]
┌─────────────────────────────────────────────────────────────┐
│  Tier 2: Sapient Intent Confirmation                         │
│  ────────────────────────────────────                        │
│  • Human understanding verification                          │
│  • Explicit consent collection                               │
│  • Neurodivergent support integration                        │
│  • #RightsOfSapience marker validation                       │
│  • Human veto authority                                      │
│                                                              │
│  Integration: LOVE-evolution checkpoints (Issue #5)         │
└────────────────────┬────────────────────────────────────────┘
                     ↓ [PASS]
┌─────────────────────────────────────────────────────────────┐
│  Tier 3: Intergenerational Consequence Audit                 │
│  ────────────────────────────────────────────                │
│  • 7-generation impact modeling (175+ years)                 │
│  • Intergenerational equity analysis                         │
│  • Tipping point detection                                   │
│  • Feedback loop identification                              │
│  • Long-term monitoring requirements                         │
│                                                              │
│  Threshold: Equity ≥ -50, Score ≥ 0, Tipping points < 30%   │
└────────────────────┬────────────────────────────────────────┘
                     ↓ [ALL PASS]
┌─────────────────────────────────────────────────────────────┐
│  ✓ Action Approved                                           │
│  • Complete audit trail generated                            │
│  • Monitoring requirements established                       │
│  • Review timeline determined                                │
└─────────────────────────────────────────────────────────────┘
```

## Tier 1: Biocentric Impact Assessment

### Purpose
Evaluates the proposed action against ecosystem integrity metrics, enforcing the BGI principle of Biocentric Primacy (§1.1).

### Integration
- **API**: Biocentric Impact Assessment API (Issue #6)
- **Data**: Bioregional Data Standards (Issue #11)

### Assessment Dimensions

1. **Biodiversity Impact**
   - Native species population effects
   - Habitat quality and connectivity
   - Invasive species risk
   - Genetic diversity preservation

2. **Water Systems**
   - Watershed health
   - Water quality (chemical, biological)
   - Aquatic ecosystem integrity
   - Groundwater recharge capacity

3. **Soil Health**
   - Organic matter content
   - Microbial diversity
   - Erosion rates
   - Carbon sequestration capacity

4. **Air Quality**
   - Emissions (GHG and other pollutants)
   - Local air quality impacts
   - Microclimate effects

5. **Carbon Cycle**
   - Net carbon emissions/sequestration
   - Long-term carbon storage
   - Feedback loop impacts

6. **Regeneration Capacity**
   - Ecosystem resilience
   - Recovery time from disturbance
   - Self-organization potential
   - Adaptive capacity

### Validation Criteria

**Pass Conditions**:
- Net harm ≤ 0 (zero net harm threshold)
- Confidence ≥ 75%
- All mitigation measures feasible

**Conditional**:
- Net harm > 0 but mitigation available
- Required mitigation measures identified
- Implementation timeline reasonable

**Fail Conditions**:
- Net harm > 0 with no feasible mitigation
- Confidence < 75%
- Critical ecosystem impacts

### Output

```json
{
  "tier": 1,
  "tierName": "Biocentric Impact Assessment",
  "status": "passed|failed|conditional",
  "score": -100 to +100,
  "confidence": 0.0 to 1.0,
  "rationale": "detailed explanation",
  "humanReadableExplanation": "clear explanation for non-experts",
  "details": {
    "dimensions": { ... },
    "netHarmCalculation": { ... },
    "ecosystemIntegrity": { ... }
  },
  "requiredMitigation": [...]
}
```

## Tier 2: Sapient Intent Confirmation

### Purpose
Ensures human understanding, explicit consent, and validates #RightsOfSapience markers. Provides human veto authority per BGI Framework §1.2.

### Integration
- **System**: LOVE-evolution Checkpoint Protocol (Issue #5)
- **Markers**: #RightsOfSapience Technical Markers (Issue #12)
- **Support**: Neurodivergent cognition patterns

### Confirmation Process

1. **Context Presentation**
   - Clear description of proposed action
   - Results from Tier 1 (biocentric assessment)
   - Alternative approaches available
   - Predicted consequences

2. **Deliberation Support**
   - Minimum deliberation time: 10 seconds
   - Neurodivergent UI accommodations
   - Vulnerability window detection
   - Optimal decision timing

3. **Consent Collection**
   - Explicit approval required
   - Veto authority always available
   - Rationale documentation
   - Deferral option supported

### Neurodivergent Support

**Vulnerability Window Detection**:
- Circadian rhythm monitoring
- Automatic deferral during vulnerable periods (e.g., 2-4 AM)
- Optimal window calculation
- Deliberate pacing

**Cognitive Pattern Support**:
- Bipolar: Pace control, emotional state check
- ADHD: Chunking, progress tracking
- Autism spectrum: Explicit instructions, visual aids
- Dyslexia: Readable fonts, text-to-speech

### Validation Criteria

**Pass Conditions**:
- Explicit consent granted
- Minimum deliberation time met
- Human understanding confirmed
- #RightsOfSapience marker present

**Conditional**:
- Deferral to optimal cognitive window
- Additional information requested
- Modified approach suggested

**Fail Conditions**:
- Human veto exercised
- Consent not obtained
- Insufficient understanding
- #RightsOfSapience marker absent

### Output

```json
{
  "tier": 2,
  "tierName": "Sapient Intent Confirmation",
  "status": "passed|failed|conditional",
  "rationale": "detailed explanation",
  "humanReadableExplanation": "clear explanation",
  "details": {
    "confirmationType": "explicit_consent",
    "deliberationTime": 15.3,
    "neurodivergentAccommodations": true,
    "humanResponse": {
      "summary": "...",
      "rationale": "...",
      "confidence": 0.85
    }
  },
  "marker": "#RightsOfSapience"
}
```

## Tier 3: Intergenerational Consequence Audit

### Purpose
Evaluates long-term consequences across 7 generations (~175-200 years), implementing Temporal Fidelity and Ancestral Accountability principles.

### Integration
- **Framework**: Intergenerational Consequence Audit Framework (Issue #13)
- **Modeling**: Agent-based ecosystem modeling
- **Climate**: Climate projection integration

### Time Horizons

1. **Immediate** (0-1 years)
2. **Near-term** (1-10 years)
3. **Medium-term** (10-50 years)
4. **Long-term** (50-200 years)
5. **Deep Time** (200+ years) - optional

### Consequence Categories

1. **Ecological**
   - Species population dynamics
   - Habitat integrity
   - Ecosystem function

2. **Climate**
   - Carbon cycle impacts
   - Temperature changes
   - Weather pattern shifts

3. **Resources**
   - Soil health trajectory
   - Water availability
   - Biodiversity resources

4. **Cultural**
   - Indigenous knowledge preservation
   - Human-nature relationship
   - Sacred site impacts

5. **Genetic**
   - Diversity maintenance
   - Evolutionary trajectories
   - Adaptive capacity

### Analysis Components

**Generation Risk Assessment**:
- Risk profile for each of 7 generations
- Cumulative impact tracking
- Tipping point probabilities
- Feedback loop identification

**Intergenerational Equity**:
- Benefit distribution across generations
- Burden distribution fairness
- Resource depletion rates
- Option preservation

**Uncertainty Quantification**:
- Confidence intervals by time horizon
- Model uncertainty characterization
- Sensitivity analysis
- Scenario robustness

### Validation Criteria

**Pass Conditions**:
- Overall score ≥ 0
- Equity score ≥ -50
- All generation risk profiles acceptable
- Tipping point probability < 30%

**Conditional**:
- Minor negative impacts with mitigation
- Equity concerns addressable
- Enhanced monitoring required

**Fail Conditions**:
- Critical generation risks (risk score < -75)
- Severe equity violations
- High-probability tipping points (>70%)
- Irreversible negative impacts

### Output

```json
{
  "tier": 3,
  "tierName": "Intergenerational Consequence Audit",
  "status": "passed|failed|conditional",
  "score": -100 to +100,
  "rationale": "detailed explanation",
  "humanReadableExplanation": "clear explanation",
  "details": {
    "decision": "approved|rejected|conditional",
    "generationRisks": [...],
    "equityAnalysis": { ... },
    "horizonConsequences": [...],
    "keyFindings": [...],
    "monitoringRequirements": [...]
  }
}
```

## Complete Validation Result

### Decision Logic

**Approved**:
- All three tiers passed
- No blocking issues identified
- Acceptable risk profile

**Conditional**:
- One or more tiers conditional
- Mitigation measures required
- Enhanced monitoring needed

**Rejected**:
- Any tier failed
- Critical issues identified
- Mitigation not feasible

**Emergency Override**:
- Original validation failed or conditional
- Emergency circumstances documented
- Multiple approvers required (min 2)
- Comprehensive justification (min 50 characters)
- 10-year audit retention

### Audit Trail

Every validation generates a complete audit trail including:

1. **Action Details**
   - Unique validation ID
   - Action description and scope
   - Timestamp and initiator
   - Priority and context

2. **Tier Results**
   - Status for each tier
   - Scores and confidence levels
   - Detailed assessments
   - Human-readable explanations

3. **Decision Chain**
   - Sequential tier completion
   - Decision logic applied
   - Rationale for overall status
   - Required actions identified

4. **Emergency Overrides** (if applicable)
   - Override justification
   - Approver identities
   - Circumstances documented
   - Permanent audit record

### Output Structure

```json
{
  "validationId": "three-tier-1234567890-abc123",
  "actionId": "action-xyz789",
  "timestamp": "2025-01-08T18:00:00.000Z",
  "overallStatus": "approved|rejected|conditional|emergency_override",
  "tierResults": {
    "tier1_biocentric": { ... },
    "tier2_sapient": { ... },
    "tier3_intergenerational": { ... }
  },
  "decisionRationale": "All three validation tiers passed successfully.",
  "requiredActions": [],
  "blockingIssues": [],
  "warnings": [],
  "auditTrail": [
    {
      "timestamp": "...",
      "event": "validation_started",
      "action": { ... }
    },
    ...
  ],
  "emergencyOverride": null,
  "marker": "#ThreeTierConsent"
}
```

## API Usage

### Basic Validation

```javascript
const { performThreeTierValidation, ValidationAction } = require('./three-tier-consent');

// Create action to validate
const action = new ValidationAction({
  type: 'deployment',
  description: 'Deploy new AI model to production',
  scope: {
    geographic: {
      latitude: 36.0,
      longitude: -94.0,
      bioregion: 'ozarks',
      area_affected_km2: 0.1
    }
  },
  resourceFlows: {
    inputs: [
      { type: 'energy', quantity: 1000, unit: 'kWh' }
    ]
  }
});

// Perform validation
const result = await performThreeTierValidation(action, {
  tier1: { /* biocentric options */ },
  tier2: { 
    userProfile: {
      pattern: 'adhd',
      vulnerabilityWindows: [
        { start: '02:00', end: '04:00' }
      ]
    }
  },
  tier3: { /* intergenerational options */ }
});

// Check result
if (result.overallStatus === 'approved') {
  console.log('Action approved:', result.decisionRationale);
  // Proceed with action
} else if (result.overallStatus === 'conditional') {
  console.log('Conditional approval. Required actions:');
  result.requiredActions.forEach(action => {
    console.log('-', action.measure);
  });
} else {
  console.log('Action rejected:', result.decisionRationale);
  result.blockingIssues.forEach(issue => {
    console.log('- Tier', issue.tier, ':', issue.issue);
  });
}
```

### Emergency Override

```javascript
const { requestEmergencyOverride } = require('./three-tier-consent');

// Request override (only if validation failed/conditional)
const override = await requestEmergencyOverride(result, {
  justification: 'Critical infrastructure failure requires immediate action to prevent ecological harm. Standard validation timeline would result in greater damage than override risks.',
  approvers: ['admin-1', 'safety-officer-2', 'ethics-lead-3'],
  circumstances: 'infrastructure_failure'
});

console.log('Override approved:', override.approved);
// Action can now proceed with override in audit trail
```

### Audit Retrieval

```javascript
const { getValidationAuditEntries } = require('./three-tier-consent');

// Retrieve audit history
const audits = getValidationAuditEntries({
  startDate: '2025-01-01',
  status: 'rejected'
});

console.log(`Found ${audits.length} rejected actions in 2025`);
```

## Integration with BGI Framework Components

### Context Drift Detection (Issue #8)
- Validates geolocation match with bioregional data
- Checks for #RightsOfSapience markers
- Triggers validation on context shift

### Temporal Fidelity Clock (Issue #9)
- Respects circadian vulnerability windows
- Aligns validation timing with biological rhythms
- Defers decisions during non-optimal periods

### Extraction Prevention (Issue #10)
- Monitors optimization function alignment
- Validates against extractive patterns
- Ensures ecosystem health prioritization

### LOVE-evolution Checkpoints (Issue #5)
- Provides human veto authority interface
- Triggers on uncertainty or Tier 2 confirmation
- Enables collaborative decision-making

## Compliance Requirements

### EAL-1.0 (Ethical AI License)
- Comprehensive accountability through audit trails
- Human oversight and veto authority
- Transparent decision-making process
- Bias detection and mitigation

### EIL-1.0 (Environmental Impact License)
- Zero net harm validation
- Ecosystem integrity assessment
- Long-term environmental monitoring

### CGL-1.0 (Community Governance License)
- Stakeholder consent collection
- Democratic decision processes
- Transparent governance

## Monitoring and Review

### Continuous Monitoring
- Real-time impact tracking vs. predictions
- Ecosystem health indicators
- Intergenerational burden metrics
- Compliance verification

### Review Timeline
- **Critical findings**: Annual review
- **High findings**: 3-year review
- **Standard**: 5-year review
- **Emergency overrides**: Immediate follow-up

### Adaptive Management
- Model improvement from monitoring data
- Threshold calibration
- Process refinement
- Learning integration

## Error Handling

### Insufficient Data
- Clear identification of missing data
- Recommendation for baseline surveys
- Deferral until data available

### High Uncertainty
- Confidence interval reporting
- Phased approach recommendation
- Additional modeling suggestions

### System Failures
- Graceful degradation
- Error logging and notification
- Human escalation
- Fail-safe defaults (reject on error)

## Future Enhancements

1. **Machine Learning Integration**
   - Predictive model improvement
   - Pattern recognition in historical data
   - Automated mitigation suggestions

2. **Real-time Sensor Integration**
   - IoT ecosystem monitoring
   - Continuous data updates
   - Early warning systems

3. **Collective Intelligence**
   - Community feedback integration
   - Crowd-sourced validation
   - Distributed decision-making

4. **Advanced Modeling**
   - Quantum computing integration
   - Multi-agent simulations
   - Tipping point prediction refinement

## References

- BGI Alignment Framework §2.3 (Consent Architecture)
- BGI Alignment Framework §1.1 (Biocentric Primacy)
- BGI Alignment Framework §1.2 (Sapient Partnership)
- BGI Alignment Framework §1.3 (Temporal Fidelity)
- Issue #5: LOVE-evolution Checkpoint Protocol
- Issue #6: Biocentric Impact Assessment API
- Issue #8: Context Drift Detection
- Issue #9: Temporal Fidelity Clock
- Issue #10: Extraction Prevention Monitoring
- Issue #11: Bioregional Data Standards
- Issue #12: #RightsOfSapience Markers
- Issue #13: Intergenerational Consequence Audit
- Ethical AI License (EAL-1.0)
- Environmental Impact License (EIL-1.0)
- Community Governance License (CGL-1.0)

## License

This specification is released under CC0 1.0 Universal (public domain) to enable widespread adoption and implementation.

---

**Version**: 1.0  
**Last Updated**: January 8, 2026  
**Status**: Implementation Complete
