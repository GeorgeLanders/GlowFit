import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Syringe, Pill, Droplets, Beef, ChevronDown, Check } from 'lucide-react';

const GLP1_MEDICATIONS = ['Semaglutide', 'Tirzepatide', 'Liraglutide', 'Dulaglutide'];

const INJECTION_SITES = [
  { key: 'leftAbdomen', label: 'Left\nAbdomen', emoji: '⬅️🫄' },
  { key: 'rightAbdomen', label: 'Right\nAbdomen', emoji: '🫄➡️' },
  { key: 'leftThigh', label: 'Left\nThigh', emoji: '🦵' },
  { key: 'rightThigh', label: 'Right\nThigh', emoji: '🦵' },
];

const PREFS_KEY = 'glowfit_glp1_settings';

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(data: Record<string, unknown>) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(data));
}

export default function GLP1Settings() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const saved = loadPrefs();

  const [enabled, setEnabled] = useState(saved.glp1Enabled || false);
  const [medication, setMedication] = useState(saved.medication || 'Semaglutide');
  const [dosage, setDosage] = useState(saved.dosage || '0.25');
  const [injectionSite, setInjectionSite] = useState(saved.injectionSite || 'leftAbdomen');
  const [proteinTarget, setProteinTarget] = useState(saved.proteinTarget || 1.2);
  const [hydrationTarget, setHydrationTarget] = useState(saved.hydrationTarget || 2.5);
  const [showMedDropdown, setShowMedDropdown] = useState(false);

  const persist = (overrides: Record<string, unknown> = {}) => {
    const data = { glp1Enabled: enabled, medication, dosage, injectionSite, proteinTarget, hydrationTarget, ...overrides };
    savePrefs(data);
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    persist({ glp1Enabled: next });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-serif text-rose-900">GLP-1 Companion</h1>
          <p className="text-xs text-slate-400">Medication tracking & nutrition guardrails</p>
        </div>
      </div>

      {/* GLP-1 Mode Toggle */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${enabled ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            <Syringe className={`w-5 h-5 ${enabled ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">GLP-1 Mode</p>
            <p className="text-xs text-slate-400">
              {enabled ? 'Tracking active — protein & hydration guardrails ON' : 'Enable to track medication, nutrition floors & symptoms'}
            </p>
          </div>
          <button onClick={toggleEnabled} aria-label={enabled ? 'Disable GLP-1 mode' : 'Enable GLP-1 mode'} className={`w-12 h-7 rounded-full transition-all relative ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${enabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Settings (when enabled) */}
      {enabled && (
        <>
          {/* Medication Selector */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5"><Pill className="w-4 h-4" /> Medication</p>
            <div className="relative">
              <button
                onClick={() => setShowMedDropdown(!showMedDropdown)}
                aria-label="Select medication"
                aria-expanded={showMedDropdown}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <span className="font-medium text-slate-700">{medication}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMedDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showMedDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 overflow-hidden">
                  {GLP1_MEDICATIONS.map(med => (
                    <button
                      key={med}
                      onClick={() => { setMedication(med); setShowMedDropdown(false); persist({ medication: med }); }}
                      aria-label={`Select ${med}`}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 ${med === medication ? 'font-bold text-violet-600' : 'text-slate-700'}`}
                    >
                      {med}
                      {med === medication && <Check className="w-4 h-4 text-violet-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dosage */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-slate-600 mb-2">Current Dosage (mg)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={dosage}
                onChange={e => { setDosage(e.target.value); persist({ dosage: e.target.value }); }}
                className="flex-1 p-3 rounded-xl border border-slate-200 text-center font-medium text-lg"
                placeholder="0.25"
              />
              <span className="text-sm text-slate-400">mg</span>
            </div>
          </div>

          {/* Injection Site Body Map */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5"><Syringe className="w-4 h-4" /> Injection Site</p>
            <p className="text-xs text-slate-400 mb-3">Rotate sites to prevent lipodystrophy</p>
            <div className="grid grid-cols-2 gap-2">
              {INJECTION_SITES.map(site => (
                <button
                  key={site.key}
                  onClick={() => { setInjectionSite(site.key); persist({ injectionSite: site.key }); }}
                  aria-label={`Select injection site: ${site.label.replace('\n', ' ')}`}
                  aria-pressed={injectionSite === site.key}
                  className={`p-3 rounded-xl text-center transition-all ${injectionSite === site.key ? 'bg-violet-100 border-2 border-violet-400' : 'bg-slate-50 border-2 border-transparent'}`}
                >
                  <p className="text-lg mb-0.5">{site.emoji}</p>
                  <p className="text-xs font-medium text-slate-600 whitespace-pre-line">{site.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-4">
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Beef className="w-4 h-4" /> Nutrition Targets</p>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 flex items-center gap-1"><Beef className="w-3.5 h-3.5" /> Protein</span>
                <span className="font-medium text-slate-800">{proteinTarget} g/kg</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={proteinTarget}
                onChange={e => { setProteinTarget(+e.target.value); persist({ proteinTarget: +e.target.value }); }}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.8 g/kg</span>
                <span>2.5 g/kg</span>
              </div>
            </div>

            {/* Hydration */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Hydration</span>
                <span className="font-medium text-slate-800">{hydrationTarget} L/day</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="5"
                step="0.1"
                value={hydrationTarget}
                onChange={e => { setHydrationTarget(+e.target.value); persist({ hydrationTarget: +e.target.value }); }}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.5 L</span>
                <span>5.0 L</span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-200/50 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-cyan-700 mb-2">💡 GLP-1 Tips</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p>• Inject at the same time each week</p>
              <p>• Rotate injection sites each dose</p>
              <p>• Eat slowly — GLP-1 slows digestion</p>
              <p>• Prioritize protein to maintain muscle</p>
              <p>• Stay hydrated to reduce nausea</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
