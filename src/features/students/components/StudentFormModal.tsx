import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
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
    phone: '+998',
    password: '',
    photoUrl: '',
    isActive: true,
    dateOfBirth: '',
    startDate: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatDateToInput = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isEditMode && student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phone: student.phone || '+998',
        password: '', 
        photoUrl: student.photoUrl || '',
        isActive: student.isActive ?? true,
        dateOfBirth: formatDateToInput(student.dateOfBirth), 
        startDate: formatDateToInput(student.startDate),
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '+998',
        password: '',
        photoUrl: '',
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
    
    // Telefon raqam doim +998 bilan boshlanishini ta'minlash
    if (name === 'phone') {
      if (!value.startsWith('+998')) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.firstName.trim() || !formData.lastName.trim() || formData.phone.trim() === '+998') {
      setError('Iltimos, barcha majburiy maydonlarni to‘ldiring!');
      setIsLoading(false);
      return;
    }

    if (!formData.dateOfBirth || !formData.startDate) {
      setError('Tug‘ilgan sana va o‘qishni boshlash sanasini kiriting!');
      setIsLoading(false);
      return;
    }

    try {
      const isoBirthDate = new Date(formData.dateOfBirth);
      const isoStartDate = new Date(formData.startDate);

      if (isNaN(isoBirthDate.getTime()) || isNaN(isoStartDate.getTime())) {
        setError('Kiritilgan sanalar formati noto‘g‘ri!');
        setIsLoading(false);
        return;
      }

      const { firstName, lastName, phone, password, photoUrl, isActive } = formData;

      let payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl.trim() || null,
        dateOfBirth: isoBirthDate.toISOString(),
        startDate: isoStartDate.toISOString(),
      };

      if (isEditMode) {
        payload.isActive = isActive;
        if (password.trim()) {
          payload.password = password.trim();
        }
      } else {
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
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      setError(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage || 'Xatolik yuz berdi. Qayta urinib ko‘ring!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-background/30 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            {isEditMode ? 'O‘quvchi Ma’lumotlarini Tahrirlash' : 'Yangi O‘quvchi Qo‘shish'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-text-muted hover:text-text-main text-xl transition-colors cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Form oynasi */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-start gap-2.5">
              <span className="mt-0.5">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Ismi *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Sardor"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Familiyasi *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Toshpolatov"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Telefon raqami *</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998944390910"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Rasm URL (Ixtiyoriy)</label>
            <input
              type="text"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Tizim uchun Parol {!isEditMode ? '*' : <span className="text-[10px] text-text-muted opacity-70 font-normal lowercase">(ixtiyoriy)</span>}
            </label>
            <input
              type="password"
              name="password"
              required={!isEditMode}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Tug‘ilgan sanasi *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all dark:scheme-dark"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">O‘qishni boshlash sanasi *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all dark:scheme-dark"
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
                className="w-4 h-4 rounded bg-background border border-border text-[#4361ee] focus:ring-[#4cc9f0]/30 transition-all cursor-pointer"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-text-main/80 dark:text-text-muted cursor-pointer select-none uppercase tracking-wide">
                Tizimda faol o'quvchi
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-background hover:bg-border/50 text-text-muted rounded-xl text-xs font-bold transition-all cursor-pointer"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Saqlanmoqda...' : isEditMode ? 'Yangilash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};