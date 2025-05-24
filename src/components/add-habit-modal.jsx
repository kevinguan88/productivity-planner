"use client"

import { useState } from "react"
import {
  X,
  Book,
  Dumbbell,
  MonitorIcon as Running,
  SpaceIcon as Yoga,
  Moon,
  Droplets,
  Apple,
  PenLine,
  Brain,
  Target,
  Heart,
  Coffee,
  Music,
  Code,
  Bike,
  Utensils,
  Cigarette,
  Gamepad2,
  BookOpen,
  Palette,
  Pill,
  TreesIcon as Plant,
  Smile,
  Zap,
  Clock,
  Calendar,
  Flame,
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'



// Array of Lucide icons with their names
const ICON_OPTIONS = [
  { icon: Book, name: "Book" },
  { icon: Dumbbell, name: "Dumbbell" },
  { icon: Running, name: "Running" },
  { icon: Yoga, name: "Yoga" },
  { icon: Moon, name: "Moon" },
  { icon: Droplets, name: "Water" },
  { icon: Apple, name: "Apple" },
  { icon: PenLine, name: "Write" },
  { icon: Brain, name: "Brain" },
  { icon: Target, name: "Target" },
  { icon: Heart, name: "Heart" },
  { icon: Coffee, name: "Coffee" },
  { icon: Music, name: "Music" },
  { icon: Code, name: "Code" },
  { icon: Bike, name: "Bike" },
  { icon: Utensils, name: "Eat" },
  { icon: Cigarette, name: "No Smoking" },
  { icon: Gamepad2, name: "Gaming" },
  { icon: BookOpen, name: "Read" },
  { icon: Palette, name: "Art" },
  { icon: Pill, name: "Medicine" },
  { icon: Plant, name: "Plant" },
  { icon: Smile, name: "Smile" },
  { icon: Zap, name: "Energy" },
  { icon: Clock, name: "Time" },
  { icon: Calendar, name: "Calendar" },
  { icon: Flame, name: "Flame" },
]

// Preset colors with names
const COLOR_PRESETS = [
  { name: "Blue", value: "#4b87ff" },
  { name: "Red", value: "#f46555" },
  { name: "Green", value: "#45bb5b" },
  { name: "Purple", value: "#9c5fff" },
  { name: "Orange", value: "#ff9f45" },
  { name: "Teal", value: "#3caea3" },
  { name: "Pink", value: "#ff66c4" },
  { name: "Yellow", value: "#ffd43b" },
]

export default function AddHabitModal({ isOpen, onClose }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState(5)
  const [color, setColor] = useState("#4b87ff")
  const [selectedIconIndex, setSelectedIconIndex] = useState(0)
  const [showCustomColor, setShowCustomColor] = useState(false)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_SUPABASE_KEY);
  

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!name.trim()) {
      alert("Please enter a habit name")
      return
    }

    // Create new habit object
    const newHabit = {
      name: name.trim(),
      description: description.trim(),
      goal: Number(goal),
      color,
      iconName: ICON_OPTIONS[selectedIconIndex].name,
      iconComponent: ICON_OPTIONS[selectedIconIndex].icon,
      count: 0,
    }

    // console.log('newHabit', newHabit)

    // Add the habit
    // onAddHabit(newHabit)

    console.log({name: newHabit.name},
      {description: newHabit.description},
      {weekly_goal: newHabit.goal},
      {color: newHabit.color},
      {icon_name: newHabit.iconName})

    // Add the habit to the database
    let { error } = await supabase.from('habits').insert([
      {name: newHabit.name, weekly_goal: newHabit.goal, color: newHabit.color, icon_name: newHabit.iconName },  
    ])
      if (error) {
        console.error(error)
      }

    console.log('inserting,', newHabit)

    // Reset form and close modal
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setGoal(5)
    setColor("#4b87ff")
    setSelectedIconIndex(0)
    setShowCustomColor(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Habit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name Input */}
          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name*
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter habit name"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows="2"
            />
          </div>

          {/* Weekly Goal Input */}
          <div>
            <label htmlFor="habit-goal" className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Goal
            </label>
            <input
              id="habit-goal"
              type="number"
              min="1"
              max="100"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>

            {/* Color Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              {COLOR_PRESETS.map((colorOption, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setColor(colorOption.value)
                    setShowCustomColor(false)
                  }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption.value && !showCustomColor ? "border-black" : "border-transparent"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  aria-label={`Select ${colorOption.name} color`}
                  title={colorOption.name}
                />
              ))}

              {/* Custom color button */}
              <button
                type="button"
                onClick={() => setShowCustomColor(true)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  showCustomColor ? "border-black" : "border-gray-300"
                }`}
                style={{
                  background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                }}
                aria-label="Custom color"
                title="Custom color"
              >
                {showCustomColor && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </button>
            </div>

            {/* Custom Color Picker */}
            {showCustomColor && (
              <div className="mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded border-0 p-0 cursor-pointer"
                    aria-label="Select custom color"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#RRGGBB"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    title="Hex color code (e.g. #4b87ff)"
                  />
                </div>
              </div>
            )}

            {/* Selected Color Preview */}
            <div className="flex items-center space-x-3 mt-2">
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                aria-label="Selected color preview"
              ></div>
              <span className="text-sm text-gray-600">Selected color</span>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {ICON_OPTIONS.map((iconOption, index) => {
                const IconComponent = iconOption.icon
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedIconIndex(index)}
                    className={`p-2 flex items-center justify-center rounded ${
                      selectedIconIndex === index
                        ? "bg-gray-100 border-2 border-gray-400"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                    aria-label={`Select ${iconOption.name} icon`}
                    title={iconOption.name}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: selectedIconIndex === index ? color : "currentColor" }}
                    />
                  </button>
                )
              })}
            </div>

            {/* Selected Icon Preview */}
            <div className="flex items-center space-x-3 mt-3">
              {(() => {
                const SelectedIcon = ICON_OPTIONS[selectedIconIndex].icon
                return (
                  <>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <SelectedIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {ICON_OPTIONS[selectedIconIndex].name} icon with selected color
                    </span>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#4b87ff] text-white rounded-md hover:bg-[#3a76ee]">
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
