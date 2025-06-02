'use client';

import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { TodoService } from '../services/todo.service';
import Todo from '@/app/todo/page';

export default function TodoList() {
  const [todos, setTodos] = useState([]);

  // TODO: setTodos renders late, figure that out
  const refreshTodos = async () => {
    await TodoService.fetchTodos();
    setTodos(TodoService.getTodos());
  };

  useEffect(() => {
    refreshTodos();
  }, []);

  const addRandomTask = () => {
    const randomTitles = ['Buy Groceries', 'Walk the Dog', 'Read a Book', 'Call Mom', 'Clean Room'];
    const randomHabits = ['Health', 'Family', 'Productivity', 'Finance', 'Hobby'];

    const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];
    const randomHabit = randomHabits[Math.floor(Math.random() * randomHabits.length)];

    TodoService.addTodo(randomTitle, randomHabit);
    refreshTodos();
  };

  return (
    <div>
      <div>
        {todos.map((item, index) => (
          <TodoItem 
            key={index} 
            text={item.title} 
            habit={item.habitTitle} 
            index={item.index} 
            refreshTodos={refreshTodos} 
          />
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
