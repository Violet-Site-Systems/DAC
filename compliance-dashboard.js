/**
 * Compliance Dashboard - Demonstration Version
 * 
 * ⚠️ IMPORTANT: This dashboard displays SIMULATED DATA for demonstration purposes.
 * 
 * This is a design mockup and prototype that illustrates the intended compliance 
 * tracking architecture for the DAC project. The metrics, scores, and compliance 
 * indicators shown are NOT based on actual runtime monitoring or live system 
 * measurements.
 * 
 * Actual implementation of real-time monitoring, data collection from live systems,
 * and integration with production BGI framework metrics is part of the project roadmap
 * and requires additional development work.
 * 
 * Current functionality:
 * - Static data visualization
 * - UI/UX demonstration
 * - Planning and design validation
 * 
 * Future implementation:
 * - Real-time data collection from DAC agents
 * - Live BGI framework metrics monitoring
 * - Actual compliance score calculations
 * - Integration with production systems
 */

// Dashboard Data and Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Set current date/time
    const now = new Date();
    const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('lastUpdated').textContent = formattedDate;
    document.getElementById('footerDate').textContent = formattedDate;

    // Animate overall compliance score
    animateScore();

    // Add interactive features
    addInteractiveFeatures();

    // Simulate real-time updates (for demo purposes)
    simulateRealTimeUpdates();
}

function animateScore() {
    const scoreValue = 50; // Overall compliance percentage
    const circle = document.getElementById('overallScore');
    const scoreText = document.getElementById('overallScoreValue');
    
    // Calculate stroke-dashoffset based on percentage
    // Circle circumference = 2πr = 2 * π * 90 = 565.48
    const circumference = 565.48;
    const offset = circumference - (scoreValue / 100) * circumference;
    
    // Animate from 100% offset to actual offset
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);

    // Animate number counting
    animateValue(scoreText, 0, scoreValue, 2000);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function addInteractiveFeatures() {
    // Add hover effects for pillar cards
    const pillarCards = document.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary-color');
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--border-color');
        });
    });

    // Add click handlers for license cards to show more details
    const licenseCards = document.querySelectorAll('.license-card');
    licenseCards.forEach(card => {
        card.addEventListener('click', function() {
            const licenseName = this.querySelector('h3').textContent;
            showLicenseDetails(licenseName);
        });
        card.style.cursor = 'pointer';
    });

    // Add expandable gap items
    const gapItems = document.querySelectorAll('.gap-item');
    gapItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
}

function showLicenseDetails(licenseName) {
    // In a real implementation, this would show a modal with detailed compliance info
    console.log(`Showing details for ${licenseName}`);
    
    // For now, log to console - in production, implement a proper modal dialog
    const messages = {
        'SUL-1.0': 'Sustainable Use License:\n• Energy efficiency: 87.3%\n• Resource optimization: 78.5%\n• Carbon reduction: On track\n• Circular economy: 65% implementation',
        'EIL-1.0': 'Environmental Impact License:\n• Lifecycle assessment: Complete\n• Baseline metrics: Established\n• Green infrastructure: 72% deployed\n• Impact monitoring: Active',
        'SBL-1.0': 'Social Benefit License:\n• Accessibility: WCAG 2.1 AA compliant\n• Equity measures: Implemented\n• Stakeholder engagement: Active\n• Digital divide: Being addressed',
        'CGL-1.0': 'Community Governance License:\n• Democratic processes: Active\n• Transparency: High\n• Distributed authority: Implemented\n• Code of conduct: Enforced',
        'EAL-1.0': 'Ethical AI License:\n• Fairness testing: In progress\n• Explainability: Partial\n• Human oversight: Active\n• Bias mitigation: Ongoing',
        'CAL-1.0': 'Climate Accountability License:\n• Carbon footprint: 245 tCO₂e\n• Reduction target: -32% YoY\n• Renewable energy: 72%\n• Paris alignment: On track'
    };

    console.info(messages[licenseName] || 'License details not available');
}

function simulateRealTimeUpdates() {
    // Simulate periodic metric updates (every 30 seconds for demo)
    setInterval(() => {
        updateRandomMetric();
    }, 30000);
}

function updateRandomMetric() {
    // Randomly update one of the stat values to simulate real-time changes
    const statElements = [
        { id: 'compliantItems', min: 45, max: 50 },
        { id: 'partialItems', min: 25, max: 30 },
        { id: 'gapItems', min: 17, max: 21 }
    ];

    const randomStat = statElements[Math.floor(Math.random() * statElements.length)];
    const element = document.getElementById(randomStat.id);
    const newValue = Math.floor(Math.random() * (randomStat.max - randomStat.min + 1)) + randomStat.min;
    
    // Animate the change
    const currentValue = parseInt(element.textContent);
    animateValue(element, currentValue, newValue, 1000);
}

