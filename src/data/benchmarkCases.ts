import type { CausationCaseInput } from '../types/causation';

export const BENCHMARK_CASES: Record<string, CausationCaseInput> = {
  case1_aggravation: {
    caseTitle: 'Miller v. Freight Logistics Corp (L4-S1 Aggravation of Asymptomatic Spondylosis)',
    patientAge: 48,
    incidentDate: 'May 14, 2026',
    imagingDate: 'June 02, 2026',
    collision: {
      type: 'rear_end',
      severityDeltaV: 'moderate_5_to_15mph',
      vehicleDamageDescription: 'Rear bumper crushed inward 8 inches; trunk lid warped; tow truck required.',
      occupantAwareness: 'caught_unaware',
      headPosition: 'rotated_to_side',
      restraintStatus: 'seatbelt_and_shoulder_harness',
      airbagDeployed: false
    },
    levels: [
      {
        level: 'L4-L5',
        imagingModality: 'MRI',
        daysPostIncident: 19,
        biomarkers: {
          acute: {
            annularTearHIZ: true,
            boneMarrowEdemaSTIR: true,
            ligamentousDisruptionEdema: false,
            softDiscExtrusionFreshFragment: true,
            acuteCompressiveFracture: false
          },
          chronic: {
            modicType2FattyMarrow: true,
            matureMarginalOsteophytes: false,
            vacuumDiscPhenomenon: false,
            facetJointArthrosisHypertrophy: true,
            severeDesiccationWithoutEdema: false
          },
          preAccidentBaseline: {
            hasPriorImaging: false,
            wasAsymptomaticAtThisLevel: true
          }
        },
        primaryPathologyDescription: 'Acute right subarticular L4-L5 extruded disc fragment with high-signal STIR edema impinging descending right L5 nerve root.'
      }
    ],
    clinical: {
      onsetHours: 'delayed_24_to_72h',
      objectiveNeurologicDeficits: {
        myotomalMotorWeakness: true, // Grade 4/5 EHL weakness
        dermatomalSensoryLoss: true, // Right L5 dermatome hypoesthesia
        asymmetricReflexLoss: false,
        pathologicReflexes: false,
        positiveTensionSign: true // Positive right straight leg raise at 35 degrees
      },
      priorTreatmentHistory: {
        hadPriorSpineCareWithin3Years: false,
        wasUnderActiveTreatmentAtCollisionTime: false,
        priorInjectionsOrSurgery: false,
        priorAsymptomaticDurationMonths: 48 // 4 years asymptomatic
      }
    }
  },

  case2_acute_trauma: {
    caseTitle: 'Davis v. Metro Transport (C5-C6 High-Energy Lateral Shear Traumatic Herniation)',
    patientAge: 29,
    incidentDate: 'July 22, 2026',
    imagingDate: 'August 01, 2026',
    collision: {
      type: 't_bone_lateral',
      severityDeltaV: 'severe_over_15mph',
      vehicleDamageDescription: 'Driver side door intrusion 14 inches; side curtain airbags deployed; total vehicular loss.',
      occupantAwareness: 'caught_unaware',
      headPosition: 'rotated_to_side',
      restraintStatus: 'seatbelt_and_shoulder_harness',
      airbagDeployed: true
    },
    levels: [
      {
        level: 'C5-C6',
        imagingModality: 'MRI',
        daysPostIncident: 10,
        biomarkers: {
          acute: {
            annularTearHIZ: true,
            boneMarrowEdemaSTIR: true,
            ligamentousDisruptionEdema: true,
            softDiscExtrusionFreshFragment: true,
            acuteCompressiveFracture: false
          },
          chronic: {
            modicType2FattyMarrow: false,
            matureMarginalOsteophytes: false,
            vacuumDiscPhenomenon: false,
            facetJointArthrosisHypertrophy: false,
            severeDesiccationWithoutEdema: false
          },
          preAccidentBaseline: {
            hasPriorImaging: false,
            wasAsymptomaticAtThisLevel: true
          }
        },
        primaryPathologyDescription: 'Acute focal C5-C6 soft disc herniation with disrupted posterior longitudinal ligament and severe bilateral C6 foraminal compromise.'
      }
    ],
    clinical: {
      onsetHours: 'immediate_under_24h',
      objectiveNeurologicDeficits: {
        myotomalMotorWeakness: true, // Grade 4/5 wrist extensor weakness
        dermatomalSensoryLoss: true, // Right thumb/radial forearm numbness
        asymmetricReflexLoss: true, // Diminished brachioradialis reflex 1+
        pathologicReflexes: false,
        positiveTensionSign: true // Positive Spurling's test with radicular shooting pain
      },
      priorTreatmentHistory: {
        hadPriorSpineCareWithin3Years: false,
        wasUnderActiveTreatmentAtCollisionTime: false,
        priorInjectionsOrSurgery: false,
        priorAsymptomaticDurationMonths: 120 // 10 years (lifetime asymptomatic)
      }
    }
  },

  case3_defense_sprain: {
    caseTitle: 'State Farm IME Review (Minor Bumper Tap with End-Stage Mature Spondylosis)',
    patientAge: 61,
    incidentDate: 'March 11, 2026',
    imagingDate: 'April 20, 2026',
    collision: {
      type: 'rear_end',
      severityDeltaV: 'low_speed_under_5mph',
      vehicleDamageDescription: 'Superficial bumper scuff; zero structural deformation; driveable away from scene.',
      occupantAwareness: 'aware_braced',
      headPosition: 'facing_forward',
      restraintStatus: 'seatbelt_and_shoulder_harness',
      airbagDeployed: false
    },
    levels: [
      {
        level: 'L3-L4',
        imagingModality: 'MRI',
        daysPostIncident: 40,
        biomarkers: {
          acute: {
            annularTearHIZ: false,
            boneMarrowEdemaSTIR: false,
            ligamentousDisruptionEdema: false,
            softDiscExtrusionFreshFragment: false,
            acuteCompressiveFracture: false
          },
          chronic: {
            modicType2FattyMarrow: true,
            matureMarginalOsteophytes: true,
            vacuumDiscPhenomenon: true,
            facetJointArthrosisHypertrophy: true,
            severeDesiccationWithoutEdema: true
          },
          preAccidentBaseline: {
            hasPriorImaging: true,
            priorDate: 'January 2024',
            priorFindings: 'Identical multi-level spondylosis with osteophyte bar',
            wasAsymptomaticAtThisLevel: false
          }
        },
        primaryPathologyDescription: 'Chronic mature osteophyte bar with vacuum phenomenon and endplate sclerosis at L3-L4. Zero acute signal changes.'
      }
    ],
    clinical: {
      onsetHours: 'remote_over_4_weeks',
      objectiveNeurologicDeficits: {
        myotomalMotorWeakness: false,
        dermatomalSensoryLoss: false,
        asymmetricReflexLoss: false,
        pathologicReflexes: false,
        positiveTensionSign: false
      },
      priorTreatmentHistory: {
        hadPriorSpineCareWithin3Years: true,
        wasUnderActiveTreatmentAtCollisionTime: true,
        priorInjectionsOrSurgery: true,
        priorAsymptomaticDurationMonths: 0
      }
    }
  }
};
