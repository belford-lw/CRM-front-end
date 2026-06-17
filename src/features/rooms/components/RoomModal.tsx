import React, { useState, useEffect } from 'react';
import type { CreateRoomPayload, Room } from '../pages/RoomsPage';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#3a506b]/40 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Yopish tugmasi */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl transition-colors cursor-pointer border-none bg-transparent"
        >
          ✕
        </button>

        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          {editData ? "Xonani tahrirlash" : "Yangi xona yaratish"}
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {isCreateDisabled && (
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold">
              Diqqat! Yangi xona qo'shish huquqi faqat ADMINga tegishli.
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Xona nomi *</label>
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
              className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-[#1c2541]/50 border border-slate-300 dark:border-[#3a506b]/30 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Xona sig'imi *</label>
            <input
              required
              type="number"
              min="1"
              name="capacity"
              disabled={isCreateDisabled}
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Masalan: 15"
              className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-[#1c2541]/50 border border-slate-300 dark:border-[#3a506b]/30 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-[#3a506b]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isCreateDisabled}
              className="px-5 py-2 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}