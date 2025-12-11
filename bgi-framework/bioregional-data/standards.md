# Bioregional Data Integration Standards

**Version**: 1.0  
**Status**: Draft  
**Related**: BGI Framework §2.1 | Issue #11

## Overview

This specification defines data formats, integration protocols, and standards for local ecosystem metrics to enable bioregionally-grounded AGI systems. The Arkansas Ozarks serves as the reference implementation.

## Core Principle

> Geolocation binding: AGI reward functions must incorporate local bioregional data

## Bioregional Data Schema

### 1. Bioregion Metadata

```json
{
  "bioregion": {
    "id": "string (unique identifier)",
    "name": "string",
    "description": "string",
    "boundaries": {
      "type": "GeoJSON Polygon/MultiPolygon",
      "coordinates": "array"
    },
    "classification": {
      "ecoregion_level_1": "string",
      "ecoregion_level_2": "string",
      "ecoregion_level_3": "string",
      "watershed": "string",
      "climate_zone": "string"
    },
    "cultural_context": {
      "indigenous_territories": ["array of names"],
      "traditional_knowledge_keepers": "contact information",
      "local_communities": ["array"]
    }
  }
}
```

### 2. Water Systems Data

```json
{
  "water_systems": {
    "bioregion_id": "string",
    "timestamp": "ISO8601",
    "rivers_streams": [
      {
        "name": "string",
        "reach_id": "string",
        "coordinates": "GeoJSON LineString",
        "metrics": {
          "flow_rate_cms": "number",
          "water_quality": {
            "dissolved_oxygen_mg_l": "number",
            "ph": "number",
            "turbidity_ntu": "number",
            "temperature_c": "number",
            "nitrogen_mg_l": "number",
            "phosphorus_mg_l": "number"
          },
          "aquatic_health": {
            "macroinvertebrate_index": "number (0-10)",
            "fish_diversity_index": "number",
            "algal_biomass": "number"
          },
          "restoration_status": {
            "bank_stability": "number (0-10)",
            "riparian_vegetation": "number (0-10)",
            "invasive_species_coverage_percent": "number"
          }
        }
      }
    ],
    "watersheds": [
      {
        "name": "string",
        "area_km2": "number",
        "health_score": "number (0-100)",
        "impervious_surface_percent": "number",
        "forest_cover_percent": "number"
      }
    ],
    "groundwater": {
      "aquifer_name": "string",
      "water_table_depth_m": "number",
      "recharge_rate_mm_year": "number",
      "quality_indicators": {}
    }
  }
}
```

### 3. Flora (Vegetation) Data

```json
{
  "flora": {
    "bioregion_id": "string",
    "timestamp": "ISO8601",
    "forest_health": {
      "canopy_cover_percent": "number",
      "tree_diversity_index": "number",
      "age_class_distribution": {
        "young_percent": "number",
        "mature_percent": "number",
        "old_growth_percent": "number"
      },
      "mortality_rate_percent_year": "number"
    },
    "native_species": [
      {
        "scientific_name": "string",
        "common_name": "string",
        "population_trend": "increasing|stable|decreasing",
        "coverage_hectares": "number",
        "health_index": "number (0-10)"
      }
    ],
    "invasive_species": [
      {
        "scientific_name": "string",
        "common_name": "string",
        "coverage_hectares": "number",
        "spread_rate_hectares_year": "number",
        "control_measures": ["array of measures"]
      }
    ],
    "restoration_projects": [
      {
        "project_id": "string",
        "location": "GeoJSON",
        "species_planted": ["array"],
        "survival_rate_percent": "number",
        "progress_metrics": {}
      }
    ]
  }
}
```

### 4. Fauna (Wildlife) Data

```json
{
  "fauna": {
    "bioregion_id": "string",
    "timestamp": "ISO8601",
    "species_populations": [
      {
        "scientific_name": "string",
        "common_name": "string",
        "conservation_status": "string",
        "population_estimate": "number",
        "population_trend": "increasing|stable|decreasing",
        "habitat_quality_index": "number (0-10)"
      }
    ],
    "habitat_connectivity": {
      "corridor_integrity_percent": "number",
      "fragmentation_index": "number",
      "movement_barriers": ["array"]
    },
    "biodiversity_indices": {
      "species_richness": "number",
      "shannon_diversity": "number",
      "simpson_index": "number"
    },
    "migration_patterns": [
      {
        "species": "string",
        "season": "string",
        "routes": "GeoJSON",
        "timing": "date ranges"
      }
    ]
  }
}
```

### 5. Soil Health Data

