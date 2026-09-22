// ═══════════════════════════════════════════════════════════════════
// GlowFit Onboarding Flow — 4-step wizard for first-time users
// ═══════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Activity,
  Target,
  Dumbbell,
  Heart,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  User,
} from 'lucide-react';
import { useGlowFitStore } from '../lib/store';
import type { Profile } from '../types';

// ─── Constants ────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<Profile['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<Profile['activityLevel'], string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Active',
  very_active: 'Very Active',
};

const ACTIVITY_DESCRIPTIONS: Record<Profile['activityLevel'], string> = {
  sedentary: 'Little or no exercise',
  light: 'Light exercise 1–3 days/week',
  moderate: 'Moderate exercise 3–5 days/week',
  active: 'Hard exercise 6–7 days/week',
  very_active: 'Very intense exercise daily',
};

const GENDER_OPTIONS: { value: Profile['gender']; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const GOAL_OPTIONS: {
  value: Profile['goal'];
  label: string;
  icon: typeof TrendingDown;
}[] = [
  { value: 'lose', label: 'Lose Weight', icon: TrendingDown },
  { value: 'maintain', label: 'Maintain', icon: Minus },
  { value: 'gain', label: 'Gain Muscle', icon: TrendingUp },
];

const TOTAL_STEPS = 4;
const KG_PER_LB = 0.45359237;
const CM_PER_INCH = 2.54;

function convertInput(value: string, factor: number): string {
  if (!value.trim()) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Number((parsed * factor).toFixed(4))) : '';
}

// ─── Glassmorphism Styles ────────────────────────────────────────

const glassCard =
  'bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)]';

// ─── Helper: TDEE Calculation (Mifflin-St Jeor) ──────────────────

function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: Profile['gender'],
  activityLevel: Profile['activityLevel']
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    const maleBMR = 10 * weight + 6.25 * height - 5 * age + 5;
    const femaleBMR = 10 * weight + 6.25 * height - 5 * age - 161;
    bmr = (maleBMR + femaleBMR) / 2;
  }
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

function getDailyCalories(tdee: number, goal: Profile['goal']): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500);
    case 'gain':
      return Math.round(tdee + 300);
    case 'maintain':
    default:
      return tdee;
  }
}

