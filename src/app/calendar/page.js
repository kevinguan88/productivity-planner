"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import MonthCalendar from "@/components/month-calendar"
import { addMonths, format } from "date-fns"
import { createClient } from '@supabase/supabase-js'


export default function HabitTracker() {
  const [activeTab, setActiveTab] = useState("habits")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habitCompletions, setHabitCompletions] = useState([])
  const [habits, setHabits] = useState([])

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_SUPABASE_KEY);
  
      useEffect(() => {   
          const fetchHabitCompletions = async () => {
              let { data: habitCompletion, error } = await supabase
                  .from('habit_completion')
                  .select('*')
              if (error) {
                  console.error(error)
              } else {
                  const habitCompletionObjects = await Promise.all(habitCompletion.map(async (completion) => {
                        return {
                          habitId: completion.habit_id,
                          timestamp: completion.completed_at                       
                        }
                      }
                  ))              
                  console.log(habitCompletionObjects)
                  setHabitCompletions(habitCompletionObjects)
              }
          }

          const fetchHabits = async () => {
            let { data: habits, error } = await supabase
                .from('habits')
                .select('*')
            if (error) {
                console.error(error)
            } else {
                const habitObjects = await Promise.all(habits.map(async (habit) => {
                    return {
                      id: habit.id,
                      title: habit.name,
                      color: "blue"
                      // Add any other properties you want to include in the habit object
                    }
                  }))              
                console.log(habitObjects)
                setHabits(habitObjects)
            }
          }
        fetchHabitCompletions()
        fetchHabits()
      }, [])

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      return direction === "prev" ? addMonths(prevDate, -1) : addMonths(prevDate, 1)
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-calendar p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth("prev")} className="text-white hover:bg-blue-600 p-1 rounded-full">
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-white text-2xl font-bold">{format(currentDate, "MMMM yyyy").toUpperCase()}</h1>

          <button onClick={() => navigateMonth("next")} className="text-white hover:bg-blue-600 p-1 rounded-full">
            <ChevronRight size={24} />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="ml-2 bg-white text-[#4b87ff] px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100"
          >
            Today
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-[#585757] rounded-full p-1 flex">
          <button
            className={cn(
              "px-6 py-2 rounded-full text-white transition-colors",
              activeTab === "habits" ? "bg-[#4b87ff]" : "bg-transparent",
            )}
            onClick={() => setActiveTab("habits")}
          >
            Habits
          </button>
          <button
            className={cn(
              "px-6 py-2 rounded-full text-white transition-colors",
              activeTab === "tasks" ? "bg-[#4b87ff]" : "bg-transparent",
            )}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </button>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2">
            All Habits
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      {/* Calendar */}
      <div className="w-full overflow-x-auto">
        <MonthCalendar date={currentDate} habits={habits} habitCompletions={habitCompletions} />
      </div>
    </div>
  )
}

// Sample habit data
const sampleHabits = [
  {
    id: 1,
    title: "Homework",
    color: "blue",
  },
  {
    id: 2,
    title: "Work Out",
    color: "red",
  },
  {
    id: 3,
    title: "Read",
    color: "green",
  },
  {
    id: 4,
    title: "Meditate",
    color: "purple",
  },
  {
    id: 5,
    title: "Cook",
    color: "orange",
  },
]

// Sample habit completion data
const sampleHabitCompletions = [
  // Homework completions
  { habitId: 1, timestamp: "2025-01-07T10:00:00Z" },
  { habitId: 1, timestamp: "2025-01-07T14:30:00Z" },
  { habitId: 1, timestamp: "2025-01-09T09:15:00Z" },
  { habitId: 1, timestamp: "2025-01-09T16:45:00Z" },
  { habitId: 1, timestamp: "2025-01-15T11:20:00Z" },
  { habitId: 1, timestamp: "2025-01-15T17:00:00Z" },
  { habitId: 1, timestamp: "2025-01-24T08:30:00Z" },
  { habitId: 1, timestamp: "2025-01-24T13:45:00Z" },

  // Work Out completions
  { habitId: 2, timestamp: "2025-01-10T07:00:00Z" },
  { habitId: 2, timestamp: "2025-01-15T06:30:00Z" },
  { habitId: 2, timestamp: "2025-01-15T18:00:00Z" },
  { habitId: 2, timestamp: "2025-01-15T20:15:00Z" },
  { habitId: 2, timestamp: "2025-01-15T21:30:00Z" },

  // Read completions
  { habitId: 3, timestamp: "2025-01-07T22:00:00Z" },
  { habitId: 3, timestamp: "2025-01-07T22:30:00Z" },
  { habitId: 3, timestamp: "2025-01-07T23:00:00Z" },
  { habitId: 3, timestamp: "2025-01-07T23:30:00Z" },
  { habitId: 3, timestamp: "2025-01-07T00:00:00Z" },
  { habitId: 3, timestamp: "2025-01-10T21:00:00Z" },
  { habitId: 3, timestamp: "2025-01-10T21:30:00Z" },
  { habitId: 3, timestamp: "2025-01-10T22:00:00Z" },
  { habitId: 3, timestamp: "2025-01-10T22:30:00Z" },
  { habitId: 3, timestamp: "2025-01-10T23:00:00Z" },

  // Meditate completions
  { habitId: 4, timestamp: "2025-01-07T22:00:00Z" },
  { habitId: 4, timestamp: "2025-01-07T22:30:00Z" },
  { habitId: 4, timestamp: "2025-01-07T23:00:00Z" },
  { habitId: 4, timestamp: "2025-01-07T23:30:00Z" },
  { habitId: 4, timestamp: "2025-01-07T00:00:00Z" },
  { habitId: 4, timestamp: "2025-01-10T21:00:00Z" },
  { habitId: 4, timestamp: "2025-01-10T21:30:00Z" },
  { habitId: 4, timestamp: "2025-01-10T22:00:00Z" },
  { habitId: 4, timestamp: "2025-01-10T22:30:00Z" },

  // Cook completions
  { habitId: 5, timestamp: "2025-01-07T22:00:00Z" },
  { habitId: 5, timestamp: "2025-01-07T22:30:00Z" },
  { habitId: 5, timestamp: "2025-01-07T23:00:00Z" },
  { habitId: 5, timestamp: "2025-01-07T23:30:00Z" },
  { habitId: 5, timestamp: "2025-01-07T00:00:00Z" },
  { habitId: 5, timestamp: "2025-01-10T21:00:00Z" },
  { habitId: 5, timestamp: "2025-01-10T21:30:00Z" },
  { habitId: 5, timestamp: "2025-01-10T22:00:00Z" },
  { habitId: 5, timestamp: "2025-01-10T22:30:00Z" },
]
