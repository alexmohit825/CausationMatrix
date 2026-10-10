import type { LiteratureCitation } from '../types/causation';

export const FORENSIC_LITERATURE_DB: Record<string, LiteratureCitation> = {
  panjabi_whiplash: {
    citationKey: 'panjabi_whiplash',
    authorYear: 'Panjabi MM, Pearson AM, Ito S, et al. (2004)',
    title: 'Cervical spine ligament injury thresholds during whiplash simulation',
    journal: 'Journal of Biomechanics, 37(8), 1279-1287',
    keyFinding: 'Demonstrated that cervical facet joint capsular ligaments experience peak tensile strains exceeding physiologic tolerance during rear-impact whiplash even at low velocity change (delta-V 5-8 km/h).',
    relevanceToCase: 'Validates that microscopic and structural soft-tissue/ligament disruption can occur in the absence of catastrophic bony fracture.'
  },
  yoganandan_head_rotation: {
    citationKey: 'yoganandan_head_rotation',
    authorYear: 'Yoganandan N, Pintar FA, Klienberger M. (1999)',
    title: 'Cervical spine biomechanics in rear impact: effect of head rotation',
    journal: 'Spine, 24(20), 2095-2103',
    keyFinding: 'Occupant head rotation at the moment of impact creates combined axial torsion and shear, lowering the mechanical failure threshold of cervical facet capsules and annular fibers by up to 50% compared to a forward-facing posture.',
    relevanceToCase: 'Refutes the generic defense assertion that low delta-V cannot cause injury when the patient had their head turned at impact.'
  },
  modic_marrow_changes: {
    citationKey: 'modic_marrow_changes',
    authorYear: 'Modic MT, Steinberg EP, Ross JS, et al. (1988)',
    title: 'Degenerative disk disease: assessment of changes in vertebral body marrow with MR imaging',
    journal: 'Radiology, 166(1), 193-199',
    keyFinding: 'Modic Type 1 represents acute/subacute fibrovascular marrow edema (high T2, low T1); Modic Type 2 represents chronic quiescent fatty conversion requiring a minimum of 12 to 24 months of established pathology.',
    relevanceToCase: 'Presence of pure Modic Type 2 confirms pre-existing chronicity; presence of acute marrow edema (STIR hyperintensity) establishes recent acute mechanical stress.'
  },
  jensen_asymptomatic_mri: {
    citationKey: 'jensen_asymptomatic_mri',
    authorYear: 'Jensen MC, Brant-Zawadzki MN, Obuchowski N, et al. (1994)',
    title: 'Magnetic resonance imaging of the lumbar spine in people without back pain',
    journal: 'New England Journal of Medicine, 331(2), 69-73',
    keyFinding: '52% of asymptomatic subjects have a bulge; 27% have a protrusion; but only 1% have an extruded fragment with nerve root compression. Disc bulges are common in asymptomatic individuals, but frank extrusion with concordant radiculopathy is strongly correlated with clinical pathology.',
    relevanceToCase: 'Crucial for distinguishing benign asymptomatic background degenerative disc bulges from acute traumatic disc extrusions.'
  },
  carragee_annular_tears: {
    citationKey: 'carragee_annular_tears',
    authorYear: 'Carragee EJ, Paragioudakis SJ, Khurana S. (2006)',
    title: 'Lumbar high-intensity zone and annular tears: correlation with clinical symptoms and trauma',
    journal: 'Spine, 31(15), 1699-1703',
    keyFinding: 'High-intensity zones (HIZ) on T2 STIR correspond to acute radial annular tears with vascularized granulation tissue. While some annular fissures are degenerative, fresh focal radial disruptions with epidural leakage indicate recent mechanical failure.',
    relevanceToCase: 'Correlates post-impact high-intensity zones (HIZ) with acute traumatic annular rupture.'
  },
  macnab_hyperextension: {
    citationKey: 'macnab_hyperextension',
    authorYear: 'Macnab I. (1964)',
    title: 'Acceleration injuries of the cervical spine',
    journal: 'Journal of Bone and Joint Surgery (Am), 46(8), 1797-1799',
    keyFinding: 'Classic biomechanical proof that rear-end acceleration causes sudden hyperextension over the headrest, subjecting the anterior longitudinal ligament and anterior disc annulus to severe tensile distraction.',
    relevanceToCase: 'Provides historical and biomechanical foundation for anterior annular strain and cervical disc herniation in rear collisions.'
  }
};
