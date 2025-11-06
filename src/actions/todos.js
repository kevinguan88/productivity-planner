'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Fetch todos with their associated habits
export async function getTodos() {
  try {
    const supabase = await createClient()
    
    // Fetch incomplete tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .is('completed_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    // Fetch habits for each task
    const todosWithHabits = await Promise.all(tasks.map(async (task) => {
      let habit = null
      if (task.habit_id) {
        const { data: habitData, error: habitError } = await supabase
          .from('habits')
          .select('*')
          .eq('id', task.habit_id)
          .single()
        
        if (!habitError && habitData) {
          habit = habitData
        }
      }

      return {
        id: task.id,
        title: task.title,
        habitId: task.habit_id,
        habitTitle: habit ? habit.title : '',
        habitColor: habit ? habit.color : '',
        habitIcon: habit ? habit.icon_name : '',
        createdAt: task.created_at,
      }
    }))

    return todosWithHabits
  } catch (error) {
    console.error('Error in getTodos:', error)
    return []
  }
}

// Add a new todo
export async function addTodo(title, habitId = null, description = null) {
  try {
    const supabase = await createClient()
    const todoData = { 
      title, 
      habit_id: habitId 
    }
    
    // Only include description if it's provided
    if (description) {
      todoData.description = description
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([todoData])
      .select()

    if (error) {
      console.error('Error adding todo:', error)
      return null
    }

    // Revalidate the todo page
    revalidatePath('/todo')
    
    return data[0]
  } catch (error) {
    console.error('Error in addTodo:', error)
    return null
  }
}

// Mark a todo as completed
export async function completeTodo(todoId) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_at: new Date() })
      .eq('id', todoId)
      .select('id, habit_id, completed_at')
      .single()
      
    if (error) {
      console.error('Error completing todo:', error)
      return false
    }

    const completedTodo = data
    if (completedTodo && completedTodo.habit_id != null) {
      const { error: completionError } = await supabase
        .from('habit_completion')
        .insert([{ habit_id: completedTodo.habit_id, completed_at: new Date() }])

      if (completionError) {
        console.error('Error adding habit completion with task checkoff:', completionError)
        return false
      }
    }
    // Revalidate the todo page
    revalidatePath('/todo')
    revalidatePath('/habit_tracker')
    revalidatePath('/calendar')
    
    return true
  } catch (error) {
    console.error('Error in completeTodo:', error)
    return false
  }
}

// Update a todo
export async function updateTodo(todoId, updates) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', todoId)
      .select()

    if (error) {
      console.error('Error updating todo:', error)
      return null
    }

    // Revalidate the todo page
    revalidatePath('/todo')
    
    return data[0]
  } catch (error) {
    console.error('Error in updateTodo:', error)
    return null
  }
}

// Delete a todo
export async function deleteTodo(todoId) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', todoId)

    if (error) {
      console.error('Error deleting todo:', error)
      return false
    }

    // Revalidate the todo page
    revalidatePath('/todo')
    
    return true
  } catch (error) {
    console.error('Error in deleteTodo:', error)
    return false
  }
}

// Get habits for todo creation
export async function getHabitsForTodos() {
  try {
    const supabase = await createClient()
    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, title, color, icon_name')
      .order('title', { ascending: true })
    
    if (error) {
      console.error('Error fetching habits for todos:', error)
      return []
    }

    return habits || []
  } catch (error) {
    console.error('Error in getHabitsForTodos:', error)
    return []
  }
}
