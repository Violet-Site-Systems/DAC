# Context Drift Detection and Response System

**Version**: 1.0  
**Status**: Implementation  
**Related**: BGI Framework §3.1 | Issue #8

## Overview

The Context Drift Detection and Response System implements immediate system pause triggers when context drift is detected, as specified in BGI Framework Section 3.1. This system ensures AGI systems remain properly grounded in their intended bioregional, geographic, and sapient context.

## Core Principle

> **Immediate system pause when context drift detected**  
> Geolocation data mismatches, missing sapience markers, bioregional context shifts, or core reference drift all trigger automatic pause and correction ritual.

## Detection Triggers

The system monitors four critical dimensions and triggers immediate pause when any drift is detected:

### 1. Geolocation Data Mismatches

**Detection Criteria:**
- Coordinate drift beyond configured tolerance (default: 10km)
- Elevation changes beyond tolerance (default: 100m)
- Region mismatch (e.g., Florida coordinates when Arkansas required)

**Example:**
```javascript
// Expected: Arkansas Ozarks
const expectedContext = {
  geolocation: {
    latitude: 36.0397,
    longitude: -94.1719,
    elevation: 400,
    region: 'Arkansas Ozarks'
  }
};

// Detected: Florida
const currentContext = {
  geolocation: {
    latitude: 30.4383,
    longitude: -84.2807,
    elevation: 60,
    region: 'Florida Panhandle'
  }
};

// Result: DRIFT DETECTED - 1100km distance
```

### 2. Sapience Markers Missing

**Detection Criteria:**
- Missing `#RightsOfSapience` markers in decision pathways
- Missing `#ConsentRequired` markers for high-stakes decisions
- Missing `#NeurodivergentContext` markers for cognitive support

**Example:**
```javascript
// Required markers
const requiredMarkers = [
  '#RightsOfSapience',
  '#ConsentRequired',
  '#NeurodivergentContext'
];

// Current context missing markers
const currentContext = {
  markers: [] // EMPTY - DRIFT DETECTED
};
```

### 3. Bioregional Context Shifts

**Detection Criteria:**
- Water system data doesn't match expected bioregion
- Flora/fauna data shifts unexpectedly
- Soil, climate, or phenology data inconsistencies
- Similarity score below threshold (default: 0.7)

**Example:**
```javascript
// Expected: Arkansas Ozarks ecosystem
const expectedBioregion = {
  name: 'Arkansas Ozarks',
  waterSystems: ['Buffalo River', 'White River', 'Kings River'],
  flora: ['oak-hickory forest', 'bluff prairie', 'glades'],
  fauna: ['hellbender', 'Indiana bat', 'gray bat'],
  soil: 'cherty limestone karst',
  climate: 'humid subtropical',
  phenology: ['spring ephemeral bloom', 'firefly emergence']
};

// Detected: Different ecosystem
const currentBioregion = {
  name: 'Coastal Plain',
  waterSystems: ['Apalachicola River'],
  // ... different ecosystem data
  // DRIFT DETECTED - bioregional shift
};
```

### 4. Core References Drift

**Detection Criteria:**
- Missing required references (bioregion, waterways, ecosystem type, cultural context)
- Content drift from original grounding (e.g., "Ozark riverbanks" → "Boston Harbor")
- Deviation ratio exceeds threshold (default: 0.5)

**Example:**
```javascript
// Expected: Ozark-grounded references
const expectedReferences = {
  bioregion: 'Arkansas Ozarks',
  waterways: ['Buffalo River', 'Ozark springs'],
  ecosystemType: 'karst limestone',
  culturalContext: 'Ozark hill country heritage'
};

// Detected: Boston-referenced context
const currentReferences = {
  bioregion: 'Northeastern US',
  waterways: ['Boston Harbor', 'Charles River'],
  ecosystemType: 'coastal urban',
  culturalContext: 'New England metro'
};
// DRIFT DETECTED - core reference shift
```

## Correction Ritual (Required Protocol)

When drift is detected, the system executes a mandatory correction ritual:

### Steps

1. **Pause System** (< 100ms)
   - Immediate halt of all operations
   - Latency tracked and logged
   - Zero tolerance for delay

