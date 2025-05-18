// todo.service.js

const STORAGE_KEY = 'todos';

// load todos FROM local storage
function loadTodos() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// save todos TO local storage
function saveTodos(todos) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export const TodoService = {
  getTodos() {
    return loadTodos();
  },

  addTodo(title, habit) {
    const todos = loadTodos();
    todos.push({ title, habit });
    saveTodos(todos);
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
