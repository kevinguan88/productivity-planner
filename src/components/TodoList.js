'use client';

import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { getTodos, addTodo } from '@/actions/todos'
import Todo from '@/app/todo/page';

export default function TodoList({ initialTodos = [] }) {
  const [todos, setTodos] = useState(initialTodos);

  // Update todos when initialTodos prop changes (after server revalidation)
  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const refreshTodos = async () => {
    const todosData = await getTodos();
    setTodos(todosData);
  };

  const addRandomTask = async () => {
    const randomTitles = ['Buy Groceries', 'Walk the Dog', 'Read a Book', 'Call Mom', 'Clean Room'];
    const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];

    const newTodo = await addTodo(randomTitle);
    if (newTodo) {
      setTodos(prev => [...prev, newTodo]);
    }
  };

  return (
    <div>
      <div>
        {todos.map((item) => (
          <div className="mb-4" key={item.id}>
            <TodoItem 
              id={item.id}
              text={item.title} 
              habit={item.habitTitle} 
              refreshTodos={refreshTodos} 
              color={item.habitColor}
              icon_name={item.habitIcon}
            />
          </div>
        ))}
      </div>
      <button
        onClick={addRandomTask}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
      >
        Add Task
      </button>
    </div>
  );
}
