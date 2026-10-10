import { useState, useMemo } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  Send, 
  RotateCcw, 
  Zap, 
  Activity, 
  Layers, 
  Gavel, 
  Info, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { analyzeCausation } from './engine/causationEngine';
import type { 
  CausationCaseInput, 
  CollisionType, 
  DeltaVSeverity 
} from './types/causation';

// Standard spinal levels available for graphical selection
const SPINE_LEVELS = [
  { group: 'Cervical', levels: ['C2-C3', 'C3-C4', 'C4-C5', 'C5-C6', 'C6-C7', 'C7-T1'] },
  { group: 'Thoracic', levels: ['T11-T12', 'T12-L1'] },
  { group: 'Lumbar', levels: ['L1-L2', 'L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'] }
];

// Clean blank slate initial state (no prepopulated cases)
const createEmptyCase = (): CausationCaseInput => ({
  caseTitle: 'New Medicolegal Case Evaluation',
  patientAge: 45,
  incidentDate: 'October 2026',
  imagingDate: 'November 2026',
  collision: {
    type: 'rear_end',
    severityDeltaV: 'moderate_5_to_15mph',
    vehicleDamageDescription: 'Rear bumper crushed inward; structural frame damage.',
    occupantAwareness: 'caught_unaware',
    headPosition: 'rotated_to_side',
    restraintStatus: 'seatbelt_and_shoulder_harness',
    airbagDeployed: false
  },
  levels: [
    {
      level: 'L4-L5',
      imagingModality: 'MRI',
      daysPostIncident: 21,
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
      primaryPathologyDescription: 'Index level spinal lesion evaluated for acute vs degenerative causation.'
    }
  ],
  clinical: {
    onsetHours: 'delayed_24_to_72h',
    objectiveNeurologicDeficits: {
      myotomalMotorWeakness: true,
      dermatomalSensoryLoss: true,
      asymmetricReflexLoss: false,
      pathologicReflexes: false,
      positiveTensionSign: true
    },
    priorTreatmentHistory: {
      hadPriorSpineCareWithin3Years: false,
      wasUnderActiveTreatmentAtCollisionTime: false,
      priorInjectionsOrSurgery: false,
      priorAsymptomaticDurationMonths: 36
    }
  }
});

