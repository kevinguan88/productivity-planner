'use client'

import HabitCard from "./habit-card"
import { useState, useEffect, useRef, useTransition } from "react"
import { Plus } from "lucide-react"
import AddHabitModal from "./add-habit-modal"
import { addHabit, deleteHabit, getHabitsWithCounts } from '@/actions/habits'
import { cn } from "@/lib/utils"

export default function HabitTrackerClient({ initialHabits }) {
  const [habits, setHabits] = useState(initialHabits)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const lastRefreshRef = useRef(0)
  const REFRESH_COOLDOWN = 2000 // 2 seconds minimum between refreshes

  // Update habits when initialHabits prop changes (after server revalidation)
  useEffect(() => {
    setHabits(initialHabits)
  }, [initialHabits])

  useEffect(() => {   
    const loadHabits = async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true)
      
      try {
        // Always refresh from server to get latest data
        const habitsData = await getHabitsWithCounts()
        setHabits(habitsData)
        lastRefreshRef.current = Date.now()
      } catch (error) {
        console.error('Error loading habits:', error)
      } finally {
        if (showRefreshing) setRefreshing(false)
      }
    }

    // Background refresh when page becomes visible (seamless)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
        if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
          loadHabits(false) // Background refresh, no loading state
        }
      }
    }

    // Background refresh when window gains focus (seamless)
    const handleFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
      if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
        loadHabits(false) // Background refresh, no loading state
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

  const handleAddHabit = async (newHabit) => {
    startTransition(async () => {
      try {
        const addedHabit = await addHabit(
          newHabit.name, 
          newHabit.color, 
          newHabit.iconName, 
          newHabit.description, 
          newHabit.goal
        )
        
        if (addedHabit) {
          // Optimistic update - add to UI immediately
          const newHabitWithCount = {
            ...addedHabit,
            icon_name: newHabit.iconName || '',
            count: 0,
            goal: newHabit.goal || 7,
            description: newHabit.description || ''
          }
          setHabits(prev => [...prev, newHabitWithCount])
        }
      } catch (error) {
        console.error('Error adding habit:', error)
      }
    })
  }

  const handleDeleteHabit = async (habitId) => {
    startTransition(async () => {
      try {
        // Optimistic update - remove from UI immediately
        setHabits(prev => prev.filter(habit => habit.id !== habitId))
        
        const success = await deleteHabit(habitId)
        if (!success) {
          // If deletion failed, refresh to restore correct state
          const habitsData = await getHabitsWithCounts()
          setHabits(habitsData)
        }
      } catch (error) {
        console.error('Error deleting habit:', error)
        // Refresh to restore correct state
        const habitsData = await getHabitsWithCounts()
        setHabits(habitsData)
      }
    })
  }

  const refreshHabits = async () => {
    const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
    if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
      return // Skip if refreshed too recently
    }

    setRefreshing(true)
    try {
      // Force refresh from server
      const habitsData = await getHabitsWithCounts()
      setHabits(habitsData)
      lastRefreshRef.current = Date.now()
    } catch (error) {
      console.error('Error refreshing habits:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div>
      {/* Main Content */}
      <main className="flex-1 bg-white p-4 flex flex-col items-center space-y-4">
        <div className="w-[60%] bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4 min-w-[400px]">
          {/* Header with refresh button */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Habit Tracker</h1>
            <button
              onClick={refreshHabits}
              disabled={refreshing || isPending}
              className={cn(
                "bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200",
                (refreshing || isPending)
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-gray-200 hover:scale-105"
              )}
              title={refreshing ? "Refreshing..." : "Refresh habits from server"}
            >
              <span className={cn("transition-transform duration-200", refreshing && "animate-spin")}>
                
              </span>
              {refreshing ? " Refreshing..." : " Refresh"}
            </button>
          </div>

          {/* Subtle refresh indicator */}
          {(refreshing || isPending) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-blue-600 text-sm text-center">
                {isPending ? "Updating..." : "Updating habits..."}
              </p>
            </div>
          )}

          {/* Habit Cards */}
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              title={habit.title}
              icon_name={habit.icon_name}
              color={habit.color}
              initialCount={habit.count}
              goal={habit.goal}
              description={habit.description}
              onDelete={handleDeleteHabit}
            />
          ))}

          {/* Add New Habit Button */}
          <button
            className="bg-[#4b87ff] text-white py-6 rounded-lg flex items-center justify-center mt-auto hover:bg-[#3a76ee] transition-colors disabled:opacity-50"
            onClick={() => setIsModalOpen(true)}
            disabled={isPending}
          >
            <Plus className="w-6 h-6 mr-2" />
            <span className="text-xl">Add New Habit</span>
          </button>

          {habits.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No habits yet. Add your first habit to get started!</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddHabit={handleAddHabit}
      />
    </div>
  )
}
