'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Fetch habits from Supabase
export async function getHabits() {
  try {
    const supabase = await createClient()
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching habits:', error)
      return []
    }

    return habits || []
  } catch (error) {
    console.error('Error in getHabits:', error)
    return []
  }
}

// Fetch habit completions from Supabase
export async function getHabitCompletions() {
  try {
    const supabase = await createClient()
    const { data: completions, error } = await supabase
      .from('habit_completion')
      .select('*')
      .order('completed_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching habit completions:', error)
      return []
    }

    const habitCompletionObjects = completions.map(completion => ({
      habitId: completion.habit_id,
      timestamp: completion.completed_at
    }));

    return habitCompletionObjects || []
  } catch (error) {
    console.error('Error in getHabitCompletions:', error)
    return []
  }
}

// Fetch habits with weekly completion counts
export async function getHabitsWithCounts() {
  try {
    const supabase = await createClient()
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching habits:', error)
      return []
    }

    // Calculate start and end of current week
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const habitsWithCounts = await Promise.all(habits.map(async (habit) => {
      // Get completion count for this week
      const { data: completions, error: completionError } = await supabase
        .from('habit_completion')
        .select('id')
        .eq('habit_id', habit.id)
        .gte('completed_at', startOfWeek.toISOString())
        .lte('completed_at', endOfWeek.toISOString())

      if (completionError) {
        console.error('Error fetching completions for habit', habit.id, ':', completionError)
        return {
          id: habit.id,
          title: habit.title,
          icon_name: habit.icon_name || '',
          color: habit.color,
          count: 0,
          goal: habit.weekly_goal || 7,
          description: habit.description || '',
        }
      }

      const completionCount = completions ? completions.length : 0
      return {
        id: habit.id,
        title: habit.title,
        icon_name: habit.icon_name || '',
        color: habit.color,
        count: completionCount,
        goal: habit.weekly_goal || 7,
        description: habit.description || '',
      }
    }))

    return habitsWithCounts
  } catch (error) {
    console.error('Error in getHabitsWithCounts:', error)
    return []
  }
}

// Add a new habit
export async function addHabit(title, color, iconName = '', description = '', weeklyGoal = 7) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('habits')
      .insert([{ 
        title, 
        color, 
        icon_name: iconName, 
        description, 
        weekly_goal: weeklyGoal 
      }])
      .select()

    if (error) {
      console.error('Error adding habit:', error)
      return null
    }

    // Revalidate the habit tracker page to show new habit
    revalidatePath('/habit_tracker')
    revalidatePath('/calendar')
    
    return data[0]
  } catch (error) {
    console.error('Error in addHabit:', error)
    return null
  }
}

// Delete a habit
export async function deleteHabit(habitId) {
  try {
    const supabase = await createClient()
    
    // First delete all habit completions
    const { error: completionError } = await supabase
      .from('habit_completion')
      .delete()
      .eq('habit_id', habitId)

    if (completionError) {
      console.error('Error deleting habit completions:', completionError)
    }

    // Then delete the habit
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)

    if (error) {
      console.error('Error deleting habit:', error)
      return false
    }

    // Revalidate pages
    revalidatePath('/habit_tracker')
    revalidatePath('/calendar')
    
    return true
  } catch (error) {
    console.error('Error in deleteHabit:', error)
    return false
  }
}

// Add a habit completion
export async function addHabitCompletion(habitId) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('habit_completion')
      .insert([{ habit_id: habitId, completed_at: new Date() }])
      .select()

    if (error) {
      console.error('Error adding habit completion:', error)
      return false
    }

    // Revalidate pages to update counts
    revalidatePath('/habit_tracker')
    revalidatePath('/calendar')
    
    return true
  } catch (error) {
    console.error('Error in addHabitCompletion:', error)
    return false
  }
}

// Remove the most recent habit completion
export async function removeHabitCompletion(habitId) {
  try {
    const supabase = await createClient()
    
    // Get the most recent completion
    const { data: recentCompletion, error: fetchError } = await supabase
      .from('habit_completion')
      .select('id')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching recent completion:', fetchError)
      return false
    }

    if (!recentCompletion || recentCompletion.length === 0) {
      return false // No completion to remove
    }

    // Delete the most recent completion
    const { error } = await supabase
      .from('habit_completion')
      .delete()
      .eq('id', recentCompletion[0].id)

    if (error) {
      console.error('Error removing habit completion:', error)
      return false
    }

    // Revalidate pages to update counts
    revalidatePath('/habit_tracker')
    revalidatePath('/calendar')
    
    return true
  } catch (error) {
    console.error('Error in removeHabitCompletion:', error)
    return false
  }
}
