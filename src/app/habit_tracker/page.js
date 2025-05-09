'use client'

import HabitCard from "./habit-card";
import { useState, useEffect } from "react";
import { Plus, Minus, MoreVertical } from "lucide-react"

export default function HabitTracker() {
    const [habits] = useState([
        {
          id: 1,
          name: "Homework",
          icon: "📚",
          color: "#4b87ff",
          count: 4,
          goal: 5,
          description: "Description",
        },
        {
          id: 2,
          name: "Work Out",
          icon: "💪",
          color: "#f46555",
          count: 4,
          goal: 5,
          description: "Description",
        },
      ])

    return (
    <div>
        {/* Main Content */}
      <main className="flex-1 bg-white p-4 flex flex-col items-center space-y-4 ">
        <div className="w-[60%] bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4 min-w-[400px]">
          {/* Habit Cards */}
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              name={habit.name}
              icon={habit.icon}
              color={habit.color}
              initialCount={habit.count}
              goal={habit.goal}
              description={habit.description}
            />
          ))}

          {/* Add New Habit Button */}
          <button className="bg-[#4b87ff] text-white py-6 rounded-lg flex items-center justify-center mt-auto hover:bg-[#3a76ee] transition-colors">
            <Plus className="w-6 h-6 mr-2" />
            <span className="text-xl">Add New Habit</span>
          </button>
        </div>
      </main>
    </div>
    )
}