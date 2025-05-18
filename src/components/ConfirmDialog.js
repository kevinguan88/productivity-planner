'use client';

export default function ConfirmDialog({ 
  isOpen, 
  title = 'Confirm', 
  message = 'Are you sure?', 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onConfirm} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Yes
          </button>
          <button 
            onClick={onCancel} 
            className="bg-gray-300 hover:bg-gray-400 opacity-75 px-4 py-2 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