export default function App() {
  const [caseData, setCaseData] = useState<CausationCaseInput>(createEmptyCase);
  const [showHowToUse, setShowHowToUse] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'visual_gauge' | 'report' | 'matrix' | 'depo_shield' | 'citations'>('visual_gauge');
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  const [screenDropStatus, setScreenDropStatus] = useState<string | null>(null);

  // Run the Causation Arbiter Engine
  const analysis = useMemo(() => {
    return analyzeCausation(caseData);
  }, [caseData]);

  // Current active spinal level
  const currentLevel = caseData.levels[0] || {
    level: 'L4-L5',
    biomarkers: {
      acute: { annularTearHIZ: false, boneMarrowEdemaSTIR: false, ligamentousDisruptionEdema: false, softDiscExtrusionFreshFragment: false, acuteCompressiveFracture: false },
      chronic: { modicType2FattyMarrow: false, matureMarginalOsteophytes: false, vacuumDiscPhenomenon: false, facetJointArthrosisHypertrophy: false, severeDesiccationWithoutEdema: false },
      preAccidentBaseline: { hasPriorImaging: false, wasAsymptomaticAtThisLevel: true }
    }
  };

  const handleSelectSpineLevel = (lvl: string) => {
    const updated = { ...caseData };
    if (updated.levels[0]) {
      updated.levels[0].level = lvl;
    }
    setCaseData(updated);
  };

  const handleToggleAcuteBiomarker = (key: keyof typeof currentLevel.biomarkers.acute) => {
    const updated = { ...caseData };
    if (updated.levels[0]) {
      updated.levels[0].biomarkers.acute[key] = !updated.levels[0].biomarkers.acute[key];
    }
    setCaseData(updated);
  };

  const handleToggleChronicBiomarker = (key: keyof typeof currentLevel.biomarkers.chronic) => {
    const updated = { ...caseData };
    if (updated.levels[0]) {
      updated.levels[0].biomarkers.chronic[key] = !updated.levels[0].biomarkers.chronic[key];
    }
    setCaseData(updated);
  };

  const handleToggleNeuroDeficit = (key: keyof typeof caseData.clinical.objectiveNeurologicDeficits) => {
    const updated = { ...caseData };
    updated.clinical.objectiveNeurologicDeficits[key] = !updated.clinical.objectiveNeurologicDeficits[key];
    setCaseData(updated);
  };

  const handleResetToBlank = () => {
    setCaseData(createEmptyCase());
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleSendToScreenDrop = async () => {
    setScreenDropStatus('Beaming to ScreenDrop...');
    try {
      const blob = new Blob([analysis.formattedReport.fullReportMarkdown], { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', blob, `Causation_Report_${Date.now()}.md`);

      const res = await fetch('http://127.0.0.1:7788/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setScreenDropStatus('Delivered to Workstation Desktop via ScreenDrop!');
      } else {
        setScreenDropStatus('ScreenDrop server not reachable on port 7788');
      }
    } catch {
      setScreenDropStatus('ScreenDrop server not reachable on port 7788');
    }
    setTimeout(() => setScreenDropStatus(null), 4000);
  };

  // Radial Gauge Math (Semicircular SVG speedometer)
  const probability = analysis.overallCausationProbability;
  // Map 0-100% to angle -90deg to +90deg
  const gaugeAngle = -90 + (probability / 100) * 180;

  const getGaugeColor = (prob: number) => {
    if (prob >= 75) return '#10b981'; // Emerald
    if (prob >= 50) return '#3b82f6'; // Blue
    if (prob >= 30) return '#f59e0b'; // Amber
    return '#ef4444'; // Rose / Red
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Professional Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white m-0">CausationMatrix</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                Forensic Arbiter
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">Spine Biomechanics & Degenerative Disease Causation</p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHowToUse(!showHowToUse)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>{showHowToUse ? 'Hide Guide' : 'How to Use'}</span>
          </button>

          <button
            onClick={handleResetToBlank}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
            title="Reset to blank case evaluation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => handleCopy(analysis.formattedReport.fullReportMarkdown, 'header_report')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold transition"
          >
            {copiedState['header_report'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedState['header_report'] ? 'Copied Full Report' : 'Copy Full Report'}</span>
          </button>

          <button
            onClick={handleSendToScreenDrop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ScreenDrop</span>
          </button>
        </div>
      </header>

      {/* ScreenDrop Status Notification */}
      {screenDropStatus && (
        <div className="bg-blue-900/60 border-b border-blue-700/50 text-blue-200 text-xs px-6 py-2 text-center flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{screenDropStatus}</span>
        </div>
      )}

      {/* Prominent "How to Use" Box (Text Box Guide Requested by User) */}
      {showHowToUse && (
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-indigo-950/60 border-b border-blue-500/30 px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>How to Use CausationMatrix</span>
                  <span className="text-[10px] text-blue-400 lowercase font-normal">• 3-step forensic arbitration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="font-bold text-blue-400">1.</span>
                    <span><strong>Select Spinal Level & Crash Vector:</strong> Click the anatomical disc segment (C5-C6, L4-L5, etc.) and choose the collision angle & speed.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400">2.</span>
                    <span><strong>Toggle Biomarkers:</strong> Click the graphic cards to enable acute markers (STIR marrow contusion, HIZ tear) vs. chronic markers (Modic 2, osteophytes).</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="font-bold text-purple-400">3.</span>
                    <span><strong>Generate Daubert Report:</strong> The radial tachometer adjudicates causation in real-time. Export the 4-section legal report or deposition battlecards.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToUse(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Graphic Interface Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Graphic Controls & Visual Selectors (5 cols) */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 border-r border-slate-800 p-5 bg-slate-950 overflow-y-auto space-y-5">
          
          {/* 1. GRAPHICAL SPINE COLUMN SELECTOR */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Index Spinal Motion Segment</span>
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Selected: {currentLevel.level}
              </span>
            </div>

            <div className="space-y-2.5">
              {SPINE_LEVELS.map(group => (
                <div key={group.group} className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
                    {group.group} Spine
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.levels.map(lvl => {
                      const isSelected = currentLevel.level === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleSelectSpineLevel(lvl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-105'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. GRAPHICAL CRASH COMPASS & IMPACT VECTOR */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Collision Dynamics & Force Vector</span>
            </span>

            {/* Directional Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'rear_end' as CollisionType, label: 'Rear-End Impact', sub: 'Whiplash / Hyperextension', icon: ArrowUp },
                { type: 't_bone_lateral' as CollisionType, label: 'T-Bone Lateral', sub: 'Rotational Shear Strain', icon: ArrowRight },
                { type: 'frontal' as CollisionType, label: 'Frontal Impact', sub: 'Hyperflexion / Distraction', icon: ArrowDown },
                { type: 'rollover' as CollisionType, label: 'Rollover / Axial', sub: 'Multi-directional Loading', icon: RefreshCw }
              ].map(item => {
                const isSelected = caseData.collision.type === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => setCaseData({
                      ...caseData,
                      collision: { ...caseData.collision, type: item.type }
                    })}
                    className={`p-3 rounded-xl text-left transition border flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Velocity Delta-V Selector */}
            <div className="pt-1">
              <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                Impact Velocity & Deformation:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'low_speed_under_5mph' as DeltaVSeverity, label: '< 5 mph', sub: 'Minor / Superficial' },
                  { val: 'moderate_5_to_15mph' as DeltaVSeverity, label: '5 – 15 mph', sub: 'Structural Crush' },
                  { val: 'severe_over_15mph' as DeltaVSeverity, label: '> 15 mph', sub: 'Airbag / Intrusion' }
                ].map(v => (
                  <button
                    key={v.val}
                    onClick={() => setCaseData({
                      ...caseData,
                      collision: { ...caseData.collision, severityDeltaV: v.val }
                    })}
                    className={`py-2 px-2.5 rounded-lg text-center transition border text-xs ${
                      caseData.collision.severityDeltaV === v.val
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono">{v.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{v.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rotational Head Position Modifier (Visual Toggle Card) */}
            <button
              onClick={() => setCaseData({
                ...caseData,
                collision: {
                  ...caseData.collision,
                  headPosition: caseData.collision.headPosition === 'rotated_to_side' ? 'facing_forward' : 'rotated_to_side'
                }
              })}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                caseData.collision.headPosition === 'rotated_to_side'
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${caseData.collision.headPosition === 'rotated_to_side' ? 'text-purple-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="font-semibold">Head Turned / Rotated at Impact</div>
                  <div className="text-[10px] text-slate-400">Yoganandan 1999: Lowers annular shear threshold by up to 50%</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                caseData.collision.headPosition === 'rotated_to_side' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {caseData.collision.headPosition === 'rotated_to_side' ? '+20% SHEAR' : 'OFF'}
              </span>
            </button>
          </div>

          {/* 3. VISUAL RADIOGRAPHIC BIOMARKER MATRIX (GRAPHIC CARDS) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Imaging Biomarkers at {currentLevel.level}
            </span>

            {/* Acute Traumatic Indicators (Glowing Emerald) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Acute Traumatic Biomarkers</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'boneMarrowEdemaSTIR' as const, label: 'STIR Marrow Edema', sub: 'Contusion (Resolves in 6-12m)' },
                  { key: 'annularTearHIZ' as const, label: 'Annular Tear / HIZ', sub: 'Acute collagen rupture' },
                  { key: 'softDiscExtrusionFreshFragment' as const, label: 'Fresh Disc Extrusion', sub: 'Non-calcified free fragment' },
                  { key: 'ligamentousDisruptionEdema' as const, label: 'Ligamentous Edema', sub: 'ALL / PLL disruption' }
                ].map(item => {
                  const isActive = currentLevel.biomarkers.acute[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleAcuteBiomarker(item.key)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chronic Degenerative Markers (Glowing Amber) */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Chronic Pre-Existing Markers</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'modicType2FattyMarrow' as const, label: 'Modic Type 2', sub: 'Fatty marrow (>12-24m old)' },
                  { key: 'matureMarginalOsteophytes' as const, label: 'Mature Osteophyte Bar', sub: 'Sclerotic (>12m to form)' },
                  { key: 'vacuumDiscPhenomenon' as const, label: 'Vacuum Phenomenon', sub: 'Intradiscal nitrogen gas' },
                  { key: 'facetJointArthrosisHypertrophy' as const, label: 'Facet Joint Arthrosis', sub: 'Chronic hypertrophic wear' }
                ].map(item => {
                  const isActive = currentLevel.biomarkers.chronic[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleChronicBiomarker(item.key)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                        isActive
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. CLINICAL EXAMINATION DEFICITS */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Objective Neurological Findings
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'myotomalMotorWeakness' as const, label: 'Motor Weakness', sub: 'MRC Grade < 5/5' },
                { key: 'dermatomalSensoryLoss' as const, label: 'Sensory Loss', sub: 'Dermatomal hypoesthesia' },
                { key: 'asymmetricReflexLoss' as const, label: 'Reflex Asymmetry', sub: 'Diminished DTR (0 or 1+)' },
                { key: 'positiveTensionSign' as const, label: 'Nerve Tension Sign', sub: 'Positive SLR or Spurling' }
              ].map(item => {
                const isActive = caseData.clinical.objectiveNeurologicDeficits[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => handleToggleNeuroDeficit(item.key)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      isActive
                        ? 'bg-blue-950/40 border-blue-500/60 text-blue-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-blue-400' : 'text-slate-600'}`} />
                    <div>
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Visual Gauge, Radar & Legal Report (7 cols) */}
        {/* ======================================================== */}
        <section className="lg:col-span-7 p-6 bg-slate-950 overflow-y-auto flex flex-col space-y-6">
          
          {/* ======================================================== */}
          {/* RADIAL SPEEDOMETER / TACHOMETER CAUSATION GAUGE          */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Radial Semicircular Gauge SVG */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-56 h-32 flex items-center justify-center">
                  <svg className="w-56 h-32" viewBox="0 0 200 110">
                    {/* Background Track Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Dynamic Active Colored Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={getGaugeColor(probability)}
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (probability / 100))}
                      style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                    />
                    {/* Center needle pivot */}
                    <circle cx="100" cy="100" r="7" fill="#f8fafc" />
                    {/* Needle pointer */}
                    <line
                      x1="100"
                      y1="100"
                      x2={100 + 65 * Math.cos((gaugeAngle * Math.PI) / 180)}
                      y2={100 + 65 * Math.sin((gaugeAngle * Math.PI) / 180)}
                      stroke="#f8fafc"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                  </svg>

                  {/* Big Numeric Reading in Center */}
                  <div className="absolute bottom-0 text-center">
                    <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                      {probability}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                      Causation Index
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-48 text-[10px] text-slate-500 font-mono mt-1">
                  <span>0% Incidental</span>
                  <span>50%</span>
                  <span>100% Direct</span>
                </div>
              </div>

              {/* Legal Adjudication Banner & Triangulation Metrics */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Adjudicated Legal Classification:</span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-blue-500/20 text-blue-300 border-blue-500/40">
                    <Gavel className="w-4 h-4" />
                    <span>{analysis.legalCategoryTitle}</span>
                  </div>
                </div>

                {/* Triangulation Bar Progress Metrics */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Kinematic Force Compatibility:</span>
                      <strong className="text-white font-mono">{analysis.kinematicForceScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${analysis.kinematicForceScore}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Radiographic Chronicity Index:</span>
                      <strong className="text-white font-mono">{analysis.biomarkerChronicityScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${analysis.biomarkerChronicityScore}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Temporal & Neurological Concordance:</span>
                      <strong className="text-white font-mono">{analysis.temporalConcordanceScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${analysis.temporalConcordanceScore}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Formal Legal Opinion Callout Box */}
            <div className="mt-4 pt-3.5 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-blue-400 block mb-0.5">Opinion to a Reasonable Degree of Medical Certainty:</strong>
              "{analysis.medicalCertaintyStatement}"
            </div>
          </div>

          {/* Navigation Tabs for In-Depth Views */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('visual_gauge')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'visual_gauge'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Forensic Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Courtroom Report (Daubert)</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Biomarker Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('depo_shield')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'depo_shield'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Deposition Shield</span>
            </button>

            <button
              onClick={() => setActiveTab('citations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'citations'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Literature</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: VISUAL OVERVIEW CARDS                             */}
          {/* ======================================================== */}
          {activeTab === 'visual_gauge' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acute vs Chronic Summary Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Biomarker Chronology Balance
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-emerald-300 font-medium">Acute Traumatic Signals:</span>
                    <strong className="text-emerald-400 font-mono">
                      {Object.values(currentLevel.biomarkers.acute).filter(Boolean).length} Active
                    </strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <span className="text-amber-300 font-medium">Chronic Pre-Existing Signals:</span>
                    <strong className="text-amber-400 font-mono">
                      {Object.values(currentLevel.biomarkers.chronic).filter(Boolean).length} Active
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Traumatic bone marrow edema (STIR hyperintensity) proves recent force transfer, while mature osteophytes confirm baseline vulnerability.
                  </div>
                </div>
              </div>

              {/* Daubert Admissibility Checklist Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Daubert Admissibility Checks
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Peer-reviewed biomechanical vector compatibility (*Panjabi 2004*).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Objective radiographic timing (*Modic 1988*).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Exclusion of unprovoked natural history progression.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: COURTROOM REPORT (4 SECTIONS)                     */}
          {/* ======================================================== */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Four-Section Courtroom-Ready Expert Evaluation (Daubert / Frye Compliant)</span>
                <button
                  onClick={() => handleCopy(analysis.formattedReport.fullReportMarkdown, 'report_tab')}
                  className="flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                >
                  {copiedState['report_tab'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Entire Report</span>
                </button>
              </div>

              {/* Section I */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Section I: Incident Kinematics & Energy Profile
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.formattedReport.sectionI_IncidentKinematics}
                </div>
              </div>

              {/* Section II */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Section II: Objective Radiographic Biomarker Chronology
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.formattedReport.sectionII_BiomarkerChronology}
                </div>
              </div>

              {/* Section III */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Section III: Clinical Neurological Concordance
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.formattedReport.sectionIII_ClinicalNeurologicalConcordance}
                </div>
              </div>

              {/* Section IV */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Section IV: Formal Forensic Opinion (*To a Reasonable Degree of Medical Certainty*)
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.formattedReport.sectionIV_FormalForensicOpinion}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: LEVEL-BY-LEVEL BIOMARKER MATRIX TABLE             */}
          {/* ======================================================== */}
          {activeTab === 'matrix' && (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                    <th className="py-3 px-3.5 font-semibold">Spinal Level</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Acute Traumatic</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Chronic Aging</th>
                    <th className="py-3 px-3.5 font-semibold">Biomechanical Mechanism</th>
                    <th className="py-3 px-3.5 font-semibold text-center">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analysis.levelAnalyses.map((la, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-white">
                        {la.level}
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-semibold text-emerald-400">
                        {la.acuteScore} pts
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-semibold text-amber-400">
                        {la.chronicScore} pts
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-300 text-[11px]">
                        {la.biomechanicalMechanism}
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {la.levelVerdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: DEPOSITION DEFENSE SHIELD                         */}
          {/* ======================================================== */}
          {activeTab === 'depo_shield' && (
            <div className="space-y-3.5">
              <div className="text-xs text-slate-400">
                Pre-formulated scientific counter-responses to opposing counsel's most common deposition traps.
              </div>

              {analysis.depositionDefenseShield.map((shield, idx) => (
                <div key={idx} className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Cross-Examination Trap #{idx + 1}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(shield.bulletproofAnswer, `depo_${idx}`)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedState[`depo_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Answer</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-amber-200 font-medium">
                    "{shield.counselTrapQuestion}"
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed bg-blue-950/20 border border-blue-500/20 p-3 rounded-lg m-0">
                    "{shield.bulletproofAnswer}"
                  </p>

                  <div className="text-[11px] text-slate-400 italic">
                    Authority: {shield.scientificRationale}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PEER-REVIEWED SCIENTIFIC LITERATURE CITATIONS     */}
          {/* ======================================================== */}
          {activeTab === 'citations' && (
            <div className="space-y-3">
              {analysis.literatureCitations.map((lit, idx) => (
                <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{lit.authorYear}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{lit.journal}</span>
                  </div>
                  <div className="text-blue-300 font-medium italic">
                    "{lit.title}"
                  </div>
                  <p className="text-slate-300 m-0">
                    <strong>Key Finding:</strong> {lit.keyFinding}
                  </p>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-400 text-[11px]">
                    <strong>Relevance:</strong> {lit.relevanceToCase}
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
