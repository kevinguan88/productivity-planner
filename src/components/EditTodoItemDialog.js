'use client';

import { useState, useEffect } from 'react';
export default function EditTodoItemDialog({
  handleEdit,
  taskTitle,
  taskHabit,
  isOpen,
  onSave,
  onCancel
}) {
  const [title, setTitle] = useState(taskTitle);
  const [habit, setHabit] = useState(taskHabit);

  // Sync props to state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(taskTitle);
      setHabit(taskHabit);
    }
  }, [isOpen, taskTitle, taskHabit]);

  const handleSubmit = () => {
    onSave({ title, habit });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
        {/* form for entering in edits for task's title and habit*/}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4 text-left">
            <label htmlFor="taskTitle" className="block text-sm font-medium">Name:</label>
            <input
              type="text"
              id="taskTitle"
              name="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4 text-left">
            <label htmlFor="taskHabit" className="block text-sm font-medium">Habit:</label>
            <input
              type="text"
              id="taskHabit"
              name="taskHabit"
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </form>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
