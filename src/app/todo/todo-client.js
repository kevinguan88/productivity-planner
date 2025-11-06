'use client'

import { useEffect, useState } from 'react'
import { getTodos } from '@/actions/todos'
import TodoItem from './todo-item'
import AddTodoModal from './add-todo-modal'
import { Plus } from 'lucide-react'

export default function TodoClient({ initialTodos = [] }) {
  const [todos, setTodos] = useState(initialTodos)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  const refreshTodos = async () => {
    const todosData = await getTodos()
    setTodos(todosData)
  }

  const handleAddTodo = async (newTodo) => {
    // Refresh todos to get the complete data with habit information
    await refreshTodos()
  }

  return (
    <div>
      <div>
        {todos.map((item) => (
          <div className="mb-4" key={item.id}>
            <TodoItem 
              id={item.id}
              text={item.title}
              habit={item.habitTitle}
              color={item.habitColor}
              icon_name={item.habitIcon}
              refreshTodos={refreshTodos}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#4b87ff] hover:bg-[#3a76ee] text-white font-bold py-2 px-4 border border-blue-700 rounded flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Task
      </button>

      {/* Add Todo Modal */}
      <AddTodoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTodo={handleAddTodo}
      />
    </div>
  )
}