// ─── Main Component ──────────────────────────────────────────────

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const updateProfile = useGlowFitStore((s) => s.updateProfile);

  // Wizard state
  const [step, setStep] = useState(0);
  const [animDirection, setAnimDirection] = useState<'forward' | 'backward'>(
    'forward'
  );

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Profile['gender']>('other');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [goal, setGoal] = useState<Profile['goal']>('maintain');
  const [activityLevel, setActivityLevel] =
    useState<Profile['activityLevel']>('moderate');
  const [glp1User, setGlp1User] = useState(false);

  // ── Derived data ──────────────────────────────────────────────

  const parsedAge = parseInt(age, 10);
  // Keep calculations and the persisted profile in cm/kg, regardless of input units.
  const heightFactor = heightUnit === 'inches' ? CM_PER_INCH : 1;
  const weightFactor = weightUnit === 'lbs' ? KG_PER_LB : 1;
  // Round to 1 decimal so unit conversion doesn't store 86.1825503 kg.
  const round1 = (n: number) => Number(n.toFixed(1));
  const parsedHeight = round1(parseFloat(height) * heightFactor);
  const parsedCurrentWeight = round1(parseFloat(currentWeight) * weightFactor);
  const parsedGoalWeight = round1(parseFloat(goalWeight) * weightFactor);

  const isStep2Valid =
    name.trim().length > 0 &&
    !isNaN(parsedAge) &&
    parsedAge > 0 &&
    Number.isFinite(parsedHeight) &&
    parsedHeight > 0 &&
    Number.isFinite(parsedCurrentWeight) &&
    parsedCurrentWeight > 0 &&
    Number.isFinite(parsedGoalWeight) &&
    parsedGoalWeight > 0;

  const tdee = useMemo(() => {
    if (!isStep2Valid) return 0;
    return calculateTDEE(
      parsedCurrentWeight,
      parsedHeight,
      parsedAge,
      gender,
      activityLevel
    );
  }, [
    parsedCurrentWeight,
    parsedHeight,
    parsedAge,
    gender,
    activityLevel,
    isStep2Valid,
  ]);

  const dailyCalories = useMemo(() => {
    if (tdee === 0) return 0;
    return getDailyCalories(tdee, goal);
  }, [tdee, goal]);

  // ── Navigation ────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setAnimDirection('forward');
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setAnimDirection('backward');
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleComplete = useCallback(() => {
    updateProfile({
      name: name.trim(),
      age: parsedAge,
      height: parsedHeight,
      currentWeight: parsedCurrentWeight,
      goalWeight: parsedGoalWeight,
      gender,
      activityLevel,
      goal,
      glp1User,
      onboardingCompleted: true,
    });
    onComplete();
  }, [
    name,
    parsedAge,
    parsedHeight,
    parsedCurrentWeight,
    parsedGoalWeight,
    gender,
    activityLevel,
    goal,
    glp1User,
    updateProfile,
    onComplete,
  ]);

  // ── Animation class ───────────────────────────────────────────

  const slideClass =
    animDirection === 'forward'
      ? 'animate-slideInFromRight'
      : 'animate-slideInFromLeft';

  // ── Render Steps ──────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderBasicInfo();
      case 2:
        return renderGoalsAndActivity();
      case 3:
        return renderSummary();
      default:
        return null;
    }
  };

  // ─── Step 0: Welcome ──────────────────────────────────────────

  function renderWelcome() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-300 flex items-center justify-center mb-8 shadow-lg">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-rose-900 mb-3 tracking-tight">
          GlowFit
        </h1>
        <p className="text-lg text-rose-700/80 mb-12 max-w-sm">
          Your personalized fitness companion
        </p>
        <button
          onClick={goNext}
          aria-label="Get started"
          className="w-full max-w-xs py-4 px-8 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 active:from-purple-500 active:to-pink-500 text-purple-950 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
        >
          Get Started
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ─── Step 1: Basic Info ───────────────────────────────────────

  function renderBasicInfo() {
    return (
      <div className="px-5 py-6 space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-rose-900 mb-1">
            Tell Us About You
          </h2>
          <p className="text-sm text-rose-700/70">
            This helps us personalize your experience
          </p>
        </div>

        {/* Name */}
        <div className={`${glassCard} p-4`}>
          <label className="block text-sm font-medium text-rose-900 mb-2">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full pl-11 pr-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Age + Gender row */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${glassCard} p-4`}>
            <label className="block text-sm font-medium text-rose-900 mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="1"
              max="120"
              className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
          </div>
          <div className={`${glassCard} p-4`}>
            <label className="block text-sm font-medium text-rose-900 mb-2">
              Gender
            </label>
            <div className="flex gap-1.5">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  aria-label={`Select ${opt.label}`}
                  className={`flex-1 py-2.5 px-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    gender === opt.value
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/60 text-rose-700 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Heights + Weights */}
        <div className={`${glassCard} p-4 space-y-4`}>
          <div>
            <label htmlFor="onboarding-height" className="block text-sm font-medium text-rose-900 mb-2">
              Height ({heightUnit})
            </label>
            <div role="group" aria-label="Height unit" className="flex gap-2 mb-3">
              {(['cm', 'inches'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  aria-pressed={heightUnit === unit}
                  onClick={() => {
                    if (unit === heightUnit) return;
                    setHeight(convertInput(height, unit === 'inches' ? 1 / CM_PER_INCH : CM_PER_INCH));
                    setHeightUnit(unit);
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${heightUnit === unit ? 'bg-rose-500 text-white shadow-md' : 'bg-white/60 text-rose-700 border border-rose-200 hover:bg-rose-50'}`}
                >
                  {unit}
                </button>
              ))}
            </div>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
              <input
                id="onboarding-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === 'cm' ? '170' : '67'}
                min={50 / heightFactor}
                max={300 / heightFactor}
                step="any"
                inputMode="decimal"
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
            </div>
            {heightUnit === 'inches' && (
              <p className="text-[11px] text-rose-400 mt-1.5">
                Enter total inches — 5'7" is 67
              </p>
            )}
          </div>

          {/* Weight unit toggle hugs the weight inputs so it is not mistaken for height */}
          <div className="space-y-3">
            <div role="group" aria-label="Weight unit" className="flex gap-2">
              {(['kg', 'lbs'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  aria-pressed={weightUnit === unit}
                  onClick={() => {
                    if (unit === weightUnit) return;
                    const factor = unit === 'lbs' ? 1 / KG_PER_LB : KG_PER_LB;
                    setCurrentWeight(convertInput(currentWeight, factor));
                    setGoalWeight(convertInput(goalWeight, factor));
                    setWeightUnit(unit);
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${weightUnit === unit ? 'bg-rose-500 text-white shadow-md' : 'bg-white/60 text-rose-700 border border-rose-200 hover:bg-rose-50'}`}
                >
                  {unit}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="onboarding-current-weight" className="block text-sm font-medium text-rose-900 mb-2">
                  Current Weight ({weightUnit})
                </label>
                <input
                  id="onboarding-current-weight"
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder={weightUnit === 'kg' ? '70' : '154'}
                  min={20 / weightFactor}
                  max={300 / weightFactor}
                  step="any"
                  inputMode="decimal"
                  className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="onboarding-goal-weight" className="block text-sm font-medium text-rose-900 mb-2">
                  Goal Weight ({weightUnit})
                </label>
                <input
                  id="onboarding-goal-weight"
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder={weightUnit === 'kg' ? '65' : '143'}
                  min={20 / weightFactor}
                  max={300 / weightFactor}
                  step="any"
                  inputMode="decimal"
                  className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Validation hint */}
        {!isStep2Valid && (
          <p className="text-center text-xs text-rose-400">
            Please fill in your name, age, height, current weight, and goal weight
          </p>
        )}

        {/* Continue button */}
        <button
          onClick={goNext}
          disabled={!isStep2Valid}
          aria-label="Continue to next step"
          className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg ${
            isStep2Valid
              ? 'bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 active:from-purple-500 active:to-pink-500 text-purple-950 shadow-lg hover:shadow-xl'
              : 'bg-rose-200 text-rose-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ─── Step 2: Goals & Activity ─────────────────────────────────

  function renderGoalsAndActivity() {
    return (
      <div className="px-5 py-6 space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-rose-900 mb-1">
            Your Goals
          </h2>
          <p className="text-sm text-rose-700/70">
            What are you working towards?
          </p>
        </div>

        {/* Goal selector */}
        <div>
          <label className="block text-sm font-medium text-rose-900 mb-3 px-1">
            Primary Goal
          </label>
          <div className="grid grid-cols-3 gap-3">
            {GOAL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  aria-label={opt.label}
                  className={`${glassCard} p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                    goal === opt.value
                      ? '!bg-rose-500 !border-rose-500 text-white shadow-lg'
                      : 'hover:bg-rose-50'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      goal === opt.value ? 'text-white' : 'text-rose-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      goal === opt.value ? 'text-white' : 'text-rose-900'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity level */}
        <div>
          <label className="block text-sm font-medium text-rose-900 mb-3 px-1">
            Activity Level
          </label>
          <div className="space-y-2">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as Profile['activityLevel'][]).map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setActivityLevel(level)}
                  aria-label={ACTIVITY_LABELS[level]}
                  className={`w-full ${glassCard} p-4 flex items-center gap-4 transition-all duration-200 ${
                    activityLevel === level
                      ? '!bg-rose-500 !border-rose-500 text-white shadow-lg'
                      : 'hover:bg-rose-50'
                  }`}
                >
                  <Activity
                    className={`w-5 h-5 flex-shrink-0 ${
                      activityLevel === level ? 'text-white' : 'text-rose-500'
                    }`}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-medium ${
                        activityLevel === level ? 'text-white' : 'text-rose-900'
                      }`}
                    >
                      {ACTIVITY_LABELS[level]}
                    </div>
                    <div
                      className={`text-xs ${
                        activityLevel === level
                          ? 'text-rose-100'
                          : 'text-rose-500'
                      }`}
                    >
                      {ACTIVITY_DESCRIPTIONS[level]}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      activityLevel === level
                        ? 'border-white bg-white'
                        : 'border-rose-300'
                    }`}
                  >
                    {activityLevel === level && (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* GLP-1 Toggle */}
        <div className={`${glassCard} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" />
              <div>
                <div className="font-medium text-rose-900 text-sm">
                  Using GLP-1 medication?
                </div>
                <div className="text-xs text-rose-500">
                  Helps us tailor nutrition recommendations
                </div>
              </div>
            </div>
            <button
              onClick={() => setGlp1User(!glp1User)}
              aria-label={glp1User ? 'Disable GLP-1 medication' : 'Enable GLP-1 medication'}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                glp1User ? 'bg-rose-500' : 'bg-rose-200'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  glp1User ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={goNext}
          aria-label="Continue to next step"
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 active:from-purple-500 active:to-pink-500 text-purple-950 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ─── Step 3: Summary & Complete ───────────────────────────────

  function renderSummary() {
    const goalLabel =
      goal === 'lose'
        ? 'Lose Weight'
        : goal === 'gain'
          ? 'Gain Muscle'
          : 'Maintain';

    return (
      <div className="px-5 py-6 space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-rose-900 mb-1">
            Your Plan
          </h2>
          <p className="text-sm text-rose-700/70">
            Based on your information
          </p>
        </div>

        {/* Profile summary */}
        <div className={`${glassCard} p-5 space-y-3`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-300 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-rose-900 text-lg">{name}</div>
              <div className="text-sm text-rose-500 capitalize">
                {gender} · {parsedAge} years old
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-xs text-rose-500 mb-1">Height</div>
              <div className="font-bold text-rose-900">{height} {heightUnit}</div>
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-xs text-rose-500 mb-1">Current</div>
              <div className="font-bold text-rose-900">
                {currentWeight} {weightUnit}
              </div>
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-xs text-rose-500 mb-1">Goal</div>
              <div className="font-bold text-rose-900">
                {goalWeight} {weightUnit}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-rose-700">
            <Target className="w-4 h-4 text-rose-500" />
            <span>Goal: {goalLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-rose-700">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>
              Activity: {ACTIVITY_LABELS[activityLevel]}
            </span>
          </div>
          {glp1User && (
            <div className="flex items-center gap-2 text-sm text-rose-700">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>GLP-1 User</span>
            </div>
          )}
        </div>

        {/* TDEE & Calories */}
        <div className={`${glassCard} p-5`}>
          <div className="text-center">
            <Dumbbell className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <div className="text-sm text-rose-500 mb-1">
              Your Estimated Daily Calories
            </div>
            <div className="text-5xl font-bold text-rose-900 mb-1">
              {dailyCalories.toLocaleString()}
            </div>
            <div className="text-sm text-rose-500">
              kcal/day for{' '}
              <span className="font-medium text-rose-700">{goalLabel}</span>
            </div>
            <div className="mt-3 text-xs text-rose-400">
              TDEE: {tdee.toLocaleString()} kcal · BMR calculated with
              Mifflin-St Jeor
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleComplete}
          aria-label="Complete onboarding"
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 active:from-purple-500 active:to-pink-500 text-purple-950 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
        >
          <Sparkles className="w-5 h-5" />
          Start Your Journey
        </button>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/70 via-pink-50/60 to-rose-50/70">
      {/* Header: Back (flow, never overlaps content) + step dots */}
      {step > 0 && (
        <div className="flex items-center px-5 pt-12 pb-4">
          {step < TOTAL_STEPS - 1 && (
            <button
              onClick={goBack}
              aria-label="Go back"
              className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-rose-200 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1 flex items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-rose-500'
                    : i < step
                      ? 'w-2 bg-rose-400'
                      : 'w-2 bg-rose-200'
                }`}
              />
            ))}
          </div>
          {step < TOTAL_STEPS - 1 && <div className="w-20" aria-hidden="true" />}
        </div>
      )}

      {/* Step content with animation */}
      <div className={`${slideClass}`} key={step}>
        {renderStep()}
      </div>

      {/* Inline animations via style tag */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInFromRight {
          animation: slideInFromRight 0.35s ease-out forwards;
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
