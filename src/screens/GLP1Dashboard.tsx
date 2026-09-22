import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Syringe, Plus, Star, TrendingDown, Activity, Pill, Bell, BellOff, Trash2, Check } from 'lucide-react';
import { notifications } from '../lib/notifications';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { GLP1Log } from '../types';

// ─── Constants ──────────────────────────────────────────────────────

const MEDICATIONS = ['Ozempic', 'Wegovy', 'Mounjaro', 'Saxenda', 'Trulicity'] as const;
const INJECTION_SITES = ['Abdomen', 'Thigh', 'Arm'] as const;
const DOSAGE_PRESETS: Record<(typeof MEDICATIONS)[number], number[]> = {
  Ozempic: [0.25, 0.5, 1.0, 2.0],
  Wegovy: [0.25, 0.5, 1.0, 1.7, 2.4],
  Mounjaro: [2.5, 5.0, 7.5, 10.0, 12.5, 15.0],
  Saxenda: [0.6, 1.2, 1.8, 2.4, 3.0],
  Trulicity: [0.75, 1.5, 3.0, 4.5],
};

function todayString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0] ?? dateStr;
}

function medReminderId(medId: string): number {
  return 8000 + (parseInt(medId.slice(-6), 10) % 900);
}

// ─── Star Rating Component ─────────────────────────────────────────

interface StarRatingProps {
  value: number;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  label?: string;
}

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star as 1 | 2 | 3 | 4 | 5)}
            className="transition-transform active:scale-110"
            aria-label={`Rate ${star}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          </button>
        )
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function GLP1Dashboard() {
  const { glp1Logs, addGLP1Log, weightLogs, medications, medicationDoses, addMedication, updateMedication, deleteMedication, upsertDose } = useGlowFitStore();

  const [showForm, setShowForm] = useState(false);
  const [dosage, setDosage] = useState<number>(0.25);
  const [medication, setMedication] = useState<(typeof MEDICATIONS)[number]>('Ozempic');
  const [injectionSite, setInjectionSite] = useState<(typeof INJECTION_SITES)[number]>('Abdomen');
  const [appetite, setAppetite] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [nausea, setNausea] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [notes, setNotes] = useState('');

  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState<(typeof MEDICATIONS)[number]>('Ozempic');
  const [medDose, setMedDose] = useState<number>(0.25);
  const [medFreq, setMedFreq] = useState<number>(7);
  const [medTime, setMedTime] = useState('08:00');
  const [medReminder, setMedReminder] = useState(true);

  const dueDateFor = (medId: string, frequencyDays: number): string => {
    const taken = medicationDoses
      .filter((d) => d.medicationId === medId && d.taken)
      .sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0));
    if (taken.length === 0) return todayString();
    return addDays(taken[0].date, frequencyDays);
  };

  const scheduleDoseReminder = async (medId: string, name: string, dose: number, dueDate: string, time: string) => {
    const [hh, mm] = time.split(':').map(Number);
    const [y, mo, dd] = dueDate.split('-').map(Number);
    const at = new Date(y, (mo ?? 1) - 1, dd, hh ?? 8, mm ?? 0);
    if (at.getTime() <= Date.now()) return;
    await notifications.scheduleMedReminder(
      `${name} dose due`,
      `Time for your ${dose}mg dose of ${name}.`,
      at,
      medReminderId(medId)
    );
  };

  const handleAddMedication = async () => {
    haptics.medium();
    const id = Date.now().toString();
    addMedication({ id, name: medName, dose: medDose, frequencyDays: medFreq, reminderTime: medTime, reminderEnabled: medReminder });
    if (medReminder) {
      await notifications.requestPermission();
      await scheduleDoseReminder(id, medName, medDose, todayString(), medTime);
    }
    setShowMedForm(false);
    setMedDose(DOSAGE_PRESETS[medName][0] ?? 0.25);
    haptics.success();
    track('medication_added', { name: medName });
  };

  const handleMarkTaken = async (medId: string, name: string, dose: number, frequencyDays: number, dueDate: string, reminderTime: string, reminderEnabled: boolean) => {
    haptics.medium();
    upsertDose({ id: `${medId}_${dueDate}`, medicationId: medId, date: dueDate, taken: true, takenAt: Date.now() });
    const nextDue = addDays(dueDate, frequencyDays);
    if (reminderEnabled) {
      await scheduleDoseReminder(medId, name, dose, nextDue, reminderTime);
    }
    haptics.success();
    track('medication_dose_taken', { name });
  };

  const handleDeleteMedication = async (medId: string) => {
    haptics.light();
    await notifications.cancel(medReminderId(medId));
    deleteMedication(medId);
    track('medication_deleted');
  };

  // ─── Derived Data ──────────────────────────────────────────────

  const sortedLogs = [...glp1Logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentLogs = sortedLogs.slice(0, 10);

  // Stats
  const totalInjections = glp1Logs.length;
  const avgAppetite =
    totalInjections > 0
      ? glp1Logs.reduce((sum, l) => sum + l.appetite, 0) / totalInjections
      : 0;
  const avgNausea =
    totalInjections > 0
      ? glp1Logs.reduce((sum, l) => sum + l.nausea, 0) / totalInjections
      : 0;
  const uniqueMeds = [...new Set(glp1Logs.map((l) => l.medication))];

  // Chart data: merge weight logs with GLP-1 injection dates
  const chartData = (() => {
    const injectionDates = new Set(glp1Logs.map((l) => l.date));
    const allDates = [
      ...new Set([
        ...weightLogs.map((w) => w.date),
        ...glp1Logs.map((l) => l.date),
      ]),
    ].sort();

    return allDates.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: date,
      weight: weightLogs.find((w) => w.date === date)?.weight ?? null,
      hasInjection: injectionDates.has(date),
    }));
  })();

  // ─── Handlers ──────────────────────────────────────────────────

  const handleSubmit = () => {
    if (dosage <= 0) return;

    const newLog: GLP1Log = {
      id: Date.now().toString(),
      date: todayString(),
      dosage,
      medication,
      injectionSite,
      appetite,
      nausea,
      notes,
    };

    addGLP1Log(newLog);
    setShowForm(false);
    setDosage(DOSAGE_PRESETS[medication][0] ?? 0.25);
    setNotes('');
    setAppetite(3);
    setNausea(1);
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">GLP-1 Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Log
        </button>
      </div>

      {/* ─── Add Log Form ──────────────────────────────────────── */}
      {showForm && (
        <div className="card-3d rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 font-serif">New Injection Log</h2>

          {/* Medication */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Medication
            </label>
            <select
              value={medication}
              onChange={(e) => {
                const med = e.target.value as (typeof MEDICATIONS)[number];
                setMedication(med);
                setDosage(DOSAGE_PRESETS[med][0] ?? 0.25);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm"
            >
              {MEDICATIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Dosage (mg)
            </label>
            <div className="flex flex-wrap gap-2">
              {DOSAGE_PRESETS[medication].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDosage(d)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                    dosage === d
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}mg
                </button>
              ))}
              <input
                type="number"
                step="0.01"
                min="0"
                value={dosage}
                onChange={(e) => setDosage(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-center"
                placeholder="Custom"
              />
            </div>
          </div>

          {/* Injection Site */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Injection Site
            </label>
            <div className="flex gap-2">
              {INJECTION_SITES.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => setInjectionSite(site)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    injectionSite === site
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>

          {/* Appetite Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Appetite Level
            </label>
            <StarRating value={appetite} onChange={setAppetite} />
          </div>

          {/* Nausea Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Nausea Level
            </label>
            <StarRating value={nausea} onChange={setNausea} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none"
              placeholder="How are you feeling today?"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={dosage <= 0}
            className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log Injection
          </button>
        </div>
      )}

      {/* ─── Stats Summary ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col items-center">
          <Syringe className="w-5 h-5 text-rose-400 mb-1" />
          <span className="text-2xl font-bold text-slate-800">{totalInjections}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Injections</span>
        </div>
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col items-center">
          <TrendingDown className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-2xl font-bold text-slate-800">{avgAppetite.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Appetite</span>
        </div>
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col items-center">
          <Activity className="w-5 h-5 text-sky-400 mb-1" />
          <span className="text-2xl font-bold text-slate-800">{avgNausea.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Nausea</span>
        </div>
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col items-center">
          <div className="w-5 h-5 flex items-center justify-center text-emerald-400 mb-1 text-lg font-bold">💊</div>
          <span className="text-2xl font-bold text-slate-800">{uniqueMeds.length}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Medications</span>
        </div>
      </div>

      {/* ─── Medications ───────────────────────────────────────── */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Medications
          </h3>
          <button onClick={() => setShowMedForm(!showMedForm)} aria-label={showMedForm ? 'Cancel medication' : 'Add medication'}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700">
            <Plus className="w-4 h-4" />
            {showMedForm ? 'Cancel' : 'Add'}
          </button>
        </div>

        {showMedForm && (
          <div className="space-y-3 mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Medication</label>
                <select value={medName}
                  onChange={(e) => {
                    const m = e.target.value as (typeof MEDICATIONS)[number];
                    setMedName(m);
                    setMedDose(DOSAGE_PRESETS[m][0] ?? 0.25);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm">
                  {MEDICATIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Dose (mg)</label>
                <input type="number" step="0.01" min="0" value={medDose}
                  onChange={(e) => setMedDose(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Every (days)</label>
                <div className="flex gap-1.5">
                  {[1, 7, 14].map((f) => (
                    <button key={f} type="button" onClick={() => setMedFreq(f)} aria-label={`Every ${f} days`}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${medFreq === f ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      {f === 1 ? 'Daily' : `${f}d`}
                    </button>
                  ))}
                  <input type="number" min="1" max="90" value={medFreq}
                    onChange={(e) => setMedFreq(parseInt(e.target.value, 10) || 7)}
                    className="w-14 px-2 py-2 rounded-xl bg-white border border-slate-200 text-xs text-center" aria-label="Custom frequency in days" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Reminder time</label>
                <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {medReminder ? <Bell className="w-4 h-4 text-rose-500" /> : <BellOff className="w-4 h-4 text-slate-300" />}
                Reminders
              </div>
              <button onClick={() => setMedReminder(!medReminder)} aria-label={medReminder ? 'Disable reminders' : 'Enable reminders'}
                className={`relative w-12 h-7 rounded-full transition-colors ${medReminder ? 'bg-rose-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${medReminder ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={handleAddMedication} disabled={medDose <= 0} aria-label="Save medication"
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50">
              Save Medication
            </button>
          </div>
        )}

        {medications.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No medications yet. Add one to get dose reminders and track adherence.
          </p>
        ) : (
          <div className="space-y-2">
            {medications.map((med) => {
              const due = dueDateFor(med.id, med.frequencyDays);
              const dose = medicationDoses.find((d) => d.medicationId === med.id && d.date === due);
              const taken = dose?.taken === true;
              const missed = !taken && due < todayString();
              return (
                <div key={med.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${taken ? 'bg-emerald-100' : missed ? 'bg-slate-100' : 'bg-orange-100'}`}>
                      <Pill className={`w-4 h-4 ${taken ? 'text-emerald-500' : missed ? 'text-slate-400' : 'text-orange-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{med.name} — {med.dose}mg</p>
                      <p className="text-[11px] text-slate-400">
                        {taken ? `Taken ${formatDate(dose.date)}` : missed ? `Missed ${formatDate(due)}` : due === todayString() ? 'Due today' : `Due ${formatDate(due)}`} · every {med.frequencyDays === 1 ? 'day' : `${med.frequencyDays} days`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!taken && (
                      <button onClick={() => handleMarkTaken(med.id, med.name, med.dose, med.frequencyDays, due, med.reminderTime, med.reminderEnabled)}
                        aria-label={`Mark ${med.name} taken`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold active:scale-95 transition-all">
                        <Check className="w-3.5 h-3.5" /> Taken
                      </button>
                    )}
                    <button onClick={() => {
                      const next = !med.reminderEnabled;
                      updateMedication(med.id, { reminderEnabled: next });
                      if (!next) notifications.cancel(medReminderId(med.id));
                      else scheduleDoseReminder(med.id, med.name, med.dose, due, med.reminderTime);
                    }} aria-label={med.reminderEnabled ? 'Disable reminder' : 'Enable reminder'} className="p-1.5">
                      {med.reminderEnabled ? <Bell className="w-4 h-4 text-rose-400" /> : <BellOff className="w-4 h-4 text-slate-300" />}
                    </button>
                    <button onClick={() => handleDeleteMedication(med.id)} aria-label={`Delete ${med.name}`} className="p-1.5">
                      <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Weight Correlation Chart ──────────────────────────── */}
      {chartData.length > 1 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
            Weight Correlation
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              {chartData
                .filter((d) => d.hasInjection && d.weight != null)
                .map((d) => (
                  <ReferenceDot
                    key={d.rawDate}
                    x={d.date}
                    y={d.weight ?? 0}
                    r={5}
                    fill="#8b5cf6"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-rose-500 inline-block rounded" />
              Weight
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-violet-500 rounded-full inline-block" />
              Injection
            </div>
          </div>
        </div>
      )}

      {/* ─── Recent Logs ───────────────────────────────────────── */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          Recent Injections
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No injections logged yet. Tap "Add Log" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Syringe className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {log.medication} — {log.dosage}mg
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(log.date)} · {log.injectionSite}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      log.appetite <= 2
                        ? 'bg-green-100 text-green-600'
                        : log.appetite >= 4
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Appetite {log.appetite}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      log.nausea <= 2
                        ? 'bg-green-100 text-green-600'
                        : log.nausea >= 4
                          ? 'bg-red-100 text-red-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Nausea {log.nausea}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
