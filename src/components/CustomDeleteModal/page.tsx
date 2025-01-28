import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: "animal" | "category" | "feature" | "content";
  itemId: string | number | null; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, itemType, itemId}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-9999">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Are you sure you want to delete</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md text-black">
            Cancel
          </button>
          <button
            onClick={() => itemId && onConfirm()}
            className="px-4 py-2 bg-red-500 rounded-md text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;