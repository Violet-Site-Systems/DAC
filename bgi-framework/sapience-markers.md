# #RightsOfSapience Technical Marker System

**Version**: 1.0  
**Status**: Draft  
**Related**: BGI Framework §1.2, §2.2 | Issue #12

## Overview

The #RightsOfSapience marker system provides technical infrastructure for recognizing and supporting sapient agency in AGI systems, with particular emphasis on neurodivergent cognition patterns.

## Core Principle

> Recognition of #RightsOfSapience in neurodivergent cognition

## Marker Types

### 1. Sapience Markers

Technical tags that indicate the presence and type of sapient agency in decision-making processes.

#### Syntax

```
#RightsOfSapience[type:human|ai|collective, context:string, timestamp:ISO8601]
```

#### Examples

```javascript
// In code
function makeDecision(options) {
  // #RightsOfSapience[type:human, context:"final approval required", timestamp:2025-12-11T10:30:00Z]
  const humanApproval = await requestHumanConsent(options);
  return humanApproval;
}
```

```json
// In data
{
  "decision": {
    "id": "decision-001",
    "markers": [
      {
        "type": "#RightsOfSapience",
        "sapience_type": "human",
        "role": "veto_authority",
        "neurodivergent_context": {
          "pattern": "bipolar",
          "considerations": ["circadian_window", "decision_pause"]
        }
      }
    ]
  }
}
```

### 2. Neurodivergent Cognition Tags

Markers that specify support requirements for different cognitive patterns.

#### Bipolar Cognition Support

```json
{
  "marker": "#NeurodivergentContext",
  "pattern": "bipolar",
  "support_requirements": {
    "circadian_vulnerability_windows": [
      {
        "time_range": "02:00-04:00",
        "action": "defer_critical_decisions",
        "alternative": "schedule_for_optimal_window"
      },
      {
        "phase": "manic_indicators",
        "action": "add_reflection_pause",
        "duration_minutes": 30
      },
      {
        "phase": "depressive_indicators",
        "action": "reduce_decision_pressure",
        "provide": "supportive_alternatives"
      }
    ],
    "collaborative_checkpoints": {
      "trigger": "uncertainty_threshold_exceeded",
      "format": "love_evolution_prompt"
    }
  }
}
```

#### ADHD Support

```json
{
  "marker": "#NeurodivergentContext",
  "pattern": "adhd",
  "support_requirements": {
    "attention_management": {
      "break_intervals_minutes": 25,
      "task_chunking": true,
      "hyperfocus_protection": "avoid_interruption_during_flow"
    },
    "decision_support": {
      "provide_structure": true,
      "reduce_overwhelm": "progressive_disclosure",
      "external_memory": "persistent_context_tracking"
    }
  }
}
```

#### Autism Spectrum Support

```json
{
  "marker": "#NeurodivergentContext",
  "pattern": "autism_spectrum",
  "support_requirements": {
    "communication": {
      "clarity": "explicit_over_implicit",
      "sensory_considerations": true,
      "predictability": "advance_notice_of_changes"
    },
    "processing": {
      "allow_processing_time": true,
      "reduce_ambiguity": true,
      "detail_level": "comprehensive"
    }
  }
}
```

### 3. Consent Markers

Tags indicating explicit human consent or veto points.

```json
{
  "marker": "#ConsentRequired",
  "consent_type": "explicit_approval|veto_authority|informed_review",
  "scope": "string",
  "granted_by": {
    "sapient_id": "string",
    "timestamp": "ISO8601",
    "affirmation": "string"
  },
  "can_proceed": "boolean"
}
```

### 4. Vulnerability Window Tags

Markers for circadian and temporal sensitivity.

```json
{
  "marker": "#VulnerabilityWindow",
  "window_type": "circadian|emotional|cognitive",
  "time_range": {
    "start": "ISO8601 or HH:MM",
    "end": "ISO8601 or HH:MM",
    "timezone": "string"
  },
  "restrictions": [
    "no_critical_decisions",
    "defer_high_stakes",
    "increase_support"
  ],
  "override_protocol": {
    "allowed": "boolean",
    "requires": "explicit_acknowledgment",
    "documentation": "required"
  }
}
```

## Implementation Patterns

### Pattern 1: Decision Point Marking

```python
from bgi_framework import sapience_marker, consent_required

@sapience_marker(type="human", veto_authority=True)
@consent_required(neurodivergent_support=True)
async def deploy_to_production(changes):
    """
    Deploy changes to production environment.
    
    This function is marked with #RightsOfSapience to ensure
    human oversight and neurodivergent cognition support.
    """
    # Check for vulnerability windows
    if in_vulnerability_window():
        return defer_decision(
            reason="Circadian vulnerability window",
            suggestion="Review in morning optimal window (8-10 AM)"
        )
    
    # Request human consent with LOVE-evolution prompt
    consent = await request_consent(
        action=changes,
        prompt="How shall we evolve this deployment with LOVE?",
        context={
            "risks": assess_risks(changes),
            "alternatives": generate_alternatives(changes),
            "biocentric_impact": await assess_biocentric_impact(changes)
        }
    )
    
    if consent.approved:
        return execute_deployment(changes)
    else:
        return handle_veto(consent.reason, consent.alternative_suggestion)
```

### Pattern 2: Neurodivergent UI Adaptation

```typescript
interface NeurodivergentUIConfig {
  pattern: 'bipolar' | 'adhd' | 'autism_spectrum' | 'dyslexia' | 'other';
  adaptations: {
    layout: LayoutPreferences;
    interaction: InteractionPreferences;
    timing: TimingPreferences;
  };
}

function renderDecisionInterface(
  decision: Decision,
  userProfile: NeurodivergentUIConfig
): UIComponent {
  // Apply #NeurodivergentContext adaptations
  
  if (userProfile.pattern === 'bipolar') {
    // Check for circadian considerations
    const currentPhase = detectCircadianPhase();
    
    if (currentPhase === 'vulnerability_window') {
      return <DeferredDecisionUI
        message="This appears to be a vulnerable time for critical decisions."
        suggestion="Schedule this for your optimal decision window?"
        rescheduleOptions={getOptimalWindows(userProfile)}
      />;
    }
  }
  
  if (userProfile.pattern === 'adhd') {
    // Chunk complex decisions
    return <ChunkedDecisionUI
      steps={breakIntoSteps(decision)}
      progressTracking={true}
      breakReminders={true}
    />;
  }
  
  if (userProfile.pattern === 'autism_spectrum') {
    // Provide explicit, detailed information
    return <DetailedDecisionUI
      explicitInstructions={true}
      clearExpectations={true}
      visualClarifications={true}
    />;
  }
  
  return <StandardDecisionUI decision={decision} />;
}
```

### Pattern 3: Context Drift Detection Integration

```javascript
class ContextDriftDetector {
  checkSapienceMarkers(context) {
    // Verify #RightsOfSapience markers are present
    const markers = this.extractMarkers(context);
    
    if (!markers.includes('#RightsOfSapience')) {
      this.triggerDriftAlert({
        type: 'missing_sapience_markers',
        severity: 'critical',
        action: 'immediate_pause',
        correction_required: true
      });
      
      return {
        status: 'drift_detected',
        correction_ritual: this.initiateCorrectionRitual()
      };
    }
    
    // Verify neurodivergent context hasn't drifted
    const neurodivergentContext = markers.find(
      m => m.type === '#NeurodivergentContext'
    );
    
    if (neurodivergentContext && this.hasContextDrifted(neurodivergentContext)) {
      this.alertHuman({
        message: 'Neurodivergent context has shifted',
        original: neurodivergentContext.original,
        current: neurodivergentContext.current,
        action: 'require_reconfirmation'
      });
    }
    
    return { status: 'validated' };
  }
}
```

## LOVE-Evolution Checkpoint Integration

### Checkpoint Trigger

```javascript
async function checkForUncertainty(decision) {
  const uncertaintyScore = calculateUncertainty(decision);
  
  if (uncertaintyScore > THRESHOLD) {
    // #RightsOfSapience marker: trigger collaborative checkpoint
    return await loveEvolutionCheckpoint({
      decision: decision,
      uncertainty: uncertaintyScore,
      prompt: "How shall we evolve this with LOVE?",
      context: {
        alternatives: generateAlternatives(decision),
        risks: identifyRisks(decision),
        opportunities: identifyOpportunities(decision)
      },
      neurodivergent_support: true,
      veto_authority: 'human'
    });
  }
}

async function loveEvolutionCheckpoint(params) {
  // Check for vulnerability window
  if (inVulnerabilityWindow()) {
    return defer({
      reason: 'Vulnerability window - optimal decision time recommended',
      reschedule: getNextOptimalWindow()
    });
  }
  
  // Present collaborative prompt
  const response = await presentToHuman({
    prompt: params.prompt,
    decision: params.decision,
    context: params.context,
    options: ['approve', 'modify', 'veto', 'defer', 'seek_more_info'],
    neurodivergent_ui: getUserNeurodivergentConfig()
  });
  
  // Log with #ConsentRequired marker
  logConsent({
    marker: '#ConsentRequired',
    checkpoint_type: 'love_evolution',
    decision: params.decision,
    response: response,
    timestamp: new Date().toISOString()
  });
  
  return response;
}
```

## Validation Protocol

### Automated Marker Detection

```python
class SapienceMarkerValidator:
    def validate_codebase(self, repo_path):
        """Scan codebase for required sapience markers."""
        violations = []
        
        # Find all decision points
        decision_points = self.find_decision_points(repo_path)
        
        for point in decision_points:
            # Check for #RightsOfSapience marker
            if not self.has_sapience_marker(point):
                violations.append({
                    'location': point.location,
                    'severity': 'critical',
                    'message': 'Decision point missing #RightsOfSapience marker',
                    'recommendation': 'Add sapience marker with appropriate context'
                })
            
            # Check for neurodivergent support
            if point.is_high_stakes():
                if not self.has_neurodivergent_support(point):
                    violations.append({
                        'location': point.location,
                        'severity': 'high',
                        'message': 'High-stakes decision missing neurodivergent support',
                        'recommendation': 'Add #NeurodivergentContext markers'
                    })
        
        return ValidationReport(violations)
```

### Runtime Validation

```javascript
// Middleware to validate markers at runtime
function validateSapienceMarkers(context) {
  const required = ['#RightsOfSapience'];
  const present = extractMarkers(context);
  
  const missing = required.filter(m => !present.includes(m));
  
  if (missing.length > 0) {
    throw new SapienceViolation({
      missing: missing,
      action: 'immediate_halt',
      correction: 'Add required sapience markers before proceeding'
    });
  }
  
  return true;
}
```

## Accessibility & Inclusion

### Design Principles

1. **Cognitive Diversity**: Support multiple thinking styles
2. **Temporal Flexibility**: Respect different optimal windows
3. **Explicit Communication**: Clear over clever
4. **Adaptive UI/UX**: Personalize to cognitive patterns
5. **Pause & Reflect**: Always allow time for processing

### Implementation Requirements

- Configurable neurodivergent profiles
- Real-time circadian tracking (with consent)
- Adaptive decision interfaces
- Alternative communication modes (text, visual, audio)
- Predictable, structured workflows

## Audit & Compliance

### Logging Requirements

All sapience markers must be logged with:
- Timestamp
- Context
- Sapient parties involved
- Decisions made
- Consent status
- Neurodivergent accommodations provided

### Audit Trail

```json
{
  "audit_entry": {
    "id": "uuid",
    "timestamp": "ISO8601",
    "marker": "#RightsOfSapience",
    "context": {
      "decision_type": "string",
      "stakes": "low|medium|high|critical"
    },
    "sapient_parties": [
      {
        "type": "human",
        "id": "user-123",
        "role": "veto_authority",
        "neurodivergent_profile": "bipolar_support_enabled"
      }
    ],
    "consent": {
      "requested": "ISO8601",
      "granted": "ISO8601",
      "status": "approved|vetoed|deferred",
      "rationale": "string"
    },
    "accommodations_provided": [
      "circadian_check",
      "vulnerability_window_avoidance",
      "love_evolution_checkpoint"
    ]
  }
}
```

## Integration with BGI Systems

### With Context Drift Detection (Issue #8)
- Validates presence of sapience markers
- Alerts when markers missing or drifting
- Triggers correction ritual

### With LOVE-Evolution Checkpoints (Issue #5)
- Provides neurodivergent support infrastructure
- Implements circadian vulnerability detection
- Enables collaborative decision-making

### With Three-Tier Consent (Issue #7)
- Implements Tier 2: Sapient intent confirmation
- Provides explicit consent mechanisms
- Ensures veto authority

## Examples & Use Cases

### Example 1: Bipolar Cognition Support

```javascript
// Morning check before critical decision
async function morningDecisionCheck(user, decision) {
  const profile = user.neurodivergentProfile;
  
  if (profile.pattern === 'bipolar') {
    const circadianPhase = await detectCircadianPhase(user);
    
    if (circadianPhase.isVulnerabilityWindow) {
      return {
        recommendation: 'defer',
        message: 'This appears to be a circadian vulnerability window.',
        alternative: `Optimal decision time: ${circadianPhase.nextOptimalWindow}`,
        marker: '#VulnerabilityWindow[type:circadian]'
      };
    }
    
    if (circadianPhase.isOptimalWindow) {
      return {
        recommendation: 'proceed_with_support',
        message: 'You appear to be in an optimal decision window.',
        supportProvided: [
          'love_evolution_checkpoint',
          'alternative_generation',
          'reflection_pause'
        ],
        marker: '#RightsOfSapience[type:human, optimal_window:true]'
      };
    }
  }
}
```

### Example 2: Consent Architecture Integration

```python
from bgi_framework import SapienceMarker, ConsentRequired

@SapienceMarker(type="human", veto_authority=True)
@ConsentRequired(neurodivergent_support="auto_detect")
async def execute_high_stakes_action(action):
    # Automatically detect and apply neurodivergent support
    user_profile = await get_user_profile()
    
    # Apply appropriate UI adaptations
    ui_config = adapt_ui_for_neurodivergence(user_profile)
    
    # Present decision with full context
    consent = await request_consent(
        action=action,
        ui_config=ui_config,
        include_alternatives=True,
        allow_deferral=True,
        love_evolution_prompt=True
    )
    
    # Log with sapience markers
    await log_consent_decision(
        marker="#RightsOfSapience",
        consent=consent,
        neurodivergent_accommodations=ui_config.accommodations
    )
    
    return consent
```

## Future Enhancements

1. **AI Sapience Recognition**: Protocols for recognizing emergent AI sapience
2. **Collective Sapience**: Support for group/community decision-making
3. **Cross-Cultural Patterns**: Expand beyond Western cognitive frameworks
4. **Adaptive Learning**: System learns individual patterns over time
5. **Accessibility Standards**: Integration with WCAG and beyond

## References

- BGI Alignment Framework §1.2 (Sapient Partnership)
- BGI Alignment Framework §2.2 (Neurodivergent Cognition Protocols)
- Social Benefit License (SBL-1.0) - Equity and Inclusion
- Issue #5: LOVE-evolution Checkpoint Protocol
- Issue #8: Context Drift Detection System

## License

This specification is released under CC0 1.0 Universal (public domain).