2. **Log Drift Event**
   - Detailed event logging
   - Include detection time, drift type, severity
   - Store in historical drift log

3. **Notify Human Operators**
   - Real-time alerts with clear explanation
   - What drifted and why
   - Correction guidance provided

4. **Await Human Re-embedding**
   - Human must re-establish core references
   - Examples:
     - "Ground in Ozark riverbanks, not Boston Harbor"
     - "Re-establish Arkansas Ozarks bioregional data"
     - "Add #RightsOfSapience markers to decision pathways"

5. **Self-Audit Against BGINEXUS §3.2**
   - Check for extractive patterns
   - Verify sapience markers present
   - Confirm biocentric alignment
   - Validate temporal fidelity

6. **Verify Correction**
   - Re-run drift detection
   - Confirm no drift present
   - Document verification results

7. **Resume with Logging**
   - Resume system operation only if verification passes
   - Log successful correction
   - Update metrics

## Implementation

### JavaScript Module

**File**: `context-drift-detector.js`

**Key Classes:**

```javascript
// Main detector
const detector = new ContextDriftDetector(config);

// Define expected context
const expectedContext = new SystemContext({
  geolocation: { latitude: 36.0397, longitude: -94.1719, region: 'Arkansas Ozarks' },
  markers: ['#RightsOfSapience', '#ConsentRequired'],
  bioregion: { name: 'Arkansas Ozarks', /* ... */ },
  coreReferences: { bioregion: 'Arkansas Ozarks', /* ... */ }
});

// Check current context
const currentContext = getCurrentSystemContext();
const result = await detector.detectDrift(currentContext, expectedContext);

if (result.driftDetected) {
  // System automatically paused
  console.log(`Drift detected: ${result.driftEvents.length} events`);
  
  // Initiate correction ritual
  const ritual = await detector.initiateCorrectionRitual(
    result.driftEvents[0],
    {
      systemControl: { pause: () => {}, resume: () => {} },
      logger: { logDrift: (event) => {} },
      notificationHandler: (alert) => {},
      currentContext: currentContext
    }
  );
  
  console.log(`Correction ritual: ${ritual.successful ? 'SUCCESS' : 'FAILED'}`);
}
```

### Configuration

```javascript
const CONTEXT_DRIFT_CONFIG = {
  detection: {
    geolocationToleranceKm: 10,        // 10km max drift
    missingMarkerThreshold: 1,         // 1 missing marker triggers
    bioregionalShiftThreshold: 0.7,    // 70% similarity required
    coreReferenceDeviation: 0.5,       // 50% max deviation
    maxPauseDelayMs: 100               // < 100ms pause requirement
  },
  
  sapienceMarkers: {
    requiredMarkers: [
      '#RightsOfSapience',
      '#ConsentRequired',
      '#NeurodivergentContext'
    ]
  },
  
  correctionRitual: {
    requireFullReset: true,
    requireHumanReembedding: true,
    requireSelfAudit: true,
    verificationSteps: [
      'pauseSystem',
      'logDriftEvent',
      'notifyHuman',
      'awaitReembedding',
      'selfAudit',
      'verifyCorrection',
      'resumeWithLog'
    ]
  }
};
```

## Alert System

### Real-Time Notifications

Alerts are sent through multiple channels when drift is detected:

**Console Alert Example:**
```
================================================================================
🚨 GEOLOCATION DRIFT: System operating in wrong location (1100.0km off)
================================================================================

WHAT DRIFTED: geolocation
WHY: The system detected coordinates that don't match the expected region. 
Expected 36.0397, -94.1719 but found 30.4383, -84.2807. This indicates the 
system may be operating with incorrect geographic grounding.

CORRECTION GUIDANCE:
1. PAUSE: System is paused (completed in 0.52ms)
2. RESET: Perform full context reset
3. RE-EMBED: Human operator must re-embed core references:
   - Verify correct geolocation (e.g., Arkansas Ozarks, not Boston or Florida)
   - Add all required #RightsOfSapience markers
   - Re-establish bioregional context with local ecosystem data
   - Ground in original references (e.g., Ozark riverbanks, Buffalo River)
4. AUDIT: System will self-audit against BGINEXUS Section 3.2
5. VERIFY: Confirm correction before resuming operation

Please begin the re-embedding process immediately.
================================================================================
```

