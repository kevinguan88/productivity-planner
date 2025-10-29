"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import MonthCalendar from "@/components/month-calendar"
import { addMonths, format } from "date-fns"
import { getHabits, getHabitCompletions } from '@/actions/habits'

export default function HabitTracker() {
  const [activeTab, setActiveTab] = useState("habits")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habitCompletions, setHabitCompletions] = useState([])
  const [habits, setHabits] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const lastRefreshRef = useRef(0)
  const REFRESH_COOLDOWN = 2000 // 2 seconds minimum between refreshes
  
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

    // Initial load - try cache first, then refresh in background
    const initialLoad = async () => {
      try {
        // Try to get cached data first for instant display
        const [cachedHabits, cachedCompletions] = await Promise.all([
          getHabits(),
          getHabitCompletions()
        ])
        
        // Show cached data immediately if available
        if (cachedHabits.length > 0 || cachedCompletions.length > 0) {
          setHabits(cachedHabits)
          setHabitCompletions(cachedCompletions)
        }
        
        // Then refresh in background to get latest data
        loadData(false)
      } catch (error) {
        console.error('Error in initial load:', error)
        // Fallback to direct refresh
        loadData(false)
      }
    }

    initialLoad()

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
