'use client';

import { useState } from 'react';
import { Trash2, Pencil, Circle, CircleCheck, GripVertical } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import EditTodoItemDialog from './EditTodoItemDialog';
import { TodoService } from '../services/todo.service'; // Adjust the path as needed
import Todo from '@/app/todo/page';

export default function TodoItem({ text: taskTitle, habit, index, refreshTodos }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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

  const handleCheckOff = async (index) => {
    await TodoService.checkOffTodo(index);
    //await console.log('checked off, got todos', TodoService.getTodos());
    refreshTodos();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-sm flex justify-between">
        <div className="flex items-center gap-2">
        <button className="text-[#666666] hover:text-black transition-colors mt-1">
          <GripVertical className="w-8 h-8" />
        </button>
        {/* Left Side: Title and Habit */}
          <div className="relative w-6 h-6 group cursor-pointer">
            {/* Circle icon - visible by default */}
            <Circle className="absolute inset-0 transition-opacity duration-200 opacity-100 group-hover:opacity-0" />

            {/* Check icon - visible on hover */}
            <CircleCheck onClick={() => handleCheckOff(index)} className="absolute inset-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-normal text-black mb-2">{taskTitle}</h3>
            <p className="text-[#666666] text-base leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Cras commodo... 
            </p>
          </div>
          {habit && (
            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
              {habit}
            </span>
          )}
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
