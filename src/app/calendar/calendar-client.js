'use client'

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import MonthCalendar from "@/components/month-calendar"
import { addMonths, format } from "date-fns"
import { getHabits, getHabitCompletions } from '@/actions/habits'

export default function CalendarClient({ initialHabits = [], initialHabitCompletions = [] }) {
  const [activeTab, setActiveTab] = useState("habits")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habitCompletions, setHabitCompletions] = useState(initialHabitCompletions)
  const [habits, setHabits] = useState(initialHabits)
  const [refreshing, setRefreshing] = useState(false)
  const lastRefreshRef = useRef(0)
  const REFRESH_COOLDOWN = 2000 // 2 seconds minimum between refreshes

  useEffect(() => {
    setHabits(initialHabits)
    setHabitCompletions(initialHabitCompletions)
  }, [initialHabits, initialHabitCompletions])

  useEffect(() => {   
    const loadData = async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true)
      
      try {
        // Always refresh from server to get latest data
        const [habitsData, completionsData] = await Promise.all([
          getHabits(),
          getHabitCompletions()
        ])
        
        setHabits(habitsData)
        setHabitCompletions(completionsData)
        lastRefreshRef.current = Date.now()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        if (showRefreshing) setRefreshing(false)
      }
    }

    // Background refresh when page becomes visible (seamless)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
        if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
          loadData(false) // Background refresh, no loading state
        }
      }
    }

    // Background refresh when window gains focus (seamless)
    const handleFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
      if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
        loadData(false) // Background refresh, no loading state
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      return direction === "prev" ? addMonths(prevDate, -1) : addMonths(prevDate, 1)
    })
  }

  // Seamless refresh function
  const refreshData = async () => {
    const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
    if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
      return // Skip if refreshed too recently
    }

    setRefreshing(true)
    try {
      const [habitsData, completionsData] = await Promise.all([
        getHabits(),
        getHabitCompletions()
      ])
      
      setHabits(habitsData)
      setHabitCompletions(completionsData)
      lastRefreshRef.current = Date.now()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
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

        {/* Filter dropdown and refresh button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2">
              All Habits
              <ChevronDown size={16} />
            </button>
          </div>
          
          {/* Seamless refresh button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className={cn(
              "bg-white text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              refreshing 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-gray-100 hover:scale-105"
            )}
            title={refreshing ? "Refreshing..." : "Refresh data from server"}
          >
            <span className={cn("transition-transform duration-200", refreshing && "animate-spin")}>
              
            </span>
            {refreshing ? " Refreshing..." : " Refresh"}
          </button>
        </div>
      </header>

      {/* Subtle refresh indicator */}
      {refreshing && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-1">
          <p className="text-blue-600 text-sm text-center">
            Updating data...
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className="w-full overflow-x-auto">
        <MonthCalendar date={currentDate} habits={habits} habitCompletions={habitCompletions} />
      </div>
    </div>
  )
}
