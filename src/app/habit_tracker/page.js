'use client'

import HabitCard from "./habit-card";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import AddHabitModal from "@/components/add-habit-modal"



export default function HabitTracker() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_SUPABASE_KEY);

    useEffect(() => {   
        const fetchHabits = async () => {
            let { data: habits, error } = await supabase
                .from('habits')
                .select('*')
            if (error) {
                console.error(error)
            } else {
                const habitObjects = await Promise.all(habits.map(async (habit) => {
                    const { data: completions, error: completionError } = await supabase
                      .from('habit_completion')
                      .select('id')
                      .eq('habit_id', habit.id)
              
                    if (completionError) {
                      console.error(completionError)
                    } else {
                      const completionCount = completions.length
                      return {
                        id: habit.id,
                        name: habit.name,
                        icon_name: habit.icon_name,
                        color: habit.color,
                        count: completionCount,
                        goal: habit.weekly_goal,
                        description: habit.description,
                        // Add any other properties you want to include in the habit object
                      }
                    }
                  }))              
                setHabits(habitObjects)
            }
        }
        fetchHabits()
    }, [])

    const [habits, setHabits] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)

    // const handleAddHabit = (newHabit) => {
    //   setHabits([...habits, newHabit])
    // }

    return (
    <div>
        {/* Main Content */}
      <main className="flex-1 bg-white p-4 flex flex-col items-center space-y-4 ">
        <div className="w-[60%] bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4 min-w-[400px]">
          {/* Habit Cards */}
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              icon_name={habit.icon_name}
              color={habit.color}
              initialCount={habit.count}
              goal={habit.goal}
              description={habit.description}
            />
          ))}

          {/* Add New Habit Button */}
          <button
            className="bg-[#4b87ff] text-white py-6 rounded-lg flex items-center justify-center mt-auto hover:bg-[#3a76ee] transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            <span className="text-xl">Add New Habit</span>
          </button>
        </div>
      </main>
      {/* Add Habit Modal */}
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
    )
}