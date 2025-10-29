import { getHabitsWithCounts } from '@/actions/habits'
import HabitTrackerClient from './habit-tracker-client'

export default async function HabitTrackerPage() {
  // Fetch habits with counts server-side
  const initialHabits = await getHabitsWithCounts()
  
  return <HabitTrackerClient initialHabits={initialHabits} />
}