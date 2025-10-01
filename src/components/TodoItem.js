'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Pencil, Circle, CircleCheck, GripVertical, MoreVertical } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import EditTodoItemDialog from './EditTodoItemDialog';
import { TodoService } from '../services/todo.service'; // Adjust the path as needed
import Todo from '@/app/todo/page';

export default function TodoItem({ text: taskTitle, habit, index, refreshTodos }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEditClick = () => {
    setShowEdit(true);
    setShowMenu(false);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      <div className="flex items-start gap-3">
        <button className="text-[#666666] hover:text-black transition-colors mt-6">
          <GripVertical className="w-8 h-8" />
        </button>
        <div className="bg-white rounded-2xl border-1 border-gray-500 p-5 shadow-sm flex justify-between flex-1">
          <div className="flex items-center gap-2">
            {/* Left Side: Title and Habit */}
            <div className="relative w-10 h-19 group cursor-pointer">
              {/* Circle icon - visible by default */}
              <Circle className="absolute inset-0 transition-opacity duration-200 opacity-100 group-hover:opacity-0 w-9 h-9" />

              {/* Check icon - visible on hover */}
              <CircleCheck onClick={() => handleCheckOff(index)} className="absolute inset-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100 w-9 h-9" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-normal text-black mb-2 h-10">{taskTitle}</h3>
              <p className="text-[#666666] text-base leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Cras commodo... 
              </p>
            </div>
          </div>

          {/* Right side badges and menu */}
          <div className="flex items-start gap-3 flex-shrink-0">
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                {/* Reading badge */}
                {habit && (
                <div className="bg-[#f46555] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">{habit}</span>
                </div>
                )}

                {/* B 1 badge */}
                <div className="bg-white border-2 border-black px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium text-black">B</span>
                  <span className="text-sm font-medium text-black">1</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-[#f46555] text-base font-medium">Today At 16:45</div>
            </div>

            {/* Menu button */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={handleMenuClick}
                className="text-[#666666] hover:text-black transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {/* Popup menu */}
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={handleEditClick}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Pencil className="w-4 h-4 text-[#666666]" />
                    <span className="text-sm font-medium text-black">Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-200"
                  >
                    <Trash2 className="w-4 h-4 text-[#666666]" />
                    <span className="text-sm font-medium text-black">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
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
