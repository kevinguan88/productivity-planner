'use client'

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { addMonths, format } from "date-fns"
import { HabitCalendarControls, HabitCalendarContent, useHabitCalendarData } from "./habit-calendar-view"

export default function CalendarClient({ initialHabits = [], initialHabitCompletions = [] }) {
  const [activeTab, setActiveTab] = useState("habits")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const lastRefreshRef = useRef(0)
  const REFRESH_COOLDOWN = 2000 // 2 seconds minimum between refreshes

  const habitCalendarData = useHabitCalendarData({
    initialHabits,
    initialHabitCompletions,
    refreshing,
    setRefreshing,
    lastRefreshRef,
    REFRESH_COOLDOWN
  })

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
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#585757] rounded-full p-1 flex">
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

        {/* View-specific controls - rendered by view components */}
        {activeTab === "habits" && (
          <HabitCalendarControls 
            refreshing={refreshing} 
            onRefresh={habitCalendarData.refreshData} 
          />
        )}
        {activeTab === "tasks" && (
          <div className="flex items-center gap-2">
            {/* Placeholder for tasks view controls */}
          </div>
        )}
      </header>

      {/* Subtle refresh indicator */}
      {refreshing && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-1">
          <p className="text-blue-600 text-sm text-center">
            Updating data...
          </p>
        </div>
      )}

      {/* View Content */}
      <div className="w-full">
        {activeTab === "habits" && (
          <HabitCalendarContent 
            currentDate={currentDate} 
            habits={habitCalendarData.habits} 
            habitCompletions={habitCalendarData.habitCompletions} 
          />
        )}
        {activeTab === "tasks" && (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500 text-lg">Tasks view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
