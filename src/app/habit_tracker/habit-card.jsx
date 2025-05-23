"use client"

import { Plus, Minus, MoreVertical } from "lucide-react"
import { useState } from "react"
import { createClient } from '@supabase/supabase-js'
import * as Lucide from 'lucide-react'

/**
 * Habit Card Component
 * @param {Object} props
 * @param {string} props.name - Habit name
 * @param {string} props.icon_name - Emoji or icon for the habit
 * @param {string} props.color - Color for the progress bar and label
 * @param {number} props.initialCount - Initial count value
 * @param {number} props.goal - Goal count value
 * @param {string} props.description - Habit description
 */
export default function HabitCard({ id, name, icon_name, color, initialCount, goal, description }) {
  const [count, setCount] = useState(initialCount)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_SUPABASE_KEY);


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
  console.log("icon name: ", icon_name)

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="absolute right-4 top-4">
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4">
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
            aria-label={`Increment ${name}`}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={decrementCount}
            aria-label={`Decrement ${name}`}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 ml-4">
          <div className="text-white px-3 py-2 rounded-md inline-block mb-2" style={{ backgroundColor: color }}>
            <span className="flex items-center">
              <Icon className="w-4 h-4 mx-1" />
              {name}
            </span>
          </div>
          <p className="text-gray-700">{description}</p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold">
            {count}/{goal}
          </p>
          <p className="text-[#45bb5b]">Weekly Goal: {goal}</p>
        </div>
      </div>
    </div>
  )
}
