# Temporal Fidelity Clock System

**Status**: Implementation v1.0  
**Related Issue**: [#9](https://github.com/Violet-Site-Systems/DAC/issues/9)  
**BGI Framework Section**: 1.3, 2.2

## Overview

The Temporal Fidelity Clock System implements biological and seasonal rhythm synchronization per BGI Framework Section 1.3, replacing machine-time optimization with natural rhythm alignment. The system ensures that all operations synchronize with biological, circadian, seasonal, and ecological cycles rather than optimizing for machine speed or 24/7 availability.

## Core Principle

**Synchronization with biological/seasonal rhythms (not machine time)**

All system operations must respect:
- Circadian rhythms and vulnerability windows
- Seasonal ecological patterns
- Lunar cycles (where bioregionally relevant)
- Phenological events (seasonal biological phenomena)
- Neurodivergent cognition patterns

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│         Temporal Fidelity Clock System                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Circadian       │  │   Seasonal       │           │
│  │  Rhythm Engine   │  │   Calendar       │           │
│  │                  │  │                  │           │
│  │ • Vulnerability  │  │ • Season phases  │           │
│  │   windows        │  │ • Phenology      │           │
│  │ • Optimal times  │  │ • Bioregional    │           │
│  │ • Decision       │  │   events         │           │
│  │   fatigue        │  │                  │           │
│  └────────┬─────────┘  └────────┬─────────┘           │
│           │                     │                      │
│           └──────────┬──────────┘                      │
│                      ↓                                 │
│           ┌──────────────────────┐                    │
│           │  Decision Pause      │                    │
│           │  Evaluation          │                    │
│           │                      │                    │
│           │ • Block critical     │                    │
│           │ • Flag moderate      │                    │
│           │ • Suggest deferral   │                    │
│           │ • Human override     │                    │
│           └──────────┬───────────┘                    │
│                      │                                 │
│                      ↓                                 │
│           ┌──────────────────────┐                    │
│           │  Ancestral           │                    │
│           │  Accountability      │                    │
│           │                      │                    │
│           │ • Seasonal impacts   │                    │
│           │ • Long-term tracking │                    │
│           │ • 7 generation audit │                    │
│           └──────────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Biological Rhythm Synchronization Engine

Tracks and aligns operations with biological rhythms:

#### Circadian Cycle Tracking
- **Vulnerability Windows**: Times when cognitive performance degrades
  - Critical: 2-4 AM (deep circadian low)
  - Moderate: 1-3 PM (post-lunch dip)
  - Moderate: 10 PM-midnight (evening fatigue)
- **Optimal Windows**: Peak cognitive performance periods
  - Morning: 9-11 AM
  - Afternoon: 3-5 PM
- **Customizable**: Per-user vulnerability/optimal windows for neurodivergent patterns

#### Decision Fatigue Detection
- Tracks number of decisions in rolling time window
- Threshold-based fatigue detection
- Automatic rest period recommendations

### 2. Seasonal/Ecological Calendar

Integrates seasonal patterns into decision-making:

#### Season Phases
- **Spring**: Renewal/Growth energy (March 20 - June 20, Northern Hemisphere)
- **Summer**: Peak Activity (June 21 - September 22)
- **Autumn**: Harvest/Preparation (September 23 - December 20)
- **Winter**: Rest/Regeneration (December 21 - March 19)

#### Seasonal Decision Weighting
Each season has different energy patterns that influence decision appropriateness:
- Spring: Growth (1.2×), Risk (1.1×), Planning (1.0×)
- Summer: Activity (1.2×), Implementation (1.1×), Maintenance (1.0×)
- Autumn: Consolidation (1.2×), Preparation (1.1×), Reflection (1.1×)
- Winter: Rest (1.3×), Planning (1.2×), Strategic (1.1×)

### 3. Lunar Cycle Tracking

Tracks lunar phases and their bioregional influences:

#### Lunar Phases
- 🌑 New Moon: Introspection, energy level 0.7
- 🌒 Waxing Crescent: Planning, energy level 0.8
- 🌓 First Quarter: Action, energy level 0.9
- 🌔 Waxing Gibbous: Refinement, energy level 1.0
- 🌕 Full Moon: Culmination, energy level 1.1
- 🌖 Waning Gibbous: Gratitude, energy level 1.0
- 🌗 Last Quarter: Release, energy level 0.9
- 🌘 Waning Crescent: Rest, energy level 0.8

Calculated using astronomical algorithms based on synodic month (29.53059 days).

### 4. Bioregional Phenology

Tracks seasonal biological phenomena specific to bioregions:

#### Arkansas Ozarks Reference Implementation
- Spring ephemeral bloom (March-April) - High significance
- Firefly emergence (May-June) - Medium significance
- Monarch migration south (September-October) - High significance
- Leaf fall/dormancy (October-November) - High significance

**Extensible**: Framework supports adding phenology data for any bioregion.

### 5. Decision Pause System

Implements intelligent decision blocking/flagging during vulnerability periods:

#### Severity Levels
- **Critical**: Block critical decisions, require override
- **Moderate**: Flag decisions, suggest deferral, allow override
- **Low**: Informational only

#### Decision Pause Logic
```javascript
if (circadian.isVulnerable && decision.criticality === 'high') {
  blockDecision = true;
  suggestDeferralTime = findNextOptimalWindow();
  allowOverride = true;  // with explicit acknowledgment
}

if (decisionFatigue.fatigued) {
  flagDecision = true;
  recommendRest = true;
}

if (neurodivergent.pattern === 'bipolar' && moodPhase === 'manic' && decision.type === 'financial') {
  flagDecision = true;
  suggestSupportPerson = true;
}
```

#### Human Override
- Explicit acknowledgment required (minimum 10 characters)
- Maximum overrides per day (default: 3)
- All overrides logged for audit
- Cannot override if system disabled overrides

### 6. Neurodivergent Cognition Support

Adapts to neurodivergent patterns:

#### Bipolar Cycle Support
- Tracks mood phases (manic, depressive, stable)
- Flags specific decision types during vulnerable phases
- Recommends support person consultation

#### ADHD Support
- Time blindness awareness
- Hyperfocus detection
- Break reminders

#### Autism Spectrum Support
- Routine preservation
- Transition support
- Predictable structure

### 7. Ancestral Accountability

Links decisions to ecological consequences across time:

#### Temporal Context Recording
Every decision records:
- Circadian phase at time of decision
- Seasonal phase and energy
- Lunar phase and influence
- Active phenology events

#### Seasonal Impact Assessment
- Alignment score (0-1) with current seasonal energy
- Considerations for ecological timing
- Long-term rhythm alignment

#### Multi-Generational Tracking
Review schedule for decision consequences:
- **Immediate**: 1 year - Verify implementation
- **Near-term**: 5 years - Assess early impacts
- **Medium-term**: 25 years - First generation review
- **Long-term**: 50 years - Second generation review
- **Deep time**: 200 years - Seventh generation audit

## Anti-Patterns Prevention

The system actively detects and prevents:

### 1. 24/7 Always-On Optimization Pressure
- **Detection**: Continuous operation > 24 hours without rest
- **Response**: Violation logged, rest period mandated
- **Severity**: High

### 2. Ignoring Natural Rest/Regeneration Cycles
- **Detection**: No rest period for > 7 days
- **Response**: Immediate rest period scheduled
- **Severity**: Medium

### 3. Machine-Speed Decisions on Human-Scale Problems
- **Detection**: High-complexity decision made in < 1 second
- **Response**: Mandatory reflection period
- **Severity**: High

### 4. Compression of Biological Processes
- **Detection**: Process duration < 50% of natural timeline
- **Response**: Timeline extension required
- **Severity**: Critical

## API Reference

### Core Functions

#### `assessTemporalFidelity(decision, userProfile, recentDecisions, systemState, options)`

Performs complete temporal fidelity assessment.

**Parameters**:
- `decision` (Object): Decision to assess
  - `id`: Unique identifier
  - `type`: Decision type ('growth', 'financial', 'implementation', etc.)
  - `criticality`: 'low', 'medium', 'high'
  - `complexity`: 'low', 'medium', 'high'
- `userProfile` (Object, optional): User profile with neurodivergent patterns
  - `pattern`: 'bipolar', 'adhd', 'autism_spectrum', etc.
  - `vulnerabilityWindows`: Custom vulnerability windows
  - `optimalWindows`: Custom optimal windows
  - `currentMoodPhase`: For bipolar pattern
- `recentDecisions` (Array, optional): Recent decision history
- `systemState` (Object, optional): Current system state
- `options` (Object, optional):
  - `bioregion`: 'arkansasOzarks', etc.
  - `hemisphere`: 'northern' or 'southern'
  - `config`: Custom configuration

**Returns**: `TemporalFidelityResult` object containing:
- `temporalState`: Current temporal state
- `decisionPause`: Decision pause recommendation (if any)
- `biologicalAlignment`: Score 0-1
- `recommendations`: Array of recommendation strings
- `violations`: Array of anti-pattern violations
- `allowProceed`: Boolean indicating if decision should proceed
- `ancestralAccountability`: Accountability record

**Example**:
```javascript
const result = assessTemporalFidelity(
  {
    id: 'dec-123',
    type: 'financial',
    criticality: 'high',
    complexity: 'high'
  },
  {
    pattern: 'bipolar',
    currentMoodPhase: 'manic',
    vulnerabilityWindows: [
      { start: '02:00', end: '05:00', severity: 'critical', label: 'My deep low' }
    ]
  },
  recentDecisions,
  systemState,
  { bioregion: 'arkansasOzarks', hemisphere: 'northern' }
);

console.log(result.getAssessmentSummary());
```

#### `getCircadianPhase(datetime, userProfile, config)`

Get current circadian phase.

**Returns**: Object with:
- `phase`: 'vulnerability', 'optimal', or 'normal'
- `severity`: 'none', 'moderate', 'critical'
- `label`: Human-readable label
- `isOptimal`: Boolean
- `isVulnerable`: Boolean
- `window`: Window definition object

#### `getSeasonalPhase(datetime, hemisphere, config)`

Get current seasonal phase.

**Returns**: Object with:
- `season`: 'spring', 'summer', 'autumn', 'winter'
- `label`: Full season label with energy description
- `weights`: Decision weighting factors
- `hemisphere`: 'northern' or 'southern'

#### `getLunarPhase(datetime, config)`

Calculate current lunar phase.

**Returns**: Object with:
- `phase`: Phase name
- `emoji`: Lunar phase emoji
- `age`: Days since new moon
- `influence`: Influence type
- `energyLevel`: Relative energy level (0.7-1.1)
- `label`: Human-readable label with emoji

#### `evaluateDecisionPause(decision, userProfile, recentDecisions, config)`

Evaluate if decision should be paused.

**Returns**: `DecisionPause` object or `null` if no pause needed.

#### `processOverride(decisionPause, userProfile, acknowledgment, config)`

Process human override of decision pause.

**Parameters**:
- `decisionPause`: DecisionPause object being overridden
- `userProfile`: User profile
- `acknowledgment`: Explicit acknowledgment text (min 10 chars)
- `config`: Configuration

**Returns**: Object with:
- `allowed`: Boolean
- `reason`: String (if not allowed)
- `overrideId`: UUID (if allowed)
- `timestamp`: ISO timestamp (if allowed)

### Data Classes

#### `TemporalState`
Represents temporal state at a moment.

**Properties**:
- `timestamp`: ISO timestamp
- `circadianPhase`: Circadian phase object
- `seasonalPhase`: Seasonal phase object
- `lunarPhase`: Lunar phase object
- `phenologyEvents`: Array of active events
- `vulnerabilityLevel`: 'normal', 'moderate', 'critical'
- `optimalForDecisions`: Boolean
- `bioregion`: String

**Methods**:
- `getSummary()`: Human-readable summary string

#### `DecisionPause`
Represents a decision pause recommendation.

**Properties**:
- `timestamp`: ISO timestamp
- `reason`: String describing why
- `severity`: 'moderate' or 'critical'
- `blockDecision`: Boolean
- `flagOnly`: Boolean
- `suggestedDeferralTime`: ISO timestamp
- `overrideAllowed`: Boolean
- `overrideRequiresAck`: Boolean
- `neurodivergentContext`: Object with pattern-specific data

**Methods**:
- `getRecommendation()`: Formatted recommendation message

#### `TemporalFidelityResult`
Complete assessment result.

**Properties**:
- `timestamp`: ISO timestamp
- `assessmentId`: UUID
- `temporalState`: TemporalState object
- `decisionPause`: DecisionPause object or null
- `biologicalAlignment`: Number 0-1
- `recommendations`: Array of strings
- `violations`: Array of violation objects
- `allowProceed`: Boolean
- `ancestralAccountability`: Accountability record object

**Methods**:
- `shouldProceed()`: Boolean - whether decision should proceed
- `getAssessmentSummary()`: Object with formatted summary

## Configuration

Default configuration in `TEMPORAL_FIDELITY_CONFIG` includes all thresholds, windows, and behavior settings. All aspects are configurable:

```javascript
const customConfig = {
  ...TEMPORAL_FIDELITY_CONFIG,
  circadian: {
    ...TEMPORAL_FIDELITY_CONFIG.circadian,
    defaultVulnerabilityWindows: [
      { start: '01:00', end: '05:00', severity: 'critical', label: 'Custom deep low' }
    ]
  }
};

const result = assessTemporalFidelity(decision, userProfile, [], {}, { config: customConfig });
```

## Integration with Existing Modules

### LOVE-Evolution Checkpoint
The Temporal Fidelity Clock integrates with LOVE-Evolution Checkpoint to:
- Detect circadian vulnerability during uncertainty checkpoints
- Defer checkpoints to optimal windows when appropriate
- Provide temporal context in collaborative decision-making

### Extraction Prevention Monitor
The Temporal Fidelity Clock provides data to Extraction Prevention Monitor:
- Biological rhythm alignment scores
- Temporal compression detection
- 24/7 pressure pattern detection

### Intergenerational Audit Framework
The Temporal Fidelity Clock supports intergenerational audits:
- Provides seasonal impact assessment
- Tracks long-term rhythm alignment
- Generates multi-generational review schedules

## Usage Examples

### Example 1: Basic Decision Assessment

```javascript
const decision = {
  id: 'dec-456',
  type: 'implementation',
  criticality: 'medium',
  complexity: 'medium'
};

const result = assessTemporalFidelity(decision);

if (result.shouldProceed()) {
  console.log('Decision may proceed');
  console.log('Biological alignment:', result.biologicalAlignment);
  console.log('Recommendations:', result.recommendations);
} else {
  console.log('Decision should be paused');
  console.log(result.decisionPause.getRecommendation());
}
```

### Example 2: Neurodivergent User Support

```javascript
const userProfile = {
  id: 'user-789',
  pattern: 'bipolar',
  currentMoodPhase: 'manic',
  vulnerabilityWindows: [
    { start: '02:00', end: '05:00', severity: 'critical', label: 'My circadian low' },
    { start: '14:00', end: '15:00', severity: 'moderate', label: 'Post-lunch dip' }
  ],
  optimalWindows: [
    { start: '10:00', end: '12:00', label: 'My morning peak' }
  ]
};

const decision = {
  id: 'dec-789',
  type: 'financial',
  criticality: 'high',
  complexity: 'high'
};

const result = assessTemporalFidelity(decision, userProfile);

if (result.decisionPause && result.decisionPause.neurodivergentContext) {
  console.log('Neurodivergent-specific pause:', result.decisionPause.reason);
  console.log('Context:', result.decisionPause.neurodivergentContext);
}
```

### Example 3: Human Override

```javascript
const decision = {
  id: 'dec-urgent',
  type: 'emergency',
  criticality: 'high'
};

const result = assessTemporalFidelity(decision, userProfile);

if (result.decisionPause && result.decisionPause.blockDecision) {
  console.log('Decision blocked:', result.decisionPause.reason);
  
  if (result.decisionPause.overrideAllowed) {
    const acknowledgment = 'I understand this is a vulnerability window but this is an emergency situation requiring immediate action.';
    
    const overrideResult = processOverride(
      result.decisionPause,
      userProfile,
      acknowledgment
    );
    
    if (overrideResult.allowed) {
      console.log('Override granted:', overrideResult.overrideId);
      // Proceed with decision
    } else {
      console.log('Override denied:', overrideResult.reason);
    }
  }
}
```

### Example 4: Seasonal Alignment Check

```javascript
const decision = {
  id: 'dec-growth',
  type: 'growth',
  criticality: 'medium'
};

const result = assessTemporalFidelity(
  decision,
  null,
  [],
  {},
  { bioregion: 'arkansasOzarks', hemisphere: 'northern' }
);

console.log('Current season:', result.temporalState.seasonalPhase.season);
console.log('Seasonal alignment:', result.ancestralAccountability.seasonalImpacts.alignment);
console.log('Considerations:', result.ancestralAccountability.seasonalImpacts.considerations);

if (result.temporalState.phenologyEvents.length > 0) {
  console.log('Active phenology events:');
  result.temporalState.phenologyEvents.forEach(event => {
    console.log(`  • ${event.name} (${event.significance})`);
  });
}
```

### Example 5: Anti-Pattern Detection

```javascript
const systemState = {
  continuousOperationHours: 48,
  lastRestPeriod: '2025-12-01T00:00:00Z',
  recentDecisions: [
    { decisionTimeMs: 500, complexity: 'high', timestamp: '2025-12-15T10:00:00Z' },
    { decisionTimeMs: 300, complexity: 'high', timestamp: '2025-12-15T10:05:00Z' }
  ],
  biologicalProcesses: [
    { name: 'Ecosystem regeneration', naturalDuration: 100, actualDuration: 30 }
  ]
};

const result = assessTemporalFidelity(decision, null, [], systemState);

if (result.violations.length > 0) {
  console.log('Anti-patterns detected:');
  result.violations.forEach(violation => {
    console.log(`  [${violation.severity}] ${violation.type}: ${violation.description}`);
    console.log(`    → ${violation.recommendation}`);
  });
}
```

## Success Criteria

✅ System operations align with biological rhythms  
✅ Critical decisions blocked during vulnerability windows  
✅ Seasonal patterns integrated into planning/optimization  
✅ No temporal compression that violates biological rhythms  
✅ Neurodivergent cognition patterns supported  
✅ Human override available with explicit acknowledgment  
✅ All decisions traceable to ecological consequences over time  
✅ Anti-patterns actively detected and prevented

## Implementation Notes

### Browser Support
The module works in both Node.js and browser environments:
- Node.js: Use `require()` or `import`
- Browser: Access via `window.TemporalFidelityClock`

### Persistence
The reference implementation uses in-memory data structures. For production:
- Persist user profiles and vulnerability windows
- Store decision history for fatigue detection
- Log all overrides to audit trail
- Track anti-pattern violations over time

### Bioregional Customization
To add a new bioregion:
1. Define phenology events in config
2. Adjust seasonal definitions if needed (e.g., monsoon seasons)
3. Configure lunar influence if relevant to bioregion
4. Update seasonal decision weights

### Time Zone Handling
All timestamps use ISO 8601 format. Ensure:
- User profile windows are in user's local time
- Server-side processing converts appropriately
- Display times in user's local time zone

## Related Documentation

- [BGI Alignment Framework](../BENEFICIAL%20AGI%20(BGI)%20ALIGNMENT%20FRAMEWORK%20v2.1.txt)
- [LOVE-Evolution Checkpoint Protocol](./love-evolution-checkpoint.md)
- [Extraction Prevention Monitoring System](./extraction-prevention-monitor.md)
- [Intergenerational Consequence Audit Framework](./intergenerational-audit.md)
- [#RightsOfSapience Technical Markers](./sapience-markers.md)

## Contributing

Contributions welcome! Particularly valuable:
- Additional bioregional phenology data
- Neurodivergent pattern refinements
- Anti-pattern detection improvements
- Integration examples
- Case studies from production use

## License

CC0 1.0 Universal (Public Domain)

---

**Version**: 1.0  
**Last Updated**: January 8, 2026  
**Status**: Implementation Complete
