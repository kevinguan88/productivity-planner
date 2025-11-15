'use client'

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import MonthCalendar from "@/components/month-calendar"
import { getHabits, getHabitCompletions } from '@/actions/habits'

export function HabitCalendarControls({ refreshing, onRefresh }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2">
          All Habits
          <ChevronDown size={16} />
        </button>
      </div>
      
      {/* Seamless refresh button */}
      <button
        onClick={onRefresh}
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
  )
}

export function HabitCalendarContent({ currentDate, habits, habitCompletions }) {
  return (
    <div className="w-full overflow-x-auto">
      <MonthCalendar date={currentDate} habits={habits} habitCompletions={habitCompletions} />
    </div>
  )
}

export function useHabitCalendarData({ initialHabits = [], initialHabitCompletions = [], refreshing, setRefreshing, lastRefreshRef, REFRESH_COOLDOWN }) {
  const [habitCompletions, setHabitCompletions] = useState(initialHabitCompletions)
  const [habits, setHabits] = useState(initialHabits)

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
  }, [setRefreshing, lastRefreshRef, REFRESH_COOLDOWN])

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

  return {
    habits,
    habitCompletions,
    refreshData
  }
}