```json
{
  "soil": {
    "bioregion_id": "string",
    "timestamp": "ISO8601",
    "health_indicators": {
      "organic_matter_percent": "number",
      "ph": "number",
      "bulk_density_g_cm3": "number",
      "water_holding_capacity": "number",
      "infiltration_rate_cm_hr": "number"
    },
    "biological_activity": {
      "microbial_biomass_ug_g": "number",
      "earthworm_count_m2": "number",
      "fungal_bacterial_ratio": "number",
      "enzyme_activity": {}
    },
    "carbon_sequestration": {
      "soil_organic_carbon_tonnes_ha": "number",
      "sequestration_rate_tonnes_ha_year": "number"
    },
    "erosion": {
      "erosion_rate_tonnes_ha_year": "number",
      "erosion_risk_index": "number (0-10)"
    }
  }
}
```

### 6. Air Quality & Climate Data

```json
{
  "air_climate": {
    "bioregion_id": "string",
    "timestamp": "ISO8601",
    "air_quality": {
      "pm2_5_ug_m3": "number",
      "pm10_ug_m3": "number",
      "ozone_ppb": "number",
      "no2_ppb": "number",
      "co_ppm": "number"
    },
    "microclimate": {
      "temperature_c": {
        "mean": "number",
        "min": "number",
        "max": "number"
      },
      "precipitation_mm": "number",
      "humidity_percent": "number",
      "wind_patterns": {}
    },
    "carbon_flux": {
      "net_ecosystem_exchange_g_co2_m2_day": "number",
      "gross_primary_production": "number",
      "ecosystem_respiration": "number"
    }
  }
}
```

### 7. Seasonal Cycles (Phenology)

```json
{
  "phenology": {
    "bioregion_id": "string",
    "year": "integer",
    "events": [
      {
        "event_type": "leaf_out|flowering|fruiting|migration|hibernation",
        "species": "string",
        "typical_date": "MM-DD",
        "actual_date": "ISO8601",
        "deviation_days": "number",
        "climate_correlation": {}
      }
    ],
    "growing_season": {
      "start_date": "ISO8601",
      "end_date": "ISO8601",
      "length_days": "number",
      "trend": "lengthening|stable|shortening"
    }
  }
}
```

## Arkansas Ozarks Reference Implementation

### Bioregion Definition

```json
{
  "bioregion": {
    "id": "us-ar-ozarks-001",
    "name": "Arkansas Ozarks",
    "description": "Highland region of northern Arkansas characterized by limestone karst topography, oak-hickory forests, and spring-fed streams",
    "boundaries": {
      "type": "Polygon",
      "coordinates": [
        [
          [-94.5, 36.5],
          [-91.0, 36.5],
          [-91.0, 35.0],
          [-94.5, 35.0],
          [-94.5, 36.5]
        ]
      ]
    },
    "classification": {
      "ecoregion_level_1": "Ozark Highlands",
      "ecoregion_level_2": "Boston Mountains",
      "ecoregion_level_3": "Upper Buffalo Wilderness",
      "watershed": "White River Basin",
      "climate_zone": "Humid Subtropical"
    },
    "cultural_context": {
      "indigenous_territories": ["Osage Nation", "Quapaw Nation"],
      "traditional_knowledge_keepers": "Contact through tribal councils",
      "local_communities": ["Buffalo National River communities", "Ozark Regional Land Trust partners"]
    }
  }
}
```

### Sample Water Systems Data (Buffalo River)

```json
{
  "water_systems": {
    "bioregion_id": "us-ar-ozarks-001",
    "timestamp": "2025-12-11T00:00:00Z",
    "rivers_streams": [
      {
        "name": "Buffalo National River",
        "reach_id": "buffalo-upper-01",
        "coordinates": {
          "type": "LineString",
          "coordinates": [
            [-93.2, 36.0],
            [-92.8, 35.9]
          ]
        },
        "metrics": {
          "flow_rate_cms": 12.5,
          "water_quality": {
            "dissolved_oxygen_mg_l": 9.2,
            "ph": 7.8,
            "turbidity_ntu": 3.5,
            "temperature_c": 14.2,
            "nitrogen_mg_l": 0.8,
            "phosphorus_mg_l": 0.02
          },
          "aquatic_health": {
            "macroinvertebrate_index": 8.5,
            "fish_diversity_index": 7.8,
            "algal_biomass": 2.1
          },
          "restoration_status": {
            "bank_stability": 8.0,
            "riparian_vegetation": 7.5,
            "invasive_species_coverage_percent": 5.0
          }
        }
      }
    ]
  }
}
```

### Sample Restoration Metrics

