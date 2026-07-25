import { useState, useRef, useCallback, useMemo } from 'react';
import { useGlowFitStore } from '../lib/store';
import type { ProgressPhoto } from '../types';
import {
  Camera,
  Plus,
  ArrowLeftRight,
  X,
  ImagePlus,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function uniqueDates(photos: ProgressPhoto[]): string[] {
  const set = new Set(photos.map((p) => p.date));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

type PhotoView = 'front' | 'side' | 'back';

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

interface PhotoSlotProps {
  label: string;
  value: string | undefined;
  onChange: (base64: string) => void;
  onClear: () => void;
}

function PhotoSlot({ label, value, onChange, onClear }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const base64 = await readFileAsBase64(file);
      onChange(base64);
      e.target.value = '';
    },
    [onChange],
  );

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={`${label} photo`}
            className="w-full aspect-[3/4] object-cover rounded-xl"
          />
          <button
            onClick={onClear}
            aria-label="Remove photo"
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          aria-label="Upload photo"
          className="w-full aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-rose-400 transition-colors flex flex-col items-center justify-center gap-2"
        >
          <ImagePlus className="w-6 h-6 text-slate-300" />
          <span className="text-xs text-slate-400">{label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

interface PhotoCardProps {
  photo: ProgressPhoto;
  selected: boolean;
  onSelect: () => void;
}

function PhotoCard({ photo, selected, onSelect }: PhotoCardProps) {
  const preview = photo.front ?? photo.side ?? photo.back;
  return (
    <button
      onClick={onSelect}
      aria-label={`Select photo from ${photo.date}`}
      className={`relative rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.97] ${
        selected
          ? 'border-rose-500 shadow-lg shadow-rose-200'
          : 'border-white/40'
      }`}
    >
      {preview ? (
        <img
          src={preview}
          alt={`Progress ${photo.date}`}
          className="w-full aspect-[3/4] object-cover"
        />
      ) : (
        <div className="w-full aspect-[3/4] bg-slate-100 flex items-center justify-center">
          <Camera className="w-8 h-8 text-slate-300" />
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-xs font-medium">{formatDate(photo.date)}</p>
      </div>
      {selected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">
            {selected ? '✓' : ''}
          </span>
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Compare View
// ═══════════════════════════════════════════════════════════════════

interface CompareViewProps {
  before: ProgressPhoto;
  after: ProgressPhoto;
  onExit: () => void;
}

function CompareView({ before, after, onExit }: CompareViewProps) {
  const [activeView, setActiveView] = useState<PhotoView>('front');

  const views: PhotoView[] = ['front', 'side', 'back'];

  const availableViews = views.filter(
    (v) => before[v] || after[v],
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Back to progress photos"
          className="flex items-center gap-1 text-sm text-rose-500 font-medium"
        >
          <ArrowLeftRight className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-slate-400">Before / After</span>
      </div>

      {/* View selector */}
      {availableViews.length > 1 && (
        <div className="flex gap-2">
          {availableViews.map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              aria-label={`View ${v}`}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeView === v
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/70 text-slate-500 border border-white/40'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Side-by-side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-2 shadow-[var(--shadow-card)]">
            {before[activeView] ? (
              <img
                src={before[activeView]}
                alt="Before"
                className="w-full aspect-[3/4] object-cover rounded-xl"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </div>
          <p className="text-center text-[10px] text-slate-400 font-medium">
            {formatDate(before.date)}
          </p>
        </div>
        <div className="space-y-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-2 shadow-[var(--shadow-card)]">
            {after[activeView] ? (
              <img
                src={after[activeView]}
                alt="After"
                className="w-full aspect-[3/4] object-cover rounded-xl"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </div>
          <p className="text-center text-[10px] text-slate-400 font-medium">
            {formatDate(after.date)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {(before.notes || after.notes) && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-2">
          {before.notes && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Before Notes
              </p>
              <p className="text-sm text-slate-600">{before.notes}</p>
            </div>
          )}
          {after.notes && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                After Notes
              </p>
              <p className="text-sm text-slate-600">{after.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export function ProgressPhotos() {
  const { progressPhotos, addPhoto } = useGlowFitStore();

  // ── State ────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [front, setFront] = useState<string | undefined>();
  const [side, setSide] = useState<string | undefined>();
  const [back, setBack] = useState<string | undefined>();
  const [notes, setNotes] = useState('');

  const [compareMode, setCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [compareBefore, setCompareBefore] = useState<ProgressPhoto | null>(null);
  const [compareAfter, setCompareAfter] = useState<ProgressPhoto | null>(null);

  // ── Derived ──────────────────────────────────────────────────────
  const sorted = useMemo(
    () =>
      [...progressPhotos].sort((a, b) => b.date.localeCompare(a.date)),
    [progressPhotos],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ProgressPhoto[]>();
    for (const photo of sorted) {
      const existing = map.get(photo.date);
      if (existing) {
        existing.push(photo);
      } else {
        map.set(photo.date, [photo]);
      }
    }
    return map;
  }, [sorted]);

  const dates = useMemo(() => uniqueDates(sorted), [sorted]);

  // ── Handlers ─────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setDate(new Date().toISOString().split('T')[0] ?? '');
    setFront(undefined);
    setSide(undefined);
    setBack(undefined);
    setNotes('');
  }, []);

  const handleSave = useCallback(() => {
    const hasPhotos = front || side || back;
    if (!hasPhotos || !date) return;

    const photo: ProgressPhoto = {
      id: Date.now().toString(),
      date,
      front,
      side,
      back,
      notes: notes.trim(),
    };

    addPhoto(photo);
    resetForm();
    setShowForm(false);
  }, [date, front, side, back, notes, addPhoto, resetForm]);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedPhotos((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 2) return [prev[1], id];
        return [...prev, id];
      });
    },
    [],
  );

  const startCompare = useCallback(() => {
    if (selectedPhotos.length !== 2) return;
    const a = sorted.find((p) => p.id === selectedPhotos[0]);
    const b = sorted.find((p) => p.id === selectedPhotos[1]);
    if (!a || !b) return;

    // Ensure chronological order
    if (a.date <= b.date) {
      setCompareBefore(a);
      setCompareAfter(b);
    } else {
      setCompareBefore(b);
      setCompareAfter(a);
    }
    setCompareMode(true);
  }, [selectedPhotos, sorted]);

  const exitCompare = useCallback(() => {
    setCompareMode(false);
    setSelectedPhotos([]);
    setCompareBefore(null);
    setCompareAfter(null);
  }, []);

  // ── Compare View ─────────────────────────────────────────────────
  if (compareMode && compareBefore && compareAfter) {
    return (
      <CompareView
        before={compareBefore}
        after={compareAfter}
        onExit={exitCompare}
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Progress Photos</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
          aria-label="Add photos"
        >
          <Plus className="w-4 h-4" /> Add Photos
        </button>
      </div>

      {/* Add Photos Form */}
      {showForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PhotoSlot
              label="Front"
              value={front}
              onChange={setFront}
              onClear={() => setFront(undefined)}
            />
            <PhotoSlot
              label="Side"
              value={side}
              onChange={setSide}
              onClear={() => setSide(undefined)}
            />
            <PhotoSlot
              label="Back"
              value={back}
              onChange={setBack}
              onClear={() => setBack(undefined)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling about your progress?"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!front && !side && !back}
              className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Save photos"
            >
              Save Photos
            </button>
          </div>
        </div>
      )}

      {/* Compare Bar */}
      {sorted.length >= 2 && (
        <div className="flex items-center justify-between">
          <button
            onClick={startCompare}
            disabled={selectedPhotos.length !== 2}
            className="flex items-center gap-1.5 text-sm font-medium text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Compare selected photos"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare{selectedPhotos.length === 2 ? ' ✓' : ''}
          </button>
          <span className="text-xs text-slate-400">
            {selectedPhotos.length === 0
              ? 'Tap two photos to compare'
              : `${selectedPhotos.length}/2 selected`}
          </span>
        </div>
      )}

      {/* Gallery */}
      {sorted.length > 0 ? (
        <div className="space-y-4">
          {dates.map((date) => {
            const photosOnDate = grouped.get(date) ?? [];
            return (
              <div key={date} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {formatDate(date)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {photosOnDate.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      selected={selectedPhotos.includes(photo.id)}
                      onSelect={() => toggleSelect(photo.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        !showForm && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
            <Camera className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No progress photos yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Track your transformation with front, side, and back photos
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 mx-auto flex items-center gap-1.5 bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
              aria-label="Add your first photos"
            >
              <Camera className="w-4 h-4" /> Add Your First Photos
            </button>
          </div>
        )
      )}
    </div>
  );
}
