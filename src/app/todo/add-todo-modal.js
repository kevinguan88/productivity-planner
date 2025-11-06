"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { addTodo, getHabitsForTodos } from '@/actions/todos'
import * as Lucide from 'lucide-react'

export default function AddTodoModal({ isOpen, onClose, onAddTodo }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedHabitId, setSelectedHabitId] = useState("")
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch habits when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchHabits()
    }
  }, [isOpen])

  const fetchHabits = async () => {
    try {
      const habitsData = await getHabitsForTodos()
      setHabits(habitsData || [])
    } catch (error) {
      console.error('Error fetching habits:', error)
      setHabits([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      alert("Please enter a task title")
      return
    }

    setLoading(true)
    try {
      const habitId = selectedHabitId || null
      const desc = description.trim() || null
      const newTodo = await addTodo(title.trim(), habitId, desc)

      console.log('newTodo', newTodo)
      
      if (newTodo) {
        resetForm()
        onClose()
        if (onAddTodo) {
          onAddTodo(newTodo)
        }
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert("Failed to add todo. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedHabitId("")
  }

  if (!isOpen) return null

  const selectedHabit = habits.find(h => h.id === selectedHabitId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Todo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="todo-title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title*
            </label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="todo-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows="3"
            />
          </div>

          <div>
            <label htmlFor="todo-habit" className="block text-sm font-medium text-gray-700 mb-1">
              Link to Habit (Optional)
            </label>
            <select
              id="todo-habit"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No habit linked</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>

            {selectedHabit && (
              <div className="flex items-center space-x-3 mt-3 p-2 bg-gray-50 rounded-md">
                {(() => {
                  const IconComponent = Lucide[selectedHabit.icon_name] || Lucide.Circle
                  return (
                    <>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: selectedHabit.color || '#4b87ff' }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {selectedHabit.title}
                      </span>
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#4b87ff] text-white rounded-md hover:bg-[#3a76ee] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
