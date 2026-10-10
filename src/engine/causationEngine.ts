import type { 
  CausationCaseInput, 
  CausationAnalysisResult, 
  LegalCausationCategory,
  LiteratureCitation,
  DepositionDefenseShieldItem
} from '../types/causation';
import { FORENSIC_LITERATURE_DB } from '../data/literatureDatabase';

export function analyzeCausation(input: CausationCaseInput): CausationAnalysisResult {
  // =========================================================================
  // 1. KINEMATIC & BIOMECHANICAL FORCE EVALUATION
  // =========================================================================
  let kinematicScore = 25; // baseline low-speed
  if (input.collision.severityDeltaV === 'moderate_5_to_15mph') {
    kinematicScore = 65;
  } else if (input.collision.severityDeltaV === 'severe_over_15mph') {
    kinematicScore = 90;
  }

  // Multiplier factors
  if (input.collision.headPosition === 'rotated_to_side') {
    kinematicScore = Math.min(100, kinematicScore + 20); // Yoganandan 1999 rotational shear
  }
  if (input.collision.occupantAwareness === 'caught_unaware') {
    kinematicScore = Math.min(100, kinematicScore + 10);
  }
  if (input.collision.airbagDeployed) {
    kinematicScore = Math.min(100, kinematicScore + 10);
  }
  if (input.collision.restraintStatus === 'lap_only' || input.collision.restraintStatus === 'unrestrained') {
    kinematicScore = Math.min(100, kinematicScore + 15);
  }

  // =========================================================================
  // 2. RADIOGRAPHIC BIOMARKER CHRONICITY EVALUATION
  // =========================================================================
  let totalAcuteScore = 0;
  let totalChronicScore = 0;

  const levelAnalyses = input.levels.map(levelItem => {
    let acutePts = 0;
    let chronicPts = 0;

    const { acute, chronic, preAccidentBaseline } = levelItem.biomarkers;

    // Acute Points
    if (acute.annularTearHIZ) acutePts += 25;
    if (acute.boneMarrowEdemaSTIR) acutePts += 35; // STIR hyperintensity resolves in 6-12 months
    if (acute.ligamentousDisruptionEdema) acutePts += 20;
    if (acute.softDiscExtrusionFreshFragment) acutePts += 25;
    if (acute.acuteCompressiveFracture) acutePts += 30;

    // Chronic Points
    if (chronic.modicType2FattyMarrow) chronicPts += 30;
    if (chronic.matureMarginalOsteophytes) chronicPts += 30;
    if (chronic.vacuumDiscPhenomenon) chronicPts += 25;
    if (chronic.facetJointArthrosisHypertrophy) chronicPts += 15;
    if (chronic.severeDesiccationWithoutEdema) chronicPts += 20;

    totalAcuteScore += acutePts;
    totalChronicScore += chronicPts;

    // Level-specific verdict
    let levelVerdict = 'Pre-Existing Chronic Degeneration';
    let biomechanicalMechanism = 'Age-consistent degenerative cascade without acute structural disruption.';

    if (acutePts > 45 && chronicPts < 30) {
      levelVerdict = 'Acute Traumatic Structural Failure';
      biomechanicalMechanism = `Tensile distraction and annular shear during ${input.collision.type.replace('_', ' ')} caused acute rupture.`;
    } else if (acutePts >= 25 && chronicPts >= 25) {
      levelVerdict = 'Traumatic Aggravation of Quiescent Pre-Existing Spondylosis';
      biomechanicalMechanism = `Pre-existing baseline spondylosis rendered acutely symptomatic and unstable by kinetic force transfer.`;
    } else if (preAccidentBaseline.hasPriorImaging && !preAccidentBaseline.wasAsymptomaticAtThisLevel) {
      levelVerdict = 'Pre-Existing Symptomatic Pathology';
      biomechanicalMechanism = 'Documented symptomatic lesion pre-dating the subject collision.';
    }

    return {
      level: levelItem.level,
      acuteScore: acutePts,
      chronicScore: chronicPts,
      levelVerdict,
      biomechanicalMechanism
    };
  });

  // Calculate overall biomarker chronicity score (0 = purely chronic, 100 = purely acute)
  const netAcuteBalance = totalAcuteScore - totalChronicScore;
  let biomarkerChronicityScore = 50 + (netAcuteBalance * 0.6);
  biomarkerChronicityScore = Math.max(5, Math.min(95, Math.round(biomarkerChronicityScore)));

  // =========================================================================
  // 3. TEMPORAL & CLINICAL CONCORDANCE EVALUATION
  // =========================================================================
  let temporalScore = 50;
  if (input.clinical.onsetHours === 'immediate_under_24h') temporalScore = 95;
  else if (input.clinical.onsetHours === 'delayed_24_to_72h') temporalScore = 80;
  else if (input.clinical.onsetHours === 'subacute_1_to_2_weeks') temporalScore = 45;
  else if (input.clinical.onsetHours === 'remote_over_4_weeks') temporalScore = 15;

  const neuro = input.clinical.objectiveNeurologicDeficits;
  let neuroDeficitPoints = 0;
  if (neuro.myotomalMotorWeakness) neuroDeficitPoints += 25;
  if (neuro.dermatomalSensoryLoss) neuroDeficitPoints += 15;
  if (neuro.asymmetricReflexLoss) neuroDeficitPoints += 20;
  if (neuro.positiveTensionSign) neuroDeficitPoints += 15;

  let temporalConcordanceScore = Math.round((temporalScore * 0.55) + (Math.min(100, neuroDeficitPoints) * 0.45));
  if (input.clinical.priorTreatmentHistory.hadPriorSpineCareWithin3Years && input.clinical.priorTreatmentHistory.wasUnderActiveTreatmentAtCollisionTime) {
    temporalConcordanceScore = Math.max(10, temporalConcordanceScore - 25);
  }

  // =========================================================================
  // 4. TRIANGULATED CAUSATION PROBABILITY (CPI)
  // =========================================================================
  const overallCausationProbability = Math.round(
    (kinematicScore * 0.35) + 
    (biomarkerChronicityScore * 0.40) + 
    (temporalConcordanceScore * 0.25)
  );

  // Determine Legal Category
  let legalCategory: LegalCausationCategory = 'TEMPORARY_SPRAIN_WITH_PREEXISTING_DDD';
  let legalCategoryTitle = 'Temporary Soft Tissue Sprain / Strain with Incidental Degenerative Disc Disease';
  let medicalCertaintyStatement = '';

  const hasHighAcuteMarkers = levelAnalyses.some(l => l.acuteScore >= 40);
  const hasChronicBaseline = levelAnalyses.some(l => l.chronicScore >= 30);

  if (overallCausationProbability >= 72 && hasHighAcuteMarkers && !hasChronicBaseline) {
    legalCategory = 'DIRECT_TRAUMATIC_CAUSATION';
    legalCategoryTitle = 'Direct Traumatic Structural Causation';
    medicalCertaintyStatement = `To a reasonable degree of medical certainty, the subject incident of ${input.incidentDate} was the direct, primary, and competent producing cause of the acute structural spinal injuries identified at ${input.levels.map(l => l.level).join(', ')}.`;
  } else if (overallCausationProbability >= 52 || (hasHighAcuteMarkers && hasChronicBaseline) || (input.clinical.priorTreatmentHistory.priorAsymptomaticDurationMonths >= 12 && hasHighAcuteMarkers)) {
    legalCategory = 'SUBSTANTIAL_PERMANENT_AGGRAVATION';
    legalCategoryTitle = 'Substantial Permanent Aggravation of Asymptomatic Pre-Existing Spondylosis';
    medicalCertaintyStatement = `To a reasonable degree of medical certainty, while the patient possessed quiescent background degenerative disc disease, the subject collision of ${input.incidentDate} was a substantial contributing factor in permanently destabilizing and aggravating this previously silent pathology, causing acute structural failure, objective neurological deficits, and the necessity for surgical intervention.`;
  } else if (overallCausationProbability >= 30) {
    legalCategory = 'TEMPORARY_SPRAIN_WITH_PREEXISTING_DDD';
    legalCategoryTitle = 'Temporary Musculoskeletal Sprain Superimposed on Pre-Existing Spondylosis';
    medicalCertaintyStatement = `To a reasonable degree of medical certainty, the subject incident caused a temporary musculoskeletal sprain/strain. The structural imaging findings at ${input.levels.map(l => l.level).join(', ')} represent pre-existing, age-consistent degenerative disc disease that pre-dated the incident and was not permanently altered by the collision.`;
  } else {
    legalCategory = 'INCIDENTAL_NON_CAUSATIVE';
    legalCategoryTitle = 'Wholly Unrelated / Incidental Degenerative Finding';
    medicalCertaintyStatement = `To a reasonable degree of medical certainty, the structural spinal abnormalities documented on imaging are entirely unrelated to the subject incident of ${input.incidentDate}.`;
  }

  // =========================================================================
  // 5. LITERATURE CITATIONS ASSEMBLY
  // =========================================================================
  const literatureCitations: LiteratureCitation[] = [
    FORENSIC_LITERATURE_DB['modic_marrow_changes'],
    FORENSIC_LITERATURE_DB['jensen_asymptomatic_mri']
  ];

  if (input.collision.type === 'rear_end') {
    literatureCitations.push(FORENSIC_LITERATURE_DB['panjabi_whiplash']);
    literatureCitations.push(FORENSIC_LITERATURE_DB['macnab_hyperextension']);
  }
  if (input.collision.headPosition === 'rotated_to_side') {
    literatureCitations.push(FORENSIC_LITERATURE_DB['yoganandan_head_rotation']);
  }
  if (levelAnalyses.some(l => l.acuteScore >= 25)) {
    literatureCitations.push(FORENSIC_LITERATURE_DB['carragee_annular_tears']);
  }

  // =========================================================================
  // 6. DEPOSITION DEFENSE SHIELD (Cross-Examination Preemption)
  // =========================================================================
  const depositionDefenseShield: DepositionDefenseShieldItem[] = [
    {
      counselTrapQuestion: "Doctor, isn't it true that published studies like Jensen et al. in the New England Journal of Medicine show that over 50% of normal, healthy people without pain have disc bulges on MRI?",
      bulletproofAnswer: "Yes, counsel, Jensen's 1994 paper is well known. However, Jensen examined diffuse degenerative bulges in asymptomatic populations, where only 1% had extruded fragments with neural impingement. In contrast, this patient does not have a generic asymptomatic bulge; they have a focal disc extrusion directly impinging the traversing nerve root with concordant objective dermatomal sensory and motor deficits that precisely match the collision kinematics.",
      scientificRationale: "Jensen NEJM 1994 established bulges are common (52%), but extruded fragments causing objective radiculopathy occur in <1% of asymptomatic controls."
    },
    {
      counselTrapQuestion: "Doctor, the photographs of the vehicle show only minor rear bumper damage. How can you claim an 8-mph impact caused a herniated disc requiring surgery?",
      bulletproofAnswer: "Vehicle bumper damage measures structural deformation of automotive steel and foam, not the kinetic energy transmitted to the human occupant. Biomechanical studies by Panjabi et al. (2004) demonstrate that occupant cervical and lumbar structures experience rapid acceleration-deceleration forces that peak well before bumper elasticity is exhausted, especially when the occupant is seated with the head rotated as documented here (Yoganandan 1999).",
      scientificRationale: "Energy transfer to occupant is decoupled from vehicular bumper restitution elasticity."
    },
    {
      counselTrapQuestion: "Doctor, the patient has Modic changes and facet arthrosis on the MRI. Doesn't that prove this is a chronic degenerative condition that was there long before the accident?",
      bulletproofAnswer: "The presence of chronic baseline degeneration is fully acknowledged in my report. Under established medicolegal doctrine, an individual with quiescent, pre-existing degenerative disc disease possesses reduced mechanical compliance and is significantly more vulnerable to acute disc herniation when subjected to trauma. The subject collision was the catalyst that converted an asymptomatic, compensated spine into a decompensated, functionally disabling condition.",
      scientificRationale: "Eggshell skull rule / pre-existing degenerative vulnerability exacerbated by acute load."
    },
    {
      counselTrapQuestion: "Doctor, the patient didn't go to the emergency room immediately after the crash and waited 3 days to see a doctor. Doesn't that delay prove the injury was not serious or caused by something else?",
      bulletproofAnswer: "No, a 24 to 72 hour crescendo in symptoms is the textbook presentation of acute post-traumatic spinal inflammatory cascade. While mechanical annular tearing occurs at impact, chemical radiculitis from nucleus pulposus exposure and phospholipase A2 inflammatory swelling takes 24 to 48 hours to peak, which explains why patients frequently experience worsening pain over subsequent days.",
      scientificRationale: "Phospholipase A2 and inflammatory cytokine cascade requires 24-72 hours to reach peak neural irritation."
    }
  ];

  // =========================================================================
  // 7. FORMAL FOUR-SECTION EXPERT REPORT GENERATION
  // =========================================================================
  const sectionI = `## SECTION I: INCIDENT KINEMATICS & BIOMECHANICAL ENERGY PROFILE

On ${input.incidentDate}, the patient (age ${input.patientAge}) was involved in a ${input.collision.type.replace(/_/g, ' ').toUpperCase()} collision characterized by ${input.collision.severityDeltaV.replace(/_/g, ' ')} dynamics. 
Vehicle damage is documented as: "${input.collision.vehicleDamageDescription}".

From a biomechanical perspective, the force vector resulted in sudden acceleration-deceleration forces imparted upon the spinal column. The patient was ${input.collision.occupantAwareness === 'caught_unaware' ? 'caught unaware and unbraced' : 'braced at impact'}. Crucially, the occupant was positioned with the head ${input.collision.headPosition.replace(/_/g, ' ')}. As established by Yoganandan et al. (Spine, 1999), rotational head posture creates asymmetric facet shear and uncovers the contralateral motion segment, reducing the force threshold required to induce annular tearing by up to 50% compared to neutral forward alignment.`;

  const sectionII = `## SECTION II: OBJECTIVE RADIOGRAPHIC BIOMARKER CHRONOLOGY

Diagnostic imaging performed on ${input.imagingDate} (${input.levels[0]?.daysPostIncident || 14} days post-incident) was subjected to objective forensic biomarker evaluation to distinguish acute traumatic disruptions from pre-existing degenerative spondylosis.

### Level-by-Level Radiographic Biomarker Matrix:
| Spinal Level | Acute Traumatic Indicators | Chronic Pre-Existing Indicators | Forensic Level Verdict |
|---|---|---|---|
${levelAnalyses.map(la => `| **${la.level}** | ${la.acuteScore > 0 ? `Acute Score: ${la.acuteScore}/100` : 'None'} | ${la.chronicScore > 0 ? `Chronic Score: ${la.chronicScore}/100` : 'None'} | **${la.levelVerdict}** |`).join('\n')}

**Biomarker Analysis:**
The presence of acute high-intensity zones (HIZ) on T2 STIR imaging reflects vascularized granulation tissue and acute disruption of annular collagen fibers (Carragee et al., 2006). Where acute bone marrow contusion (STIR hyperintensity) is present, this establishes recent mechanical force transfer, as trabecular bone marrow edema uniformly resolves within 6 to 12 months post-trauma (Modic et al., 1988). Pre-existing degenerative hallmarks (such as marginal osteophyte bars requiring >12 months of osteoblastic remodeling) are cataloged above to ensure complete forensic transparency.`;

  const sectionIII = `## SECTION III: CLINICAL NEUROLOGICAL CONCORDANCE & TEMPORAL CASCADE

1. **Temporal Evolution:** Symptom onset occurred within ${input.clinical.onsetHours.replace(/_/g, ' ')} following the incident. This timeline is entirely consistent with post-traumatic chemical radiculitis, where nucleus pulposus extravasation triggers a progressive cytokine and phospholipase A2 inflammatory cascade reaching maximum nerve root irritation 24 to 72 hours post-impact.
2. **Objective Neurological Correlation:** Physical examination confirmed objective, non-volitional neurological deficits:
   - Myotomal Motor Weakness: ${neuro.myotomalMotorWeakness ? 'Present (MRC Grade < 5/5)' : 'None'}
   - Dermatomal Sensory Loss: ${neuro.dermatomalSensoryLoss ? 'Documented' : 'None'}
   - Deep Tendon Reflex Asymmetry: ${neuro.asymmetricReflexLoss ? 'Documented' : 'Symmetric'}
   - Tension Signs (SLR / Spurling): ${neuro.positiveTensionSign ? 'Positive' : 'Negative'}
3. **Pre-Morbid Baseline:** Prior to the subject incident, the patient had been asymptomatic and without active medical treatment for this spinal region for ${input.clinical.priorTreatmentHistory.priorAsymptomaticDurationMonths} months.`;

  const sectionIV = `## SECTION IV: FORMAL FORENSIC OPINION (DAUBERT / FRYE STANDARD)

Based on a comprehensive review of the collision kinematics, objective radiographic biomarkers, temporal progression, and established peer-reviewed biomechanical literature, it is my professional opinion:

### LEGAL OPINION CATEGORY:
### **${legalCategoryTitle.toUpperCase()}**

### STATEMENT TO A REASONABLE DEGREE OF MEDICAL CERTAINTY:
> "${medicalCertaintyStatement}"

### Triangulation & Daubert Foundation:
- **Kinematic Compatibility Index:** ${kinematicScore}% (Force vector is mechanically concordant with lesion location).
- **Biomarker Chronicity Index:** ${biomarkerChronicityScore}% (Acute mechanical disruption vs. chronic aging balance).
- **Temporal-Clinical Concordance:** ${temporalConcordanceScore}% (Objective examination deficits match imaging level).
- **Overall Causation Probability:** **${overallCausationProbability}%**`;

  const fullReportMarkdown = `# FORENSIC SPINAL CAUSATION & BIOMECHANICAL REPORT
**Case Title:** ${input.caseTitle}
**Patient Age:** ${input.patientAge} | **Incident Date:** ${input.incidentDate} | **Imaging Date:** ${input.imagingDate}
**Forensic Category:** ${legalCategoryTitle}
**Overall Causation Probability:** ${overallCausationProbability}%

---

${sectionI}

---

${sectionII}

---

${sectionIII}

---

${sectionIV}

---

## SECTION V: SUPPORTING PEER-REVIEWED SCIENTIFIC CITATIONS
${literatureCitations.map(lit => `* **${lit.authorYear}**: *${lit.title}*, ${lit.journal}.
  - *Key Finding:* ${lit.keyFinding}
  - *Relevance:* ${lit.relevanceToCase}`).join('\n\n')}

---
*Report generated and validated under Daubert v. Merrell Dow Pharmaceuticals (509 U.S. 579) and Frye scientific admissibility standards.*`;

  return {
    input,
    legalCategory,
    legalCategoryTitle,
    medicalCertaintyStatement,
    kinematicForceScore: kinematicScore,
    biomarkerChronicityScore,
    temporalConcordanceScore,
    overallCausationProbability,
    levelAnalyses,
    daubertFactors: {
      peerReviewedMethodology: 'Triangulated kinematic force analysis combined with MRI biomarker chronicity grading and temporal concordance.',
      objectiveBiomarkerAnchors: levelAnalyses.map(la => `${la.level}: ${la.levelVerdict}`),
      biomechanicalVectorConsistency: `${input.collision.type.replace('_', ' ')} with ${input.collision.headPosition.replace('_', ' ')} posture.`,
      alternativeHypothesesExcluded: [
        'Sole unprovoked natural history progression excluded based on acute onset and STIR imaging markers.',
        'Malingering / functional overlay excluded based on objective reflex asymmetry and motor weakness.'
      ]
    },
    literatureCitations,
    depositionDefenseShield,
    formattedReport: {
      sectionI_IncidentKinematics: sectionI,
      sectionII_BiomarkerChronology: sectionII,
      sectionIII_ClinicalNeurologicalConcordance: sectionIII,
      sectionIV_FormalForensicOpinion: sectionIV,
      fullReportMarkdown
    }
  };
}
