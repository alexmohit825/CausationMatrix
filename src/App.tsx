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
  ChevronRight,
  Gavel
} from 'lucide-react';
import { BENCHMARK_CASES } from './data/benchmarkCases';
import { analyzeCausation } from './engine/causationEngine';
import type { 
  CausationCaseInput, 
  CollisionType, 
  DeltaVSeverity 
} from './types/causation';

export default function App() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case1_aggravation');
  const [activeTab, setActiveTab] = useState<'report' | 'biomarkers' | 'depo_shield' | 'literature'>('report');
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  const [screenDropStatus, setScreenDropStatus] = useState<string | null>(null);

  // Active case state initialized from benchmark
  const [caseData, setCaseData] = useState<CausationCaseInput>(() => {
    return JSON.parse(JSON.stringify(BENCHMARK_CASES['case1_aggravation']));
  });

  const handleSelectBenchmark = (caseKey: string) => {
    setSelectedCaseId(caseKey);
    const chosen = BENCHMARK_CASES[caseKey];
    if (chosen) {
      setCaseData(JSON.parse(JSON.stringify(chosen)));
    }
  };

  // Run the Causation Arbiter Engine
  const analysis = useMemo(() => {
    return analyzeCausation(caseData);
  }, [caseData]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // ScreenDrop beam helper
  const handleSendToScreenDrop = async () => {
    setScreenDropStatus('Beaming to ScreenDrop...');
    try {
      const blob = new Blob([analysis.formattedReport.fullReportMarkdown], { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', blob, `Causation_Report_${caseData.caseTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`);

      const res = await fetch('http://127.0.0.1:7788/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setScreenDropStatus('Delivered to Workstation Desktop via ScreenDrop!');
      } else {
        setScreenDropStatus('ScreenDrop offline (run screendrop_server.py on PC)');
      }
    } catch {
      setScreenDropStatus('ScreenDrop server not reachable on port 7788');
    }
    setTimeout(() => setScreenDropStatus(null), 4000);
  };

  // Badge color helper
  const getVerdictBadgeColor = (category: string) => {
    switch (category) {
      case 'DIRECT_TRAUMATIC_CAUSATION':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SUBSTANTIAL_PERMANENT_AGGRAVATION':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'TEMPORARY_SPRAIN_WITH_PREEXISTING_DDD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Professional Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 border border-blue-500/30 p-2 rounded-xl text-blue-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">CausationMatrix</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                Daubert / Frye Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">Forensic Spine Biomechanics & Degenerative Disease Arbiter</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCopy(analysis.formattedReport.fullReportMarkdown, 'header_report')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            {copiedState['header_report'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedState['header_report'] ? 'Copied Full Report!' : 'Copy Full Report (Word/PDF)'}</span>
          </button>

          <button
            onClick={handleSendToScreenDrop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-medium transition"
            title="Beam report directly to local workstation desktop"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Beam via ScreenDrop</span>
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

      {/* Case Selector Pills */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2">
          Benchmark Cases:
        </span>
        <button
          onClick={() => handleSelectBenchmark('case1_aggravation')}
          className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
            selectedCaseId === 'case1_aggravation'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          Case 1: Aggravation of Asymptomatic Spondylosis (L4-S1)
        </button>
        <button
          onClick={() => handleSelectBenchmark('case2_acute_trauma')}
          className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
            selectedCaseId === 'case2_acute_trauma'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          Case 2: Acute Traumatic Herniation (C5-C6)
        </button>
        <button
          onClick={() => handleSelectBenchmark('case3_defense_sprain')}
          className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
            selectedCaseId === 'case3_defense_sprain'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          Case 3: Low-Speed Bumper Tap / Pre-Existing Spondylosis (L3-L4)
        </button>
      </div>

      {/* Main Forensic Console */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Input Console & Forensic Parameters (Cols 1-5) */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 border-r border-slate-800 p-5 bg-slate-950 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-200 m-0 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Forensic Evidence Console</span>
            </h2>
            <button
              onClick={() => handleSelectBenchmark(selectedCaseId)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              title="Reset parameters to benchmark defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Section 1: Case Details */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Case Identity & Incident
            </span>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Case Caption / Title:</label>
              <input
                type="text"
                value={caseData.caseTitle}
                onChange={(e) => setCaseData({ ...caseData, caseTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Patient Age:</label>
                <input
                  type="number"
                  value={caseData.patientAge}
                  onChange={(e) => setCaseData({ ...caseData, patientAge: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Incident Date:</label>
                <input
                  type="text"
                  value={caseData.incidentDate}
                  onChange={(e) => setCaseData({ ...caseData, incidentDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Imaging Date:</label>
                <input
                  type="text"
                  value={caseData.imagingDate}
                  onChange={(e) => setCaseData({ ...caseData, imagingDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kinematic Impact Dynamics */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Kinematic & Collision Biomechanics
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Collision Vector:</label>
                <select
                  value={caseData.collision.type}
                  onChange={(e) => setCaseData({
                    ...caseData,
                    collision: { ...caseData.collision, type: e.target.value as CollisionType }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="rear_end">Rear-End Collision (Whiplash)</option>
                  <option value="t_bone_lateral">T-Bone / Lateral Impact (Shear)</option>
                  <option value="frontal">Frontal Impact (Flexion)</option>
                  <option value="rollover">Rollover</option>
                  <option value="fall_from_height">Fall From Height (Axial)</option>
                  <option value="heavy_lifting_twist">Lifting / Torsional Strain</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Severity Delta-V:</label>
                <select
                  value={caseData.collision.severityDeltaV}
                  onChange={(e) => setCaseData({
                    ...caseData,
                    collision: { ...caseData.collision, severityDeltaV: e.target.value as DeltaVSeverity }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="low_speed_under_5mph">Low-Speed (&lt;5 mph / Minimal)</option>
                  <option value="moderate_5_to_15mph">Moderate (5 to 15 mph / Structural)</option>
                  <option value="severe_over_15mph">Severe (&gt;15 mph / Significant Intrusion)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Head Position at Impact:</label>
                <select
                  value={caseData.collision.headPosition}
                  onChange={(e) => setCaseData({
                    ...caseData,
                    collision: { ...caseData.collision, headPosition: e.target.value as any }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="facing_forward">Facing Forward (Neutral)</option>
                  <option value="rotated_to_side">Rotated to Side (Shear Multiplier)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Occupant Awareness:</label>
                <select
                  value={caseData.collision.occupantAwareness}
                  onChange={(e) => setCaseData({
                    ...caseData,
                    collision: { ...caseData.collision, occupantAwareness: e.target.value as any }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="caught_unaware">Caught Unaware (Unbraced)</option>
                  <option value="aware_braced">Aware & Braced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Vehicular Damage Description:</label>
              <textarea
                value={caseData.collision.vehicleDamageDescription}
                onChange={(e) => setCaseData({
                  ...caseData,
                  collision: { ...caseData.collision, vehicleDamageDescription: e.target.value }
                })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>

          {/* Section 3: Level-by-Level Radiographic Biomarkers */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Radiographic Biomarkers ({caseData.levels[0]?.level || 'Index Level'})
              </span>
            </div>

            {/* Acute Traumatic Biomarkers Checklist */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 block">
                Acute Traumatic Indicators (Points toward Incident Causation):
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.acute.annularTearHIZ}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.acute.annularTearHIZ = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>High-Intensity Zone (HIZ) / Acute Annular Tear on T2 STIR</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.acute.boneMarrowEdemaSTIR}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.acute.boneMarrowEdemaSTIR = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Vertebral Bone Marrow Contusion / STIR Edema (Resolves in 6–12 mo)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.acute.softDiscExtrusionFreshFragment}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.acute.softDiscExtrusionFreshFragment = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Non-calcified Soft Extrusion with Free Fragment / Mass Effect</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.acute.ligamentousDisruptionEdema}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.acute.ligamentousDisruptionEdema = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Ligamentous Disruption / Hyperintense STIR Ligament Edema</span>
              </label>
            </div>

            {/* Chronic Pre-Existing Indicators Checklist */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-amber-400 block">
                Chronic Pre-Existing Indicators (Points toward Baseline Aging):
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.chronic.modicType2FattyMarrow}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.chronic.modicType2FattyMarrow = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Modic Type 2 Changes (Fatty marrow conversion, &gt;12–24 months old)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.chronic.matureMarginalOsteophytes}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.chronic.matureMarginalOsteophytes = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Mature Marginal Osteophyte Bars / Spurring (Requires &gt;12 mo to form)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.chronic.vacuumDiscPhenomenon}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.chronic.vacuumDiscPhenomenon = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Vacuum Disc Phenomenon (Intradiscal nitrogen gas)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.levels[0]?.biomarkers.chronic.facetJointArthrosisHypertrophy}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.levels[0].biomarkers.chronic.facetJointArthrosisHypertrophy = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Facet Joint Arthrosis / Sclerosis / Joint Remodeling</span>
              </label>
            </div>
          </div>

          {/* Section 4: Clinical Presentation & Neurological Deficits */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              4. Clinical Presentation & Neurological Deficits
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Time to Symptom Onset:</label>
                <select
                  value={caseData.clinical.onsetHours}
                  onChange={(e) => setCaseData({
                    ...caseData,
                    clinical: { ...caseData.clinical, onsetHours: e.target.value as any }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="immediate_under_24h">Immediate (&lt;24 hours)</option>
                  <option value="delayed_24_to_72h">Delayed 24–72h (Inflammatory cascade)</option>
                  <option value="subacute_1_to_2_weeks">Subacute (1 to 2 weeks)</option>
                  <option value="remote_over_4_weeks">Remote (&gt;4 weeks / Intervening delay)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Prior Asymptomatic Months:</label>
                <input
                  type="number"
                  value={caseData.clinical.priorTreatmentHistory.priorAsymptomaticDurationMonths}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.clinical.priorTreatmentHistory.priorAsymptomaticDurationMonths = parseInt(e.target.value, 10) || 0;
                    setCaseData(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.clinical.objectiveNeurologicDeficits.myotomalMotorWeakness}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.clinical.objectiveNeurologicDeficits.myotomalMotorWeakness = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Objective Myotomal Motor Weakness (MRC Grade &lt; 5/5)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.clinical.objectiveNeurologicDeficits.dermatomalSensoryLoss}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.clinical.objectiveNeurologicDeficits.dermatomalSensoryLoss = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Dermatomal Sensory Deficit</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.clinical.objectiveNeurologicDeficits.asymmetricReflexLoss}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.clinical.objectiveNeurologicDeficits.asymmetricReflexLoss = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Deep Tendon Reflex Asymmetry</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseData.clinical.objectiveNeurologicDeficits.positiveTensionSign}
                  onChange={(e) => {
                    const updated = { ...caseData };
                    updated.clinical.objectiveNeurologicDeficits.positiveTensionSign = e.target.checked;
                    setCaseData(updated);
                  }}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Positive Nerve Root Tension Sign (SLR / Spurling's)</span>
              </label>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Forensic Intelligence & Report (Cols 6-12) */}
        {/* ======================================================== */}
        <section className="lg:col-span-7 p-5 bg-slate-950 overflow-y-auto flex flex-col space-y-5">
          
          {/* Executive Triangulation KPI Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Adjudicated Legal Classification:</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${getVerdictBadgeColor(analysis.legalCategory)}`}>
                  <Gavel className="w-4 h-4" />
                  <span>{analysis.legalCategoryTitle}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">Overall Causation Probability:</span>
                <span className="text-3xl font-extrabold text-white font-mono">
                  {analysis.overallCausationProbability}%
                </span>
              </div>
            </div>

            {/* Triangulation Metrics Progress Bars */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Kinematic Force:</span>
                  <strong className="text-white font-mono">{analysis.kinematicForceScore}%</strong>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${analysis.kinematicForceScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Biomarker Chronicity:</span>
                  <strong className="text-white font-mono">{analysis.biomarkerChronicityScore}%</strong>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.biomarkerChronicityScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Temporal Concordance:</span>
                  <strong className="text-white font-mono">{analysis.temporalConcordanceScore}%</strong>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${analysis.temporalConcordanceScore}%` }} />
                </div>
              </div>
            </div>

            {/* Formal Statement Block */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
              <strong className="text-blue-400 block mb-1">Statement to a Reasonable Degree of Medical Certainty:</strong>
              "{analysis.medicalCertaintyStatement}"
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'report' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Expert Report (Daubert/Frye)</span>
            </button>

            <button
              onClick={() => setActiveTab('biomarkers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'biomarkers' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biomarker Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('depo_shield')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'depo_shield' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Deposition Defense Shield ({analysis.depositionDefenseShield.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('literature')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'literature' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Literature Citations ({analysis.literatureCitations.length})</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: FORMAL FOUR-SECTION EXPERT REPORT                 */}
          {/* ======================================================== */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Formatted for instant paste into Microsoft Word or PDF IME/Expert Witness Reports.</span>
                <button
                  onClick={() => handleCopy(analysis.formattedReport.fullReportMarkdown, 'tab_report')}
                  className="flex items-center gap-1 text-blue-400 hover:underline"
                >
                  {copiedState['tab_report'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Report</span>
                </button>
              </div>

              {/* Section I */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider m-0">
                    Section I: Incident Kinematics & Energy Profile
                  </h3>
                  <button
                    onClick={() => handleCopy(analysis.formattedReport.sectionI_IncidentKinematics, 'sec1')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedState['sec1'] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysis.formattedReport.sectionI_IncidentKinematics}
                </div>
              </div>

              {/* Section II */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">
                    Section II: Objective Radiographic Biomarker Chronology
                  </h3>
                  <button
                    onClick={() => handleCopy(analysis.formattedReport.sectionII_BiomarkerChronology, 'sec2')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedState['sec2'] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysis.formattedReport.sectionII_BiomarkerChronology}
                </div>
              </div>

              {/* Section III */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">
                    Section III: Clinical Neurological Concordance
                  </h3>
                  <button
                    onClick={() => handleCopy(analysis.formattedReport.sectionIII_ClinicalNeurologicalConcordance, 'sec3')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedState['sec3'] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysis.formattedReport.sectionIII_ClinicalNeurologicalConcordance}
                </div>
              </div>

              {/* Section IV */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider m-0">
                    Section IV: Formal Forensic Opinion (Daubert / Frye Standard)
                  </h3>
                  <button
                    onClick={() => handleCopy(analysis.formattedReport.sectionIV_FormalForensicOpinion, 'sec4')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedState['sec4'] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysis.formattedReport.sectionIV_FormalForensicOpinion}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: LEVEL-BY-LEVEL BIOMARKER MATRIX                   */}
          {/* ======================================================== */}
          {activeTab === 'biomarkers' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Level</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Acute Score</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Chronic Score</th>
                      <th className="py-2.5 px-3 font-semibold">Biomechanical Mechanism</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Level Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {analysis.levelAnalyses.map((la, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {la.level}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-400">
                          {la.acuteScore} pts
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-amber-400">
                          {la.chronicScore} pts
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">
                          {la.biomechanicalMechanism}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            {la.levelVerdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Daubert Factors */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-200 block mb-1">Daubert Admissibility Checks:</span>
                <div className="text-slate-300 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Methodology:</strong> {analysis.daubertFactors.peerReviewedMethodology}</span>
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Force Vector Consistency:</strong> {analysis.daubertFactors.biomechanicalVectorConsistency}</span>
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Alternative Hypotheses Excluded:</strong> {analysis.daubertFactors.alternativeHypothesesExcluded.join(' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DEPOSITION DEFENSE SHIELD                         */}
          {/* ======================================================== */}
          {activeTab === 'depo_shield' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 px-1">
                Pre-formulated scientific counter-responses to opposing counsel's most aggressive deposition traps.
              </div>

              {analysis.depositionDefenseShield.map((shield, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Cross-Examination Trap #{idx + 1}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(shield.bulletproofAnswer, `shield_${idx}`)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedState[`shield_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Answer</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-amber-200 font-medium">
                    "{shield.counselTrapQuestion}"
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">Your Bulletproof Deposition Response:</span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-blue-950/20 border border-blue-500/20 p-3 rounded-lg m-0">
                      "{shield.bulletproofAnswer}"
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 italic">
                    Scientific Foundation: {shield.scientificRationale}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PEER-REVIEWED SCIENTIFIC LITERATURE               */}
          {/* ======================================================== */}
          {activeTab === 'literature' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 px-1">
                Peer-reviewed citations supporting the biomechanical force thresholds and MRI chronicity timeline.
              </div>

              {analysis.literatureCitations.map((lit, idx) => (
                <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1.5 text-xs">
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
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-400 text-[11px]">
                    <strong>Relevance to this Case:</strong> {lit.relevanceToCase}
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