```json
{
  "restoration_project": {
    "project_id": "ozarks-riverbank-restoration-2025",
    "bioregion_id": "us-ar-ozarks-001",
    "location": {
      "type": "Point",
      "coordinates": [-93.0, 35.95]
    },
    "objectives": [
      "Restore native riparian vegetation",
      "Stabilize eroding streambanks",
      "Remove invasive species",
      "Improve aquatic habitat"
    ],
    "baseline_metrics": {
      "bank_erosion_rate_cm_year": 15.0,
      "native_vegetation_coverage_percent": 30.0,
      "invasive_coverage_percent": 25.0,
      "water_quality_score": 6.5
    },
    "target_metrics": {
      "bank_erosion_rate_cm_year": 2.0,
      "native_vegetation_coverage_percent": 85.0,
      "invasive_coverage_percent": 5.0,
      "water_quality_score": 9.0
    },
    "progress_2025": {
      "bank_erosion_rate_cm_year": 8.0,
      "native_vegetation_coverage_percent": 55.0,
      "invasive_coverage_percent": 12.0,
      "water_quality_score": 7.8,
      "improvement_trajectory": "on_track"
    }
  }
}
```

## Data Collection & Updates

### Data Sources

1. **Government Monitoring**: USGS, EPA, State environmental agencies
2. **Academic Research**: University field studies, long-term ecological research
3. **Citizen Science**: Community monitoring programs, iNaturalist
4. **Indigenous Knowledge**: Traditional ecological knowledge (with permission)
5. **Remote Sensing**: Satellite imagery, drone surveys
6. **IoT Sensors**: Real-time environmental monitoring

### Update Frequency

- **Real-time**: Water quality sensors, air quality monitors
- **Daily**: Weather, stream flow
- **Weekly**: Rapid assessment indicators
- **Monthly**: Comprehensive surveys
- **Seasonal**: Phenology, migration patterns
- **Annual**: Comprehensive ecosystem health assessments

### Quality Assurance

- Peer review of data collection methodology
- Cross-validation with multiple sources
- Statistical quality control
- Community verification
- Independent audits

## API Endpoints

### Retrieve Bioregional Data

```
GET /api/v1/bioregion/{bioregion_id}
GET /api/v1/bioregion/by-location?lat={lat}&lon={lon}
```

### Submit Data Updates

```
POST /api/v1/bioregion/{bioregion_id}/data
Authorization: Required (verified data contributor)
```

### Query Historical Trends

```
GET /api/v1/bioregion/{bioregion_id}/trends?metric={metric}&start={date}&end={date}
```

### Restoration Project Tracking

```
GET /api/v1/bioregion/{bioregion_id}/restoration
POST /api/v1/bioregion/{bioregion_id}/restoration/update
```

## Adapter Framework

### Creating a New Bioregion Adapter

1. **Define Boundaries**: Ecological, not political
2. **Establish Baseline**: Comprehensive initial survey
3. **Identify Data Sources**: Available monitoring systems
4. **Map to Schema**: Adapt schema to local context
5. **Set Update Protocols**: Frequency and responsibility
6. **Community Engagement**: Local stakeholder involvement
7. **Validation**: Peer review and field verification

### Example: Adding Pacific Northwest Bioregion

```json
{
  "bioregion": {
    "id": "us-pnw-salish-sea-001",
    "name": "Salish Sea Bioregion",
    "description": "Coastal temperate rainforest and marine ecosystems",
    "additional_metrics": {
      "marine_health": {
        "kelp_forest_coverage_km2": "number",
        "salmon_populations": {},
        "orca_pod_health": {}
      },
      "old_growth_forest": {
        "coverage_hectares": "number",
        "ancient_tree_density": "number"
      }
    }
  }
}
```

## Integration with BGI Systems

### With Biocentric Impact Assessment API

- Provides baseline data for impact calculations
- Enables accurate geolocation binding
- Supplies restoration metrics for positive impact validation

### With Context Drift Detection

- Validates geolocation matches bioregional context
- Alerts when location data inconsistent with claimed bioregion

### With Temporal Fidelity Clock

- Provides seasonal/phenological data
- Enables biological rhythm synchronization

## Future Enhancements

1. **Predictive Modeling**: Forecast future conditions
2. **Interconnection Mapping**: Cross-bioregion dependencies
3. **Traditional Knowledge Integration**: Respectful incorporation of indigenous data
4. **Real-time Sensor Networks**: IoT expansion
5. **Citizen Science Platform**: Community data contribution

## References

- BGI Alignment Framework §2.1 (Ecological Grounding)
- Issue #6: Biocentric Impact Assessment API
- Issue #8: Context Drift Detection
- Environmental Impact License (EIL-1.0)

## License

This specification is released under CC0 1.0 Universal (public domain).
