import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile, WorkoutLog, CalorieLog, WaterLog, WeightLog,
  SleepLog, WellnessLog, CycleLog, Habit, Streak, BodyMeasurement,
  ProgressPhoto, GLP1Log, Medication, MedicationDose, ChatMessage,
  JournalEntry, FoodItem,
  FoodPhotoEntry, FastingSettings, FastingLog, HealthSteps, WorkoutTemplate,
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
  foodPhotoEntries: FoodPhotoEntry[];
  addCalorieLog: (log: CalorieLog) => void;
  addRecentFood: (food: FoodItem) => void;
  addFoodPhotoEntry: (entry: FoodPhotoEntry) => void;
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
  upsertHealthSleep: (log: SleepLog) => void;
  healthSteps: HealthSteps[];
  upsertHealthSteps: (entry: HealthSteps) => void;
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
  medications: Medication[];
  medicationDoses: MedicationDose[];
  addMedication: (m: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  upsertDose: (dose: MedicationDose) => void;
}

interface FastingSlice {
  fastingSettings: FastingSettings;
  updateFastingSettings: (updates: Partial<FastingSettings>) => void;
  fastingLogs: FastingLog[];
  startFast: (log: FastingLog) => void;
  endFast: (id: string, endedAt: number, completed: boolean) => void;
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

  // AI Provider Config (BYOK)
  aiConfig: {
    mode: 'app-default' | 'bring-your-own-key';
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  setAiMode: (mode: 'app-default' | 'bring-your-own-key') => void;
  setAiProvider: (provider: string, baseUrl: string, model: string) => void;
  setAiApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
}

// ═══════════════════════════════════════════════════════════════════
// Combined Store Type
// ═══════════════════════════════════════════════════════════════════

export type GlowFitStore =
  ProfileSlice & WorkoutSlice & NutritionSlice & WaterSlice &
  WeightSlice & SleepSlice & WellnessSlice & CycleSlice &
  HabitSlice & StreakSlice & BodySlice & PhotoSlice &
  GLP1Slice & FastingSlice & ChatSlice & JournalSlice & UISlice;

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
      foodPhotoEntries: [],
      addCalorieLog: (log) =>
        set((s) => ({ calorieLogs: [log, ...s.calorieLogs] })),
      addRecentFood: (food) =>
        set((s) => ({
          recentFoods: [food, ...s.recentFoods.filter((f) => f.id !== food.id)].slice(0, 20),
        })),
      addFoodPhotoEntry: (entry) =>
        set((s) => ({ foodPhotoEntries: [entry, ...s.foodPhotoEntries] })),

      // Water
      waterLogs: [],
      addWater: (log) => set((s) => ({ waterLogs: [log, ...s.waterLogs] })),

      // Weight
      weightLogs: [],
      addWeight: (log) => set((s) => ({ weightLogs: [log, ...s.weightLogs] })),

      // Sleep
      sleepLogs: [],
      addSleep: (log) => set((s) => ({ sleepLogs: [log, ...s.sleepLogs] })),
      upsertHealthSleep: (log) =>
        set((s) => ({
          sleepLogs: [
            log,
            ...s.sleepLogs.filter(
              (l) => !(l.date === log.date && l.source === 'health-connect')
            ),
          ],
        })),
      healthSteps: [],
      upsertHealthSteps: (entry) =>
        set((s) => ({
          healthSteps: [
            entry,
            ...s.healthSteps.filter((e) => e.date !== entry.date),
          ],
        })),

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
      medications: [],
      medicationDoses: [],
      addMedication: (m) =>
        set((s) => ({ medications: [...s.medications, m] })),
      updateMedication: (id, updates) =>
        set((s) => ({
          medications: s.medications.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMedication: (id) =>
        set((s) => ({
          medications: s.medications.filter((m) => m.id !== id),
          medicationDoses: s.medicationDoses.filter((d) => d.medicationId !== id),
        })),
      upsertDose: (dose) =>
        set((s) => ({
          medicationDoses: [
            dose,
            ...s.medicationDoses.filter(
              (d) => !(d.medicationId === dose.medicationId && d.date === dose.date)
            ),
          ],
        })),

      // Fasting
      fastingSettings: { enabled: true, windowHours: 16, reminderMinutesBefore: 30 },
      updateFastingSettings: (updates) =>
        set((s) => ({ fastingSettings: { ...s.fastingSettings, ...updates } })),
      fastingLogs: [],
      startFast: (log) =>
        set((s) => ({ fastingLogs: [log, ...s.fastingLogs] })),
      endFast: (id, endedAt, completed) =>
        set((s) => ({
          fastingLogs: s.fastingLogs.map((l) =>
            l.id === id ? { ...l, endedAt, completed } : l
          ),
        })),

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

      // AI Provider Config (BYOK)
      aiConfig: {
        mode: 'app-default',
        provider: 'gemini',
        apiKey: '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-2.0-flash',
      },
      setAiMode: (mode) => set((s) => ({ aiConfig: { ...s.aiConfig, mode } })),
      setAiProvider: (provider, baseUrl, model) =>
        set((s) => ({ aiConfig: { ...s.aiConfig, provider, baseUrl, model } })),
      setAiApiKey: (apiKey) => set((s) => ({ aiConfig: { ...s.aiConfig, apiKey } })),
      setAiModel: (model) => set((s) => ({ aiConfig: { ...s.aiConfig, model } })),
    }),
    {
      name: 'glowfit-storage',
    }
  )
);