// Utility function to generate test data for charts (if needed in future)
function generateComplianceData() {
    return {
        overall: {
            score: 50,
            status: 'Partial Compliance',
            compliantItems: 47,
            partialItems: 28,
            gapItems: 19,
            target: 85
        },
        pillars: {
            biocentric: {
                score: 60,
                gap: 40,
                items: [
                    { name: 'Ecosystem integrity', status: 'ok' },
                    { name: 'Zero net harm', status: 'ok' },
                    { name: 'Ecological sensitivity', status: 'warn' },
                    { name: 'Quantitative validation', status: 'fail' }
                ]
            },
            sapient: {
                score: 40,
                gap: 60,
                items: [
                    { name: 'Neurodivergent protocols', status: 'warn' },
                    { name: 'Co-creation', status: 'warn' },
                    { name: 'Reasoning transparency', status: 'ok' },
                    { name: 'Cognitive coherence', status: 'fail' }
                ]
            },
            temporal: {
                score: 20,
                gap: 80,
                items: [
                    { name: 'Biological rhythm sync', status: 'fail' },
                    { name: 'Ancestral accountability', status: 'fail' },
                    { name: 'Temporal coherence', status: 'fail' },
                    { name: 'Intergenerational tracking', status: 'fail' }
                ]
            },
            implementation: {
                score: 50,
                gap: 50,
                items: [
                    { name: 'Bioregional integration', status: 'warn' },
                    { name: 'Three-tier consent', status: 'ok' },
                    { name: 'CFSA framework', status: 'fail' },
                    { name: 'Violation protocols', status: 'warn' }
                ]
            }
        },
        licenses: [
            { name: 'SUL-1.0', score: 45, compliant: 18, partial: 12, gap: 10 },
            { name: 'EIL-1.0', score: 55, compliant: 22, partial: 10, gap: 8 },
            { name: 'SBL-1.0', score: 50, compliant: 20, partial: 11, gap: 9 },
            { name: 'CGL-1.0', score: 50, compliant: 20, partial: 11, gap: 9 },
            { name: 'EAL-1.0', score: 40, compliant: 16, partial: 14, gap: 10 },
            { name: 'CAL-1.0', score: 60, compliant: 24, partial: 8, gap: 8 }
        ],
        environmental: {
            energyEfficiency: { value: 87.3, trend: '+12.3%', renewable: 72, target: 90 },
            carbonFootprint: { value: 245, trend: '-32%', offset: 95, net: 12.25 },
            resourceOptimization: { value: 78.5, trend: '+8.5%', circular: 65 },
            ecosystemImpact: { value: 0.08, trend: 'Target: 0.00', biodiversity: 'Monitored' }
        },
        gaps: {
            critical: [
                {
                    name: 'CFSA Mathematical Framework',
                    description: 'Missing Jacobian-based validation across all licenses',
                    action: 'Implement Phase 1 CFSA requirements'
                },
                {
                    name: 'Temporal Fidelity Requirements',
                    description: 'No biological/seasonal rhythm synchronization',
                    action: 'Add seasonal calibration protocols'
                },
                {
                    name: 'Neurodivergent Cognition Protocols',
                    description: 'Limited recognition of neurodivergent sapience',
                    action: 'Implement sapience markers & LOVE protocols'
                }
            ],
            high: [
                {
                    name: 'Bioregional Data Integration',
                    description: 'Environmental metrics not calibrated to local bioregion',
                    action: 'Integrate local ecosystem baselines'
                },
                {
                    name: 'Three-Tier Consent Architecture',
                    description: 'Missing biocentric and intergenerational tiers',
                    action: 'Add ecosystem & future generation advocates'
                }
            ]
        },
        roadmap: {
            phases: [
                {
                    name: 'Phase 0: Assessment',
                    status: 'completed',
                    completion: 100,
                    items: ['Baseline audit', 'Gap identification', 'Roadmap development']
                },
                {
                    name: 'Phase 1: Critical Foundations',
                    status: 'active',
                    completion: 35,
                    items: ['CFSA framework', 'Quantitative thresholds', 'Temporal fidelity', 'Neurodivergent protocols']
                },
                {
                    name: 'Phase 2: High-Priority Integration',
                    status: 'planned',
                    completion: 0,
                    items: ['Three-tier consent', 'Bioregional grounding', 'Context drift', 'Intergenerational tracking']
                },
                {
                    name: 'Phase 3: Enhancements',
                    status: 'planned',
                    completion: 0,
                    items: ['Seasonal calibration', 'Authority imbalance', 'Cognitive stability', 'Verification methods']
                },
                {
                    name: 'Phase 4: Tools & Certification',
                    status: 'planned',
                    completion: 0,
                    items: ['Compliance tools', 'Integration guidance', 'Certification programs', 'Target: 85%+']
                }
            ]
        }
    };
    // Add smooth scrolling for anchor links (after DOM is loaded)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Console welcome message
    console.log('%c🌱 Sustainability Compliance Dashboard', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cDAC - Decentralized Autonomous Communities', 'color: #764ba2; font-size: 14px;');
    console.log('%cMonitoring BGI Framework Alignment & License Compliance', 'color: #4a5568; font-size: 12px;');
    console.log('\n%cDashboard Features:', 'font-weight: bold; font-size: 14px;');
    console.log('• Real-time compliance metrics');
    console.log('• BGI Framework pillar tracking');
    console.log('• License-specific compliance status');
    console.log('• Environmental impact monitoring');
    console.log('• Gap analysis and remediation roadmap');
    console.log('\n%cFor more information, visit the BGI Framework documentation.', 'color: #667eea;');
}
