// todo.service.js
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'todos';

// gets habit object for todos
async function supabaseFetchHabit(habitId) {
  if (!habitId) return '';
  let { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
  if (error) {
    console.error(error)
  } else {
    //console.log('habit fetched', habits)
    return habits[0]
  }
}

// fetches todos and gets their habits from supabase and saves them to local storage
async function supabaseFetchTodos() {
 let { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .is('completed_at', null)
  if (error) {
    console.error(error)
  } else {
    console.log('tasks fetched', tasks)
    // convert tasks to todo objects and assigns habits to them
    const todoObjects = await Promise.all(tasks.map(async (task) => {
      const habit = await supabaseFetchHabit(task.habit_id);
      const habitTitle = habit ? habit.title : '';
      console.log('habitTitle', habitTitle)
      return {
        index: task.id,
        title: task.title,
        habitTitle: habitTitle,
        habitId: task.habit_id
      }
    })) 
    saveTodos(todoObjects)
  }
}

// updates a todo's completion date in supabase
//TODO: error with checking off wrong task and not updating list
async function supabaseCheckOffTodo(index) {
  const { tasks, error } = await supabase
    .from('tasks')
    .update({ completed_at: new Date() })
    .eq('id', index)
    .select()
  if (error) {
    console.error(error)
  }
  else {
    console.log('updating', tasks)
  }
}

// insert todo into supabase
async function supabaseInsertTodo(title, habit) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      { title, habit_id: habit },
    ])
    .select()
  if (error) {
    console.error(error)
  }
  else {
    console.log('inserting', data)
  }
}

// load todos FROM local storage
function loadTodos() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  console.log('loading todos', data)
  return data ? JSON.parse(data) : [];
}

// save todos TO local storage
function saveTodos(todos) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export const TodoService = {
  fetchTodos() {
    supabaseFetchTodos();
  },

  async getHabit(habitId) {
    if (!habitId) return '';
    const habitTitle = await supabaseFetchHabit(habitId);
    return habitTitle;
  },

  getTodos() {
    return loadTodos();
  },

  async checkOffTodo(index) {
    await supabaseCheckOffTodo(index);
    supabaseFetchTodos();
  },

  async addTodo(title, habit) {
    await supabaseInsertTodo(title, habit);
    supabaseFetchTodos();
  },

  updateTodo(index, updatedTodo) {
    const todos = loadTodos();
    if (index >= 0 && index < todos.length) {
      todos[index] = updatedTodo;
      saveTodos(todos);
    }
  },

  deleteTodo(index) {
    const todos = loadTodos();
    if (index >= 0 && index < todos.length) {
      todos.splice(index, 1);
      saveTodos(todos);
    }
  },

  clearAll() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
