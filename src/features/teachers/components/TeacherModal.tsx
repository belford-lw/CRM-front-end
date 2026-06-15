import React, { useState, useEffect } from 'react';

export interface Teacher {
  id: string | number;
  userId?: string | number;
  fullName: string;
  phone: string;
  photoUrl?: string;
  monthlySalary?: string | number | null;
  percentShare?: string | number | null;
  isActive: boolean;
}

export interface TeacherFormState {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  photoUrl: string;
  monthlySalary: string;
  percentShare: string;
}

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, any>) => void;
  editData: Teacher | null;
}

const initialFormState: TeacherFormState = {
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  photoUrl: '',
  monthlySalary: '',
  percentShare: '',
};

export default function TeacherModal({ isOpen, onClose, onSubmit, editData }: TeacherModalProps) {
  const [formData, setFormData] = useState<TeacherFormState>(initialFormState);
  const [payScheme, setPayScheme] = useState<'salary' | 'percent'>('salary');

  useEffect(() => {
    if (editData && isOpen) {
      const names = editData.fullName ? editData.fullName.trim().split(/\s+/) : ['', ''];
      setFormData({
        firstName: names[0] || '',
        lastName: names[1] || '',
        phone: editData.phone || '',
        password: '',
        photoUrl: editData.photoUrl || '',
        monthlySalary: editData.monthlySalary !== null && editData.monthlySalary !== undefined ? String(editData.monthlySalary) : '',
        percentShare: editData.percentShare !== null && editData.percentShare !== undefined ? String(editData.percentShare) : '',
      });
      setPayScheme(editData.monthlySalary ? 'salary' : 'percent');
    } else {
      setFormData(initialFormState);
      setPayScheme('salary');
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Record<string, any> = {};
    
    if (formData.firstName.trim()) payload.firstName = formData.firstName.trim();
    if (formData.lastName.trim()) payload.lastName = formData.lastName.trim();
    if (formData.phone.trim()) payload.phone = formData.phone.replace(/\s+/g, '');
    
    if (formData.password && formData.password.length >= 6) {
      payload.password = formData.password;
    }
    if (formData.photoUrl.trim()) payload.photoUrl = formData.photoUrl.trim();

    if (payScheme === 'salary') {
      if (!formData.monthlySalary) return alert("Oylik summasini kiriting");
      payload.monthlySalary = String(formData.monthlySalary);
      if (editData) payload.percentShare = null; 
    } else {
      if (!formData.percentShare) return alert("Foiz ulushini kiriting");
      const percentVal = parseFloat(formData.percentShare);
      if (percentVal < 0 || percentVal > 100) return alert("Foiz 0 va 100 oralig'ida bo'lishi shart");
      payload.percentShare = String(formData.percentShare);
      if (editData) payload.monthlySalary = null;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border dark:border-gray-700 transition-colors duration-200">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {editData ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi yaratish"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ism *</label>
              <input required minLength={2} type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Familiya *</label>
              <input required minLength={2} type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon *</label>
            <input required type="text" name="phone" placeholder="+998901234567" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parol {editData ? "(Ixtiyoriy)" : "* (Kamida 6 belgi)"}
            </label>
            <input required={!editData} minLength={6} type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rasm URL (Ixtiyoriy)</label>
            <input type="text" name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div className="border dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">To'lov Tizimi *</label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center text-sm gap-1.5 cursor-pointer font-medium text-gray-600 dark:text-gray-300">
                <input type="radio" checked={payScheme === 'salary'} onChange={() => setPayScheme('salary')} className="text-indigo-600 focus:ring-indigo-500" /> Fiksirlangan Oylik
              </label>
              <label className="flex items-center text-sm gap-1.5 cursor-pointer font-medium text-gray-600 dark:text-gray-300">
                <input type="radio" checked={payScheme === 'percent'} onChange={() => setPayScheme('percent')} className="text-indigo-600 focus:ring-indigo-500" /> Foiz ulushi (%)
              </label>
            </div>

            {payScheme === 'salary' ? (
              <div>
                <label className="block text-xs font-medium text-gray-750 dark:text-gray-300 mb-1">Oylik summasi (so'mda)</label>
                <input required type="number" min="0" name="monthlySalary" value={formData.monthlySalary} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-750 dark:text-gray-300 mb-1">Foiz ulushi (0 - 100 %)</label>
                <input required type="number" min="0" max="100" step="0.01" name="percentShare" value={formData.percentShare} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Bekor qilish</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}