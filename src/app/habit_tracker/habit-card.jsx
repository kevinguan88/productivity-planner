"use client"

import { Plus, Minus, MoreVertical } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from '@/lib/supabaseClient'
import * as Lucide from 'lucide-react' 

/**
 * Habit Card Component
 * @param {Object} props
 * @param {string} props.title - Habit title
 * @param {string} props.icon_name - Emoji or icon for the habit
 * @param {string} props.color - Color for the progress bar and label
 * @param {number} props.initialCount - Initial count value
 * @param {number} props.goal - Goal count value
 * @param {string} props.description - Habit description
 * @param {Function} props.onDelete - Function to call when deleting the habit
 */
export default function HabitCard({ id, title, icon_name, color, initialCount, goal, description, onDelete }) {
  const [count, setCount] = useState(initialCount)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const Trash2 = Lucide.Trash2

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${title}" habit?`)) {
      onDelete(id)
    }
    setShowDropdown(false)
  }


  const incrementCount = async () => {
    if (count < goal) {
      setCount(count + 1)
      const { data, error } = await supabase
        .from('habit_completion')
        .insert([
          { habit_id: id, completed_at: new Date(), },
        ])
        .select()
        if (error) {
          console.error(error)
        }
        else {
          console.log("inserting", data)
        }

    }
  }

  //check on backend for values below 0
  const decrementCount = async () => {
    if (count > 0) {
      setCount(count - 1)
      const { data, error } = await supabase
        .from('habit_completion')
        .delete()
        .eq('habit_id', id)
        .order('completed_at', { ascending: false })
        .limit(1)

    if (error) {
      console.error(error)
    }
    else {
      console.log("deleting", data)
    }

    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.round((count / goal) * 100);

  const Icon = Lucide[icon_name] || Lucide.Circle;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      {/* Three-dot menu positioned to the right of progress bar */}
      <div className="absolute right-4 top-4" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4 mr-8">
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>

      <div className="flex justify-between items-start">
        <div className="space-y-4">
          {/* Plus/Minus Buttons */}
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={incrementCount}
            aria-label={`Increment ${title}`}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={decrementCount}
            aria-label={`Decrement ${title}`}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 ml-4">
          <div className="text-white px-3 py-2 rounded-md inline-block mb-2" style={{ backgroundColor: color }}>
            <span className="flex items-center">
              <Icon className="w-4 h-4 mx-1" />
              {title}
            </span>
          </div>
          <p className="text-gray-700">{description}</p>
        </div>

        <div className="text-right mr-8">
          <p className="text-3xl font-bold">
            {count}/{goal}
          </p>
          <p className="text-[#45bb5b]">Weekly Goal: {goal}</p>
        </div>
      </div>
    </div>
  )
}
