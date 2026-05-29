import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Meal {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  created_at: string;
}

export interface DailyGoals {
  calorie_goal: number;
  protein_goal: number;
  carb_goal: number;
  fat_goal: number;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_logged_date?: string; // YYYY-MM-DD
}

interface AppState {
  user: User | null;
  session: any | null;
  meals: Meal[];
  goals: DailyGoals;
  streak: Streak;
  isLoading: boolean;
  isInitialized: boolean;
  activeAnalysis: { imageUri: string; result: any | null } | null;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null, session: any | null) => void;
  signUp: (email: string, name: string) => Promise<{ error: string | null }>;
  login: (email: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  
  // Goals Actions
  fetchGoals: () => Promise<void>;
  updateGoals: (goals: Partial<DailyGoals>) => Promise<void>;

  // Meals Actions
  fetchMeals: () => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editMeal: (id: string, updated: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;

  // Streak Actions
  fetchStreak: () => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  setActiveAnalysis: (analysis: { imageUri: string; result: any | null } | null) => void;
}

const DEFAULT_GOALS: DailyGoals = {
  calorie_goal: 2000,
  protein_goal: 150,
  carb_goal: 200,
  fat_goal: 65,
};

const DEFAULT_STREAK: Streak = {
  current_streak: 0,
  longest_streak: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  session: null,
  meals: [],
  goals: DEFAULT_GOALS,
  streak: DEFAULT_STREAK,
  isLoading: false,
  isInitialized: false,
  activeAnalysis: null,
  setActiveAnalysis: (activeAnalysis) => set({ activeAnalysis }),

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      if (isSupabaseConfigured && supabase) {
        // Read active session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userObj: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
          };
          set({ user: userObj, session });
          
          // Listen to auth state changes
          supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession && newSession.user) {
              const u: User = {
                id: newSession.user.id,
                email: newSession.user.email || '',
                name: newSession.user.user_metadata?.name || 'User',
              };
              set({ user: u, session: newSession });
            } else {
              set({ user: null, session: null, meals: [], goals: DEFAULT_GOALS, streak: DEFAULT_STREAK });
            }
          });
        }
      } else {
        // Fallback: Read mock user/session from AsyncStorage
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          set({ user: JSON.parse(storedUser), session: { access_token: 'mock-token' } });
        }
      }

      // Fetch user data if logged in
      if (get().user) {
        await get().fetchGoals();
        await get().fetchMeals();
        await get().fetchStreak();
      }
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  setUser: (user, session) => set({ user, session }),

  signUp: async (email, name) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'Password123!', // Simple dummy password for ease of use in challenge
          options: {
            data: { name },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          const userObj: User = {
            id: data.user.id,
            email: data.user.email || '',
            name,
          };
          set({ user: userObj, session: data.session });
          await get().fetchGoals();
          await get().fetchMeals();
          await get().fetchStreak();
        }
        return { error: null };
      } else {
        // Mock Register
        const mockUser: User = {
          id: Math.random().toString(36).substring(7),
          email,
          name,
        };
        await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
        // Setup initial default goals and streaks in AsyncStorage
        await AsyncStorage.setItem(`@goals_${mockUser.id}`, JSON.stringify(DEFAULT_GOALS));
        await AsyncStorage.setItem(`@streak_${mockUser.id}`, JSON.stringify(DEFAULT_STREAK));
        await AsyncStorage.setItem(`@meals_${mockUser.id}`, JSON.stringify([]));

        set({ user: mockUser, session: { access_token: 'mock-token' }, goals: DEFAULT_GOALS, streak: DEFAULT_STREAK, meals: [] });
        return { error: null };
      }
    } catch (e: any) {
      return { error: e.message || 'An error occurred' };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'Password123!',
        });
        if (error) return { error: error.message };
        if (data.user) {
          const userObj: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || 'User',
          };
          set({ user: userObj, session: data.session });
          await get().fetchGoals();
          await get().fetchMeals();
          await get().fetchStreak();
        }
        return { error: null };
      } else {
        // Mock Login
        const storedUserStr = await AsyncStorage.getItem('@user');
        let userObj: User;
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser.email.toLowerCase() === email.toLowerCase()) {
            userObj = storedUser;
          } else {
            userObj = { id: 'mock-user-123', email, name: 'Premium User' };
            await AsyncStorage.setItem('@user', JSON.stringify(userObj));
          }
        } else {
          userObj = { id: 'mock-user-123', email, name: 'Premium User' };
          await AsyncStorage.setItem('@user', JSON.stringify(userObj));
        }

        set({ user: userObj, session: { access_token: 'mock-token' } });
        await get().fetchGoals();
        await get().fetchMeals();
        await get().fetchStreak();
        return { error: null };
      }
    } catch (e: any) {
      return { error: e.message || 'An error occurred' };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      await AsyncStorage.removeItem('@user');
    }
    set({ user: null, session: null, meals: [], goals: DEFAULT_GOALS, streak: DEFAULT_STREAK });
  },

  fetchGoals: async () => {
    const user = get().user;
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('daily_goals')
        .select('calorie_goal, protein_goal, carb_goal, fat_goal')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        set({ goals: data });
      }
    } else {
      const stored = await AsyncStorage.getItem(`@goals_${user.id}`);
      if (stored) {
        set({ goals: JSON.parse(stored) });
      } else {
        set({ goals: DEFAULT_GOALS });
      }
    }
  },

  updateGoals: async (updated) => {
    const user = get().user;
    if (!user) return;

    const newGoals = { ...get().goals, ...updated };
    set({ goals: newGoals });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('daily_goals')
        .upsert({ user_id: user.id, ...newGoals, updated_at: new Date().toISOString() });
    } else {
      await AsyncStorage.setItem(`@goals_${user.id}`, JSON.stringify(newGoals));
    }
  },

  fetchMeals: async () => {
    const user = get().user;
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        set({ meals: data });
      }
    } else {
      const stored = await AsyncStorage.getItem(`@meals_${user.id}`);
      if (stored) {
        set({ meals: JSON.parse(stored) });
      } else {
        set({ meals: [] });
      }
    }
  },

  addMeal: async (mealData) => {
    const user = get().user;
    if (!user) return;

    const newMeal: Meal = {
      id: Math.random().toString(36).substring(7),
      user_id: user.id,
      created_at: new Date().toISOString(),
      ...mealData,
    };

    const newMeals = [newMeal, ...get().meals];
    set({ meals: newMeals });

    if (isSupabaseConfigured && supabase) {
      const { id, ...supabaseMeal } = newMeal; // Let supabase generate UUID
      await supabase.from('meals').insert({ user_id: user.id, ...supabaseMeal });
      // Re-fetch to get actual UUID
      await get().fetchMeals();
    } else {
      await AsyncStorage.setItem(`@meals_${user.id}`, JSON.stringify(newMeals));
    }

    // Recalculate streak whenever a meal is added
    await get().checkAndUpdateStreak();
  },

  editMeal: async (id, updated) => {
    const user = get().user;
    if (!user) return;

    const updatedMeals = get().meals.map((m) => (m.id === id ? { ...m, ...updated } : m));
    set({ meals: updatedMeals });

    if (isSupabaseConfigured && supabase) {
      await supabase.from('meals').update(updated).eq('id', id);
    } else {
      await AsyncStorage.setItem(`@meals_${user.id}`, JSON.stringify(updatedMeals));
    }
  },

  deleteMeal: async (id) => {
    const user = get().user;
    if (!user) return;

    const updatedMeals = get().meals.filter((m) => m.id !== id);
    set({ meals: updatedMeals });

    if (isSupabaseConfigured && supabase) {
      await supabase.from('meals').delete().eq('id', id);
    } else {
      await AsyncStorage.setItem(`@meals_${user.id}`, JSON.stringify(updatedMeals));
    }

    await get().checkAndUpdateStreak();
  },

  fetchStreak: async () => {
    const user = get().user;
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak, last_logged_date')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        set({ streak: data });
      }
    } else {
      const stored = await AsyncStorage.getItem(`@streak_${user.id}`);
      if (stored) {
        set({ streak: JSON.parse(stored) });
      } else {
        set({ streak: DEFAULT_STREAK });
      }
    }
  },

  checkAndUpdateStreak: async () => {
    const user = get().user;
    if (!user) return;

    const meals = get().meals;
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Filter meals logged today
    const loggedToday = meals.some((m) => m.created_at.split('T')[0] === todayStr);
    
    if (!loggedToday) return; // Only increment when user logs a food today

    const currentStreakObj = get().streak;
    const lastLoggedDate = currentStreakObj.last_logged_date;

    if (lastLoggedDate === todayStr) {
      return; // Already updated today
    }

    let newCurrent = 1;
    let newLongest = currentStreakObj.longest_streak;

    if (lastLoggedDate) {
      const lastDate = new Date(lastLoggedDate);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged yesterday, increment streak
        newCurrent = currentStreakObj.current_streak + 1;
      } else if (diffDays > 1) {
        // Broken streak
        newCurrent = 1;
      } else {
        // Logged today, already caught above
        newCurrent = currentStreakObj.current_streak;
      }
    }

    if (newCurrent > newLongest) {
      newLongest = newCurrent;
    }

    const updatedStreak: Streak = {
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_logged_date: todayStr,
    };

    set({ streak: updatedStreak });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('streaks')
        .upsert({ user_id: user.id, ...updatedStreak, updated_at: new Date().toISOString() });
    } else {
      await AsyncStorage.setItem(`@streak_${user.id}`, JSON.stringify(updatedStreak));
    }
  },
}));
