// ═══════════════════════════════════════════════════════════════════
// GlowFit Data Types — Ported from Kotlin entities
// ═══════════════════════════════════════════════════════════════════

// ─── Core Profile ────────────────────────────────────────────────
export interface Profile {
  name: string;
  age: number;
  height: number; // cm
  currentWeight: number; // kg
  goalWeight: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  glp1User: boolean;
  onboardingCompleted: boolean;
}

// ─── Workouts ────────────────────────────────────────────────────
export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'sports';
  duration: number; // minutes
  caloriesBurned: number;
  sets: ExerciseSet[];
  notes: string;
}

export interface ExerciseSet {
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  category: string;
}

// ─── Nutrition ────────────────────────────────────────────────────
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
}

export interface CalorieLog {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: FoodItem;
  quantity: number;
  timestamp: number;
}

export interface MealPlan {
  id: string;
  date: string;
  meals: MealPlanMeal[];
}

export interface MealPlanMeal {
  name: string;
  foods: FoodItem[];
  totalCalories: number;
}

// ─── Water ────────────────────────────────────────────────────────
export interface WaterLog {
  id: string;
  date: string;
  amount: number; // ml
  timestamp: number;
}

// ─── Weight ───────────────────────────────────────────────────────
export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  timestamp: number;
}

// ─── Body Composition ─────────────────────────────────────────────
export interface BodyMeasurement {
  id: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
  bodyFatPercent?: number;
}

// ─── Sleep ────────────────────────────────────────────────────────
export interface SleepLog {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  quality: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

// ─── Mood / Wellness ─────────────────────────────────────────────
export interface WellnessLog {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

// ─── Cycle Tracking ──────────────────────────────────────────────
export interface CycleLog {
  id: string;
  date: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  flow: 'none' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes: string;
}

// ─── Habits ───────────────────────────────────────────────────────
export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  color: string;
  icon: string;
  completedDates: string[];
}

// ─── Streaks ──────────────────────────────────────────────────────
export interface Streak {
  id: string;
  name: string;
  currentCount: number;
  bestCount: number;
  lastCompletedDate: string;
  active: boolean;
}

// ─── Progress Photos ─────────────────────────────────────────────
export interface ProgressPhoto {
  id: string;
  date: string;
  front?: string; // base64 or URL
  side?: string;
  back?: string;
  notes: string;
}

// ─── GLP-1 ────────────────────────────────────────────────────────
export interface GLP1Log {
  id: string;
  date: string;
  dosage: number;
  medication: string;
  injectionSite: string;
  appetite: 1 | 2 | 3 | 4 | 5;
  nausea: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

// ─── AI Chat ──────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── Journal ──────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}
