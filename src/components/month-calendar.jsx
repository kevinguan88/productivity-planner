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
import { lighten, transparentize } from "polished"

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
  const getBadgeColor = (color) => {
    // switch (color) {
    //   case "blue":
    //     return "bg-[#d6e4ff] text-[#4b87ff]"
    //   case "red":
    //     return "bg-[#ffcfcf] text-[#ff3b3b]"
    //   case "green":
    //     return "bg-[#d7f8df] text-[#00ba34]"
    //   case "purple":
    //     return "bg-[#ffccff] text-[#800080]"
    //   case "orange":
    //     return "bg-[#ffebd9] text-[#ff8f00]"
    //   default:
    //     return "bg-gray-100 text-gray-600"
    // }
    const lightened = lighten(0.8, color);
    return `bg-[${lightened}] text-[${color}]`
  }

  const getCountBadgeColor = (color) => {
   return `bg-${color} text-white`
  }

  // Get habit completions for this day
  const dayCompletions = getHabitCompletionsForDay(day, habits, habitCompletions)

  // Check if this is today
  const today = isToday(day)

  return (
    <div className={cn("min-h-[120px] p-2 border border-[#e8e8e8]", !isCurrentMonth && "text-gray-400 bg-[#fafafa]")}>
      <div className="font-medium mb-2">
        {today ? (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4b87ff] text-white">
            {format(day, "d")}
          </span>
        ) : (
          format(day, "d")
        )}
      </div>
      <div className="flex flex-col gap-1 items-end">
        {dayCompletions.map((habitData) => (
          <div key={habitData.id} className="flex items-center gap-1">
            <span className={cn("text-xs px-2 py-1 rounded-md")}
            style={{
                backgroundColor: transparentize(0.9, habitData.color),
                color: habitData.color
              }}
            >
              {habitData.title}
            </span>
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
              )}
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