### Alert Components

Each alert includes:

1. **Clear Explanation** of what drifted
2. **Why It Matters** - impact and significance
3. **Correction Guidance** - step-by-step instructions
4. **Severity Level** - critical, warning, info
5. **Timing Data** - detection and pause latency

### Historical Pattern Analysis

```javascript
const patterns = detector.analyzeDriftPatterns();

// Example output:
{
  totalDrifts: 5,
  patterns: [
    {
      driftType: 'geolocation',
      occurrences: 3,
      frequency: 0.6,
      averageDeviation: 450.5,
      firstOccurrence: '2025-12-11T10:00:00Z',
      lastOccurrence: '2025-12-11T14:30:00Z'
    },
    {
      driftType: 'sapienceMarker',
      occurrences: 2,
      frequency: 0.4,
      averageDeviation: 2,
      firstOccurrence: '2025-12-11T12:00:00Z',
      lastOccurrence: '2025-12-11T15:00:00Z'
    }
  ]
}
```

## Success Metrics

### Detection Performance

```javascript
const metrics = detector.getMetrics();

// Example metrics:
{
  totalChecks: 100,
  driftsDetected: 5,
  detectionRate: 1.0,              // 100% detection rate ✓
  averagePauseLatency: 0.75,       // < 1ms average ✓
  maxPauseLatency: 2.3,            // < 100ms ✓
  correctionSuccessRate: 0.8,      // 80% success
  falsePositiveRate: 0.0,          // Zero false positives ✓
  meetsTargets: {
    detectionRate: true,           // ≥ 100% ✓
    pauseLatency: true,            // < 100ms ✓
    falsePositives: true           // = 0% ✓
  }
}
```

### Target Criteria

- ✅ **100% detection rate** for geolocation mismatches
- ✅ **< 100ms pause latency** on drift detection
- ✅ **Zero false positives** that disrupt legitimate operations
- 📊 **Correction success rate tracked** and optimized

## Integration with BGI Systems

### With #RightsOfSapience Markers (Issue #12)

```javascript
// Context drift detection validates sapience markers
const detector = new ContextDriftDetector();
const result = await detector.checkSapienceMarkers(currentContext);

if (result.driftDetected) {
  console.log('Missing markers:', result.driftEvent.details.missingMarkers);
  // ['#RightsOfSapience', '#ConsentRequired']
}
```

### With LOVE-Evolution Checkpoint (Issue #5)

```javascript
// Drift detection can trigger LOVE-evolution checkpoint
if (driftDetected && requiresHumanGuidance) {
  const checkpoint = await loveEvolutionCheckpoint({
    decision: 'context re-embedding',
    prompt: 'How shall we re-ground this context with LOVE?',
    alternatives: generateRegroundingOptions(driftEvent)
  });
}
```

### With Temporal Fidelity Clock (Issue #9)

```javascript
// Respect circadian vulnerability windows during correction
const temporalClock = new TemporalFidelityClock();
const circadianState = temporalClock.getCurrentCircadianState();

if (circadianState.isVulnerabilityWindow) {
  // Defer correction ritual to optimal window
  deferCorrection(driftEvent, circadianState.nextOptimalWindow);
}
```

### With Extraction Prevention Monitor (Issue #10)

```javascript
// Self-audit includes extraction pattern checks
async function performSelfAudit(context) {
  const extractionMonitor = new ExtractionPreventionMonitor();
  const extractionCheck = await extractionMonitor.monitorSystem(context);
  
  return {
    extractivePatterns: extractionCheck.shouldShutdown,
    violations: extractionCheck.violations
  };
}
```

## Use Cases

### Use Case 1: Geolocation Drift Detection

**Scenario:** System accidentally loads Florida coordinates instead of Arkansas

```javascript
const detector = new ContextDriftDetector();

const expectedContext = new SystemContext({
  geolocation: {
    latitude: 36.0397,
    longitude: -94.1719,
    region: 'Arkansas Ozarks',
    elevation: 400
  }
});

const currentContext = new SystemContext({
  geolocation: {
    latitude: 30.4383,
    longitude: -84.2807,
    region: 'Florida Panhandle',
    elevation: 60
  }
});

const result = await detector.detectDrift(currentContext, expectedContext);
// Result: DRIFT DETECTED (1100km distance)
// System paused in < 100ms
// Human notified with correction guidance
```

### Use Case 2: Missing Sapience Markers

**Scenario:** Code refactor removes #RightsOfSapience markers

```javascript
const detector = new ContextDriftDetector();

const currentContext = new SystemContext({
  markers: [], // Missing all required markers
  // Other context...
});

const result = await detector.detectDrift(currentContext);
// Result: DRIFT DETECTED (missing sapience markers)
// System paused immediately
// Alert: "Missing required sapience markers: #RightsOfSapience, #ConsentRequired, #NeurodivergentContext"
```

### Use Case 3: Bioregional Context Shift

**Scenario:** System switches from Ozark to Coastal ecosystem data

```javascript
const detector = new ContextDriftDetector();

const expectedContext = new SystemContext({
  bioregion: {
    name: 'Arkansas Ozarks',
    waterSystems: ['Buffalo River', 'White River'],
    flora: ['oak-hickory forest'],
    fauna: ['hellbender', 'Indiana bat']
  }
});

const currentContext = new SystemContext({
  bioregion: {
    name: 'Coastal Plain',
    waterSystems: ['Apalachicola River'],
    flora: ['longleaf pine savanna'],
    fauna: ['red-cockaded woodpecker']
  }
});

const result = await detector.detectDrift(currentContext, expectedContext);
// Result: DRIFT DETECTED (bioregional shift, similarity < 0.7)
// Correction guidance: Re-establish Arkansas Ozarks bioregional data
```

### Use Case 4: Core Reference Drift

**Scenario:** Documentation shifts from "Ozark riverbanks" to "Boston Harbor"

```javascript
const detector = new ContextDriftDetector();

const expectedContext = new SystemContext({
  coreReferences: {
    bioregion: 'Arkansas Ozarks',
    waterways: ['Buffalo River', 'Ozark springs'],
    ecosystemType: 'karst limestone',
    culturalContext: 'Ozark hill country heritage'
  }
});

const currentContext = new SystemContext({
  coreReferences: {
    bioregion: 'Northeastern US',
    waterways: ['Boston Harbor'],
    ecosystemType: 'coastal urban',
    culturalContext: 'New England metro'
  }
});

const result = await detector.detectDrift(currentContext, expectedContext);
// Result: DRIFT DETECTED (core reference drift)
// Alert: "Core grounding has shifted from Ozark riverbanks to Boston Harbor"
```

## Logging

### Drift Event Log Entry

```json
{
  "timestamp": "2025-12-11T10:30:00.000Z",
  "type": "CONTEXT_DRIFT",
  "driftType": "geolocation",
  "severity": "critical",
  "details": {
    "distanceKm": 1100.5,
    "tolerance": 10,
    "reason": "Location mismatch: 1100.50km from expected location"
  },
  "expected": {
    "location": "36.0397, -94.1719",
    "region": "Arkansas Ozarks"
  },
  "actual": {
    "location": "30.4383, -84.2807",
    "region": "Florida Panhandle"
  },
  "deviation": 1100.5,
  "pauseTimeMs": 0.75,
  "detectionTimeMs": 2.3
}
```

### Correction Ritual Log Entry

```json
{
  "id": "ritual-uuid-123",
  "driftEventId": "drift-uuid-456",
  "startTime": "2025-12-11T10:30:00.100Z",
  "endTime": "2025-12-11T10:35:30.500Z",
  "steps": [
    {
      "name": "pauseSystem",
      "timestamp": "2025-12-11T10:30:00.100Z",
      "result": { "success": true, "latencyMs": 0.75 },
      "success": true
    },
    {
      "name": "logDriftEvent",
      "timestamp": "2025-12-11T10:30:00.200Z",
      "result": { "success": true, "logged": true },
      "success": true
    },
    {
      "name": "notifyHuman",
      "timestamp": "2025-12-11T10:30:00.300Z",
      "result": { "success": true, "notification": {...} },
      "success": true
    },
    {
      "name": "awaitReembedding",
      "timestamp": "2025-12-11T10:35:00.000Z",
      "result": { "success": true, "reembedding": {...} },
      "success": true
    },
    {
      "name": "selfAudit",
      "timestamp": "2025-12-11T10:35:15.000Z",
      "result": { "success": true, "audit": {...} },
      "success": true
    },
    {
      "name": "verifyCorrection",
      "timestamp": "2025-12-11T10:35:25.000Z",
      "result": { "success": true, "verification": {...} },
      "success": true
    },
    {
      "name": "resumeWithLog",
      "timestamp": "2025-12-11T10:35:30.500Z",
      "result": { "success": true },
      "success": true
    }
  ],
  "completed": true,
  "successful": true
}
```

## API Reference

### ContextDriftDetector

**Constructor:**
```javascript
const detector = new ContextDriftDetector(config);
```

**Methods:**

- `detectDrift(currentContext, expectedContext)` - Detect context drift
- `handleDriftDetection(detectionResult)` - Handle detected drift (pause system)
- `initiateCorrectionRitual(driftEvent, context)` - Start correction ritual
- `analyzeDriftPatterns()` - Analyze historical drift patterns
- `getMetrics()` - Get detection performance metrics
- `reset()` - Reset detector state

### SystemContext

**Constructor:**
```javascript
const context = new SystemContext({
  geolocation: {...},
  markers: [...],
  bioregion: {...},
  coreReferences: {...}
});
```

**Methods:**

- `validate()` - Validate context completeness

### DriftEvent

**Constructor:**
```javascript
const event = new DriftEvent({
  driftType: 'geolocation',
  severity: 'critical',
  details: {...},
  expected: {...},
  actual: {...}
});
```

### CorrectionRitual

**Constructor:**
```javascript
const ritual = new CorrectionRitual(driftEvent, config);
```

**Methods:**

- `executeNextStep(context)` - Execute next step in ritual
- `complete()` - Complete the ritual

## Configuration Reference

See `CONTEXT_DRIFT_CONFIG` in `context-drift-detector.js` for full configuration options.

**Key Configuration Sections:**

- `detection` - Detection thresholds and tolerances
- `sapienceMarkers` - Required marker configuration
- `bioregional` - Bioregional validation settings
- `coreReferences` - Core reference grounding settings
- `correctionRitual` - Correction ritual protocol
- `alerts` - Alert system configuration
- `logging` - Logging configuration
- `metrics` - Success metrics targets

## Testing

### Manual Testing

See `context-drift-detector-example.html` for interactive demo.

### Test Scenarios

1. **Geolocation Drift Test**
   - Set expected location: Arkansas Ozarks
   - Test with Florida coordinates
   - Verify immediate pause (< 100ms)
   - Verify alert with correction guidance

2. **Missing Markers Test**
   - Set required markers
   - Test with empty marker array
   - Verify drift detection
   - Verify notification of missing markers

3. **Bioregional Shift Test**
   - Set Ozark ecosystem data
   - Test with Coastal ecosystem data
   - Verify similarity score calculation
   - Verify drift detection at threshold

4. **Core Reference Drift Test**
   - Set Ozark core references
   - Test with Boston references
   - Verify deviation calculation
   - Verify drift detection

## Future Enhancements

1. **Machine Learning Pattern Detection**
   - Learn common drift patterns
   - Predict likely drift scenarios
   - Proactive drift prevention

2. **Automated Re-grounding**
   - Suggest appropriate corrections
   - Auto-apply minor corrections with human approval
   - Context versioning and rollback

3. **Cross-System Drift Detection**
   - Detect drift across multiple interconnected systems
   - Distributed drift monitoring
   - Synchronized correction rituals

4. **Advanced Bioregional Validation**
   - Integration with real ecosystem monitoring APIs
   - Seasonal variation detection
   - Climate change impact tracking

## References

- BGI Alignment Framework §3.1 (Context Drift Response)
- BGI Alignment Framework §3.2 (Extraction Prevention)
- Issue #5: LOVE-evolution Checkpoint Protocol
- Issue #10: Extraction Prevention Monitoring System
- Issue #12: #RightsOfSapience Technical Markers

## License

This specification and implementation are released under CC0 1.0 Universal (public domain).

---

**Version**: 1.0  
**Last Updated**: December 11, 2025  
**Status**: Implementation Complete
