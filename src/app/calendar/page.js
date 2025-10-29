import CalendarClient from './calendar-client'
import { getHabits, getHabitCompletions } from '@/actions/habits'

export default async function HabitTracker() {
  const [habits, habitCompletions] = await Promise.all([
    getHabits(),
    getHabitCompletions()
  ])

  return <CalendarClient initialHabits={habits} initialHabitCompletions={habitCompletions} />
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
