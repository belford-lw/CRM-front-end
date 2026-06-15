import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { Student } from '../types/types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  student?: Student | null;
}

export const StudentFormModal = ({ isOpen, onClose, onSubmit, student }: StudentFormModalProps) => {
  const isEditMode = !!student;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    isActive: true,
    dateOfBirth: '',
    startDate: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode && student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phone: student.phone || '',
        password: '', 
        isActive: student.isActive ?? true,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '', 
        startDate: student.startDate ? student.startDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        isActive: true,
        dateOfBirth: '',
        startDate: '',
      });
    }
    setError(null);
  }, [student, isEditMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      setError('Iltimos, barcha majburiy maydonlarni to‘ldiring!');
      setIsLoading(false);
      return;
    }

    try {
      if (!formData.dateOfBirth || !formData.startDate) {
        setError('Tug‘ilgan sana va o‘qishni boshlash sanasini kiriting!');
        setIsLoading(false);
        return;
      }

      const isoBirthDate = new Date(formData.dateOfBirth);
      const isoStartDate = new Date(formData.startDate);

      if (isNaN(isoBirthDate.getTime()) || isNaN(isoStartDate.getTime())) {
        setError('Sana formati noto‘g‘ri!');
        setIsLoading(false);
        return;
      }

      // Backend Class-Validator talablariga mos toza obyekt yig'ish (Rest-destruction)
      const { firstName, lastName, phone, password, isActive } = formData;

      let payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: isoBirthDate.toISOString(),
        startDate: isoStartDate.toISOString(),
      };

      if (isEditMode) {
        payload.isActive = isActive;
        if (password.trim()) {
          payload.password = password.trim();
        }
      } else {
        // Yangi qo'shishda isActive umuman payload ichida ketmasligi kerak! (400 bad request oldini oladi)
        if (!password.trim()) {
          setError('Yangi o‘quvchi uchun tizim parolini kiriting!');
          setIsLoading(false);
          return;
        }
        payload.password = password.trim();
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Xatolik yuz berdi. Qayta urinib ko‘ring!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b132b]/70 backdrop-blur-sm p-4 antialiased">
      <div className="bg-[#1c2541] border border-[#3a506b]/40 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#3a506b]/30 flex items-center justify-between bg-[#0b132b]/20">
          <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] tracking-wide uppercase">
            {isEditMode ? 'O‘quvchi Ma’lumotlarini Tahrirlash' : 'Yangi O‘quvchi Qo‘shish'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-light p-1 leading-none">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl font-medium flex items-start gap-2.5">
              <span className="mt-0.5">⚠️</span>
              <span className="flex-1 leading-relaxed">{Array.isArray(error) ? error.join(', ') : error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Ismi *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Sardor"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Familiyasi *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Toshpolatov"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Telefon raqami *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998944390910"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tizim uchun Parol {!isEditMode ? '*' : <span className="text-[10px] text-slate-500 font-normal lowercase">(ixtiyoriy)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Tug‘ilgan sanasi *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all scheme-dark"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">O‘qishni boshlash sanasi *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all scheme-dark"
              />
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded bg-white/5 border border-white/10 text-[#4361ee] focus:ring-[#4cc9f0]/30 transition-all"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-300 cursor-pointer select-none uppercase tracking-wide">
                Tizimda faol o'quvchi
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#3a506b]/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/10 uppercase tracking-wider transition-all"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 uppercase tracking-wider"
            >
              {isLoading ? 'Saqlanmoqda...' : isEditMode ? 'Yangilash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};