import React, { useState, useEffect } from 'react';

// Tiplar aynan shu faylning o'zida e'lon qilindi
export interface Room {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  name: string;
  capacity: number;
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoomPayload) => void;
  editData: Room | null;
  currentRole: string;
}

const initialState = {
  name: '',
  capacity: '',
};

export default function RoomModal({ isOpen, onClose, onSubmit, editData, currentRole }: RoomModalProps) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        name: editData.name,
        capacity: String(editData.capacity),
      });
    } else {
      setFormData(initialState);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const isCreateDisabled = !editData && currentRole !== 'ADMIN';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isCreateDisabled) {
      return alert("Yangi xona qo'shish huquqi faqat ADMINga tegishli!");
    }

    const capacityNum = parseInt(formData.capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      return alert("Xona sig'imi kamida 1 kishi bo'lishi kerak!");
    }

    onSubmit({
      name: formData.name.trim(),
      capacity: capacityNum,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border dark:border-gray-700 transition-colors duration-200">
        
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {editData ? "Xonani tahrirlash" : "Yangi xona yaratish"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {isCreateDisabled && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
              Diqqat! Yangi xona qo'shish huquqi faqat ADMINga tegishli.
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Xona nomi *</label>
            <input
              required
              minLength={2}
              maxLength={60}
              type="text"
              name="name"
              disabled={isCreateDisabled}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masalan: Room 101"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Xona sig'imi *</label>
            <input
              required
              type="number"
              min="1"
              name="capacity"
              disabled={isCreateDisabled}
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Masalan: 15"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isCreateDisabled}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm disabled:opacity-50"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}