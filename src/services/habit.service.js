// habit.service.js
import { supabase } from '@/lib/supabaseClient';

const HABITS_STORAGE_KEY = 'habits_cache';
const HABIT_COMPLETIONS_STORAGE_KEY = 'habit_completions_cache';
const HABITS_WITH_COUNTS_STORAGE_KEY = 'habits_with_counts_cache';
const CACHE_EXPIRY_KEY = 'cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache management functions
function isCacheValid() {
  if (typeof window === 'undefined') return false;
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry);
}

function setCacheExpiry() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
}

function clearCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HABITS_STORAGE_KEY);
  localStorage.removeItem(HABIT_COMPLETIONS_STORAGE_KEY);
  localStorage.removeItem(HABITS_WITH_COUNTS_STORAGE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
}

// Load habits from localStorage
function loadHabitsFromCache() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save habits to localStorage
function saveHabitsToCache(habits) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  setCacheExpiry();
}

// Load habit completions from localStorage
function loadHabitCompletionsFromCache() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABIT_COMPLETIONS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save habit completions to localStorage
function saveHabitCompletionsToCache(completions) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABIT_COMPLETIONS_STORAGE_KEY, JSON.stringify(completions));
  setCacheExpiry();
}

// Load habits with counts from localStorage
function loadHabitsWithCountsFromCache() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_WITH_COUNTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save habits with counts to localStorage
function saveHabitsWithCountsToCache(habits) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABITS_WITH_COUNTS_STORAGE_KEY, JSON.stringify(habits));
  setCacheExpiry();
}

// Fetch habits from Supabase
async function fetchHabitsFromSupabase() {
  try {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*');
    
    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    const habitObjects = habits.map(habit => ({
      id: habit.id,
      title: habit.title,
      color: habit.color,
    }));

    console.log('Habits fetched from Supabase:', habitObjects);
    saveHabitsToCache(habitObjects);
    return habitObjects;
  } catch (error) {
    console.error('Error in fetchHabitsFromSupabase:', error);
    return [];
  }
}

// Fetch habit completions from Supabase
async function fetchHabitCompletionsFromSupabase() {
  try {
    const { data: habitCompletion, error } = await supabase
      .from('habit_completion')
      .select('*');
    
    if (error) {
      console.error('Error fetching habit completions:', error);
      return [];
    }

    const habitCompletionObjects = habitCompletion.map(completion => ({
      habitId: completion.habit_id,
      timestamp: completion.completed_at
    }));

    console.log('Habit completions fetched from Supabase:', habitCompletionObjects);
    saveHabitCompletionsToCache(habitCompletionObjects);
    return habitCompletionObjects;
  } catch (error) {
    console.error('Error in fetchHabitCompletionsFromSupabase:', error);
    return [];
  }
}

// Fetch habits with weekly completion counts from Supabase
async function fetchHabitsWithCountsFromSupabase() {
  try {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*');
    
    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    // Calculate start and end of current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 7);

    const habitObjects = await Promise.all(habits.map(async (habit) => {
      // Get completion count for this week
      const { data: completions, error: completionError } = await supabase
        .from('habit_completion')
        .select('id')
        .eq('habit_id', habit.id)
        .gte('completed_at', startOfWeek.toISOString())
        .lte('completed_at', endOfWeek.toISOString());

      if (completionError) {
        console.error('Error fetching completions for habit', habit.id, ':', completionError);
        return {
          id: habit.id,
          title: habit.title,
          icon_name: habit.icon_name,
          color: habit.color,
          count: 0,
          goal: habit.weekly_goal,
          description: habit.description,
        };
      }

      const completionCount = completions ? completions.length : 0;
      return {
        id: habit.id,
        title: habit.title,
        icon_name: habit.icon_name,
        color: habit.color,
        count: completionCount,
        goal: habit.weekly_goal,
        description: habit.description,
      };
    }));

    console.log('Habits with counts fetched from Supabase:', habitObjects);
    saveHabitsWithCountsToCache(habitObjects);
    return habitObjects;
  } catch (error) {
    console.error('Error in fetchHabitsWithCountsFromSupabase:', error);
    return [];
  }
}

// Add a new habit completion
async function addHabitCompletion(habitId) {
  try {
    const { data, error } = await supabase
      .from('habit_completion')
      .insert([{ habit_id: habitId, completed_at: new Date() }])
      .select();

    if (error) {
      console.error('Error adding habit completion:', error);
      return false;
    }

    // Update local cache
    const completions = loadHabitCompletionsFromCache();
    const newCompletion = {
      habitId: habitId,
      timestamp: new Date().toISOString()
    };
    completions.push(newCompletion);
    saveHabitCompletionsToCache(completions);

    // Clear habits with counts cache since completion count changed
    localStorage.removeItem(HABITS_WITH_COUNTS_STORAGE_KEY);

    console.log('Habit completion added:', data);
    return true;
  } catch (error) {
    console.error('Error in addHabitCompletion:', error);
    return false;
  }
}

// Add a new habit
async function addHabit(title, color) {
  try {
    const { data, error } = await supabase
      .from('habits')
      .insert([{ title, color }])
      .select();

    if (error) {
      console.error('Error adding habit:', error);
      return null;
    }

    // Update local cache
    const habits = loadHabitsFromCache();
    const newHabit = {
      id: data[0].id,
      title: data[0].title,
      color: data[0].color
    };
    habits.push(newHabit);
    saveHabitsToCache(habits);

    // Clear habits with counts cache since habits changed
    localStorage.removeItem(HABITS_WITH_COUNTS_STORAGE_KEY);

    console.log('Habit added:', data);
    return newHabit;
  } catch (error) {
    console.error('Error in addHabit:', error);
    return null;
  }
}

// Delete a habit
async function deleteHabit(habitId) {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }

    // Clear all caches since habits changed
    clearCache();

    console.log('Habit deleted:', habitId);
    return true;
  } catch (error) {
    console.error('Error in deleteHabit:', error);
    return false;
  }
}

export const HabitService = {
  // Get habits with cache-first strategy
  async getHabits() {
    // Check if cache is valid and return cached data
    if (isCacheValid()) {
      const cachedHabits = loadHabitsFromCache();
      if (cachedHabits.length > 0) {
        console.log('Returning cached habits:', cachedHabits);
        return cachedHabits;
      }
    }

    // Cache is invalid or empty, fetch from Supabase
    console.log('Cache invalid or empty, fetching habits from Supabase');
    return await fetchHabitsFromSupabase();
  },

  // Get habit completions with cache-first strategy
  async getHabitCompletions() {
    // Check if cache is valid and return cached data
    if (isCacheValid()) {
      const cachedCompletions = loadHabitCompletionsFromCache();
      if (cachedCompletions.length > 0) {
        console.log('Returning cached habit completions:', cachedCompletions);
        return cachedCompletions;
      }
    }

    // Cache is invalid or empty, fetch from Supabase
    console.log('Cache invalid or empty, fetching habit completions from Supabase');
    return await fetchHabitCompletionsFromSupabase();
  },

  // Get habits with weekly completion counts (cache-first strategy)
  async getHabitsWithCounts() {
    // Check if cache is valid and return cached data
    if (isCacheValid()) {
      const cachedHabits = loadHabitsWithCountsFromCache();
      if (cachedHabits.length > 0) {
        console.log('Returning cached habits with counts:', cachedHabits);
        return cachedHabits;
      }
    }

    // Cache is invalid or empty, fetch from Supabase
    console.log('Cache invalid or empty, fetching habits with counts from Supabase');
    return await fetchHabitsWithCountsFromSupabase();
  },

  // Force refresh from Supabase (bypasses cache)
  async refreshHabits() {
    console.log('Force refreshing habits from Supabase');
    return await fetchHabitsFromSupabase();
  },

  async refreshHabitCompletions() {
    console.log('Force refreshing habit completions from Supabase');
    return await fetchHabitCompletionsFromSupabase();
  },

  async refreshHabitsWithCounts() {
    console.log('Force refreshing habits with counts from Supabase');
    return await fetchHabitsWithCountsFromSupabase();
  },

  // Add new habit completion
  async addHabitCompletion(habitId) {
    return await addHabitCompletion(habitId);
  },

  // Add new habit
  async addHabit(title, color) {
    return await addHabit(title, color);
  },

  // Delete habit
  async deleteHabit(habitId) {
    return await deleteHabit(habitId);
  },

  // Clear all cache
  clearCache() {
    clearCache();
  },

  // Check if cache is valid
  isCacheValid() {
    return isCacheValid();
  }
};
