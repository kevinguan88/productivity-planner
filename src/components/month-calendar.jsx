import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  parseISO,
  isToday,
} from "date-fns"
import { cn } from "@/lib/utils"
import { lighten, transparentize, darken } from "polished"

export default function MonthCalendar({ date, habits, habitCompletions }) {
  // Get all days in the current month view (including days from prev/next months)
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Group days into weeks
  const weeks = []
  let week = []

  calendarDays.forEach((day) => {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  })

  return (
    <div className="min-w-[768px]">
      {/* Days of week */}
      <div className="grid grid-cols-7 border-b">
        {["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"].map((day) => (
          <div key={day} className="p-2 text-center font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <CalendarCell
              key={`${weekIndex}-${dayIndex}`}
              day={day}
              isCurrentMonth={isSameMonth(day, date)}
              habits={habits}
              habitCompletions={habitCompletions}
            />
          )),
        )}
      </div>
    </div>
  )
}

function CalendarCell({ day, isCurrentMonth, habits, habitCompletions }) {
  // Get habit completions for this day
  const dayCompletions = getHabitCompletionsForDay(day, habits, habitCompletions)

  // Check if this is today
  const today = isToday(day)

  return (
    <div className={cn(
      "aspect-square p-2 border border-[#e8e8e8] flex flex-col", 
      !isCurrentMonth && "text-gray-400 bg-[#fafafa]"
    )}>
      {/* Date header - fixed height */}
      <div className="font-medium mb-2 flex-shrink-0">
        {today ? (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4b87ff] text-white">
            {format(day, "d")}
          </span>
        ) : (
          format(day, "d")
        )}
      </div>
      
      {/* Scrollable habit list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 items-end">
          {dayCompletions.map((habitData) => (
            <div key={habitData.id} className="flex items-center gap-2 flex-shrink-0">
              <span 
                className="text-sm px-3 py-2 rounded-md whitespace-nowrap"
                style={{
                  backgroundColor: transparentize(0.9, habitData.color),
                  color: darken(0.15, habitData.color)
                }}
              >
                {habitData.title}
              </span>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0"
                style={{
                  backgroundColor: habitData.color,
                  color: "white"
                }}
              >
                {habitData.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper function to get habit completions for a specific day
function getHabitCompletionsForDay(day, habits, habitCompletions) {
  const formattedDate = format(day, "yyyy-MM-dd")

  // Group completions by habit for this day
  const habitCounts = {}

  habitCompletions.forEach((completion) => {
    // Extract just the date part from the timestamp for comparison
    const completionDate = format(parseISO(completion.timestamp), "yyyy-MM-dd")

    if (completionDate === formattedDate) {
      if (!habitCounts[completion.habitId]) {
        habitCounts[completion.habitId] = 0
      }
      habitCounts[completion.habitId]++
    }
  })

  // Create array of habit data with counts
  return habits
    .filter((habit) => habitCounts[habit.id])
    .map((habit) => ({
      id: habit.id,
      title: habit.title,
      color: habit.color,
      count: habitCounts[habit.id],
    }))
}
