'use client';

import { useState } from 'react';
import { Trash2, Pencil, Circle, CircleCheck } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import EditTodoItemDialog from './EditTodoItemDialog';
import { TodoService } from '../services/todo.service'; // Adjust the path as needed

export default function TodoItem({ text: taskTitle, habit, index, refreshTodos }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [hover, setHover] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setTimeoutId(setTimeout(() => setHover(true), 100));
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setHover(false);
  };


  const handleDelete = () => {
    TodoService.deleteTodo(index);
    refreshTodos(); // Refresh the parent list after deletion
    setShowConfirm(false);
  };

  const handleEdit = (updatedItem) => {
    TodoService.updateTodo(index, updatedItem);
    refreshTodos();
    setShowEdit(false);
  };


  return (
    <>
      <div className="flex items-center justify-between border-2 m-1 p-2 bg-blue-100 border-neutral-600 rounded">
        {/* Left Side: Title and Habit */}
        <div className="flex items-center gap-2">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {hover ? <CircleCheck size={24} /> : <Circle size={24} />}
          </div>

          <span className="font-semibold">{taskTitle}</span>
          <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
            {habit}
          </span>
        </div>

        {/* Right Side: Edit and Delete Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setShowEdit(true)}
          >
            <Pencil size={18} />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskTitle}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Edit Dialog */}
      <EditTodoItemDialog
        taskTitle={taskTitle}
        taskHabit={habit}
        isOpen={showEdit}
        onSave={handleEdit}
        onCancel={() => setShowEdit(false)}
      />
    </>
  );
}
