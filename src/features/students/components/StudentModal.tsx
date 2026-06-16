import React, { useState, useEffect } from 'react';

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  dateOfBirth: string | null;
  startDate: string | null;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  editData: Student | null;
}

const initialState = {
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  startDate: '',
};

export default function StudentModal({ isOpen, onClose, onSubmit, editData }: StudentModalProps) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editData && isOpen) {
      // Ism va familiyani fullName'dan ajratib olishga urinib ko'ramiz
      const nameParts = editData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        phone: editData.phone,
        password: '', // tahrirlashda parol majburiy emas
        dateOfBirth: editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : '',
        startDate: editData.startDate ? editData.startDate.split('T')[0] : '',
      });
    } else {
      setFormData(initialState);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
    };

    if (formData.dateOfBirth) payload.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
    if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString();

    if (editData) {
      // Agar tahrirlash bo'lsa va parol yozilgan bo'lsa, payloadga qo'shamiz
      if (formData.password.trim()) {
        if (formData.password.length < 6) return alert("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
        payload.password = formData.password;
      }
    } else {
      // Yangi yaratishda parol majburiy
      if (!formData.password.trim()) return alert("Parol kiritish majburiy!");
      if (formData.password.length < 6) return alert("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      payload.password = formData.password;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border dark:border-gray-700 transition-colors duration-200">
        
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {editData ? "Studentni tahrirlash" : "Yangi student qo'shish"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ismi *</label>
              <input
                required
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Familiyasi *</label>
              <input
                required
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon raqami *</label>
            <input
              required
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+998901234567"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parol {editData ? "(O'zgartirish ixtiyoriy)" : "*"}
            </label>
            <input
              required={!editData}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Kamida 6 ta belgi"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tug'ilgan sanasi</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">O'qishni boshlagan sanasi</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}