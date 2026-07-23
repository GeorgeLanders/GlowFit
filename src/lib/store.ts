import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile, WorkoutLog, CalorieLog, WaterLog, WeightLog,
  SleepLog, WellnessLog, CycleLog, Habit, Streak, BodyMeasurement,
  ProgressPhoto, GLP1Log, ChatMessage, JournalEntry, FoodItem,
  WorkoutTemplate,
} from '../types';

// ═══════════════════════════════════════════════════════════════════
// Store Slices
// ═══════════════════════════════════════════════════════════════════

interface ProfileSlice {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
}

interface WorkoutSlice {
  workouts: WorkoutLog[];
  workoutTemplates: WorkoutTemplate[];
  addWorkout: (w: WorkoutLog) => void;
  deleteWorkout: (id: string) => void;
}

interface NutritionSlice {
  calorieLogs: CalorieLog[];
  recentFoods: FoodItem[];
  addCalorieLog: (log: CalorieLog) => void;
  addRecentFood: (food: FoodItem) => void;
}

interface WaterSlice {
  waterLogs: WaterLog[];
  addWater: (log: WaterLog) => void;
}

interface WeightSlice {
  weightLogs: WeightLog[];
  addWeight: (log: WeightLog) => void;
}

interface SleepSlice {
  sleepLogs: SleepLog[];
  addSleep: (log: SleepLog) => void;
}

interface WellnessSlice {
  wellnessLogs: WellnessLog[];
  addWellness: (log: WellnessLog) => void;
}

interface CycleSlice {
  cycleLogs: CycleLog[];
  addCycleLog: (log: CycleLog) => void;
}

interface HabitSlice {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  toggleHabitDate: (habitId: string, date: string) => void;
}

interface StreakSlice {
  streaks: Streak[];
  updateStreak: (streak: Streak) => void;
}

interface BodySlice {
  measurements: BodyMeasurement[];
  addMeasurement: (m: BodyMeasurement) => void;
}

interface PhotoSlice {
  progressPhotos: ProgressPhoto[];
  addPhoto: (p: ProgressPhoto) => void;
}

interface GLP1Slice {
  glp1Logs: GLP1Log[];
  addGLP1Log: (log: GLP1Log) => void;
}

interface ChatSlice {
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

interface JournalSlice {
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
}

interface UISlice {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentScreen: string | null;
  pushScreen: (screen: string) => void;
  popScreen: () => void;
  seeded: boolean;
  markSeeded: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// Combined Store Type
// ═══════════════════════════════════════════════════════════════════

export type GlowFitStore =
  ProfileSlice & WorkoutSlice & NutritionSlice & WaterSlice &
  WeightSlice & SleepSlice & WellnessSlice & CycleSlice &
  HabitSlice & StreakSlice & BodySlice & PhotoSlice &
  GLP1Slice & ChatSlice & JournalSlice & UISlice;

// ═══════════════════════════════════════════════════════════════════
// Default Profile
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_PROFILE: Profile = {
  name: '',
  age: 0,
  height: 170,
  currentWeight: 70,
  goalWeight: 65,
  gender: 'other',
  activityLevel: 'moderate',
  goal: 'maintain',
  glp1User: false,
  onboardingCompleted: false,
};

// ═══════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════

export const useGlowFitStore = create<GlowFitStore>()(
  persist(
    (set) => ({
      // Profile
      profile: DEFAULT_PROFILE,
      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      // Workouts
      workouts: [],
      workoutTemplates: [],
      addWorkout: (w) => set((s) => ({ workouts: [w, ...s.workouts] })),
      deleteWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      // Nutrition
      calorieLogs: [],
      recentFoods: [],
      addCalorieLog: (log) =>
        set((s) => ({ calorieLogs: [log, ...s.calorieLogs] })),
      addRecentFood: (food) =>
        set((s) => ({
          recentFoods: [food, ...s.recentFoods.filter((f) => f.id !== food.id)].slice(0, 20),
        })),

      // Water
      waterLogs: [],
      addWater: (log) => set((s) => ({ waterLogs: [log, ...s.waterLogs] })),

      // Weight
      weightLogs: [],
      addWeight: (log) => set((s) => ({ weightLogs: [log, ...s.weightLogs] })),

      // Sleep
      sleepLogs: [],
      addSleep: (log) => set((s) => ({ sleepLogs: [log, ...s.sleepLogs] })),

      // Wellness
      wellnessLogs: [],
      addWellness: (log) =>
        set((s) => ({ wellnessLogs: [log, ...s.wellnessLogs] })),

      // Cycle
      cycleLogs: [],
      addCycleLog: (log) =>
        set((s) => ({ cycleLogs: [log, ...s.cycleLogs] })),

      // Habits
      habits: [],
      addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
      toggleHabitDate: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date],
                }
              : h
          ),
        })),

      // Streaks
      streaks: [],
      updateStreak: (streak) =>
        set((s) => ({
          streaks: s.streaks.map((st) => (st.id === streak.id ? streak : st)),
        })),

      // Body measurements
      measurements: [],
      addMeasurement: (m) =>
        set((s) => ({ measurements: [m, ...s.measurements] })),

      // Progress photos
      progressPhotos: [],
      addPhoto: (p) =>
        set((s) => ({ progressPhotos: [p, ...s.progressPhotos] })),

      // GLP-1
      glp1Logs: [],
      addGLP1Log: (log) =>
        set((s) => ({ glp1Logs: [log, ...s.glp1Logs] })),

      // Chat
      chatMessages: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      // Journal
      journalEntries: [],
      addJournalEntry: (entry) =>
        set((s) => ({ journalEntries: [entry, ...s.journalEntries] })),

      // UI
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab, currentScreen: null }),
      currentScreen: null,
      pushScreen: (screen) => set({ currentScreen: screen }),
      popScreen: () => set({ currentScreen: null }),
      seeded: false,
      markSeeded: () => set({ seeded: true }),
    }),
    {
      name: 'glowfit-storage',
    }
  )
);
