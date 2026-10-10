export type CollisionType = 
  | 'rear_end' 
  | 'frontal' 
  | 't_bone_lateral' 
  | 'rollover' 
  | 'fall_from_height' 
  | 'heavy_lifting_twist';

export type DeltaVSeverity = 
  | 'low_speed_under_5mph' 
  | 'moderate_5_to_15mph' 
  | 'severe_over_15mph';

export interface CollisionDynamics {
  type: CollisionType;
  severityDeltaV: DeltaVSeverity;
  vehicleDamageDescription: string;
  occupantAwareness: 'aware_braced' | 'caught_unaware';
  headPosition: 'facing_forward' | 'rotated_to_side';
  restraintStatus: 'seatbelt_and_shoulder_harness' | 'lap_only' | 'unrestrained';
  airbagDeployed: boolean;
}

export interface RadiographicBiomarkers {
  // Acute traumatic markers (Points toward acute mechanical force transfer)
  acute: {
    annularTearHIZ: boolean; // High-Intensity Zone on T2 STIR
    boneMarrowEdemaSTIR: boolean; // Hyperintense contusion (resolves in 6-12 months)
    ligamentousDisruptionEdema: boolean; // ALL, PLL, ligamentum flavum edema
    softDiscExtrusionFreshFragment: boolean; // Non-calcified, non-dessicated soft extrusion
    acuteCompressiveFracture: boolean; // Fresh trabecular impaction without sclerosis
  };
  // Chronic pre-existing markers (Points toward preexisting baseline aging)
  chronic: {
    modicType2FattyMarrow: boolean; // Fatty marrow conversion (takes >12-24 months)
    matureMarginalOsteophytes: boolean; // Sclerotic spurring / bars (>12 months to form)
    vacuumDiscPhenomenon: boolean; // Intradiscal nitrogen gas
    facetJointArthrosisHypertrophy: boolean; // Chronic hypertrophic joint remodeling
    severeDesiccationWithoutEdema: boolean; // Dark dehydrated disc with zero marrow edema
  };
  preAccidentBaseline: {
    hasPriorImaging: boolean;
    priorDate?: string;
    priorFindings?: string;
    wasAsymptomaticAtThisLevel: boolean;
  };
}

export interface RadiographicLevel {
  level: string; // e.g. "L4-L5", "C5-C6"
  imagingModality: 'MRI' | 'CT' | 'Flex_Ext_XRays' | 'Multiple';
  daysPostIncident: number; // e.g., 14 days, 90 days
  biomarkers: RadiographicBiomarkers;
  primaryPathologyDescription: string; // e.g. "Right paracentral extruded disc fragment compressing traversing S1 root"
}

export interface ClinicalTimeline {
  onsetHours: 'immediate_under_24h' | 'delayed_24_to_72h' | 'subacute_1_to_2_weeks' | 'remote_over_4_weeks';
  objectiveNeurologicDeficits: {
    myotomalMotorWeakness: boolean; // MRC Grade < 5/5
    dermatomalSensoryLoss: boolean;
    asymmetricReflexLoss: boolean;
    pathologicReflexes: boolean; // Babinski, Hoffman, clonus
    positiveTensionSign: boolean; // Straight Leg Raise / Spurling's
  };
  priorTreatmentHistory: {
    hadPriorSpineCareWithin3Years: boolean;
    wasUnderActiveTreatmentAtCollisionTime: boolean;
    priorInjectionsOrSurgery: boolean;
    priorAsymptomaticDurationMonths: number;
  };
}

export type LegalCausationCategory = 
  | 'DIRECT_TRAUMATIC_CAUSATION'
  | 'SUBSTANTIAL_PERMANENT_AGGRAVATION'
  | 'TEMPORARY_SPRAIN_WITH_PREEXISTING_DDD'
  | 'INCIDENTAL_NON_CAUSATIVE';

export interface LiteratureCitation {
  citationKey: string;
  authorYear: string;
  title: string;
  journal: string;
  keyFinding: string;
  relevanceToCase: string;
}

export interface DepositionDefenseShieldItem {
  counselTrapQuestion: string;
  bulletproofAnswer: string;
  scientificRationale: string;
}

export interface CausationCaseInput {
  caseTitle: string;
  patientAge: number;
  incidentDate: string;
  imagingDate: string;
  collision: CollisionDynamics;
  levels: RadiographicLevel[];
  clinical: ClinicalTimeline;
}

export interface CausationAnalysisResult {
  input: CausationCaseInput;
  legalCategory: LegalCausationCategory;
  legalCategoryTitle: string;
  medicalCertaintyStatement: string;
  kinematicForceScore: number; // 0 to 100
  biomarkerChronicityScore: number; // 0 (100% chronic) to 100 (100% acute)
  temporalConcordanceScore: number; // 0 to 100
  overallCausationProbability: number; // 0 to 100
  
  levelAnalyses: Array<{
    level: string;
    acuteScore: number;
    chronicScore: number;
    levelVerdict: string;
    biomechanicalMechanism: string;
  }>;

  daubertFactors: {
    peerReviewedMethodology: string;
    objectiveBiomarkerAnchors: string[];
    biomechanicalVectorConsistency: string;
    alternativeHypothesesExcluded: string[];
  };

  literatureCitations: LiteratureCitation[];
  depositionDefenseShield: DepositionDefenseShieldItem[];

  formattedReport: {
    sectionI_IncidentKinematics: string;
    sectionII_BiomarkerChronology: string;
    sectionIII_ClinicalNeurologicalConcordance: string;
    sectionIV_FormalForensicOpinion: string;
    fullReportMarkdown: string;
  };
}
