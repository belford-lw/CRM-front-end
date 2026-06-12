import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { CreateStudentInput, Student, UpdateStudentInput } from '../types/types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentInput | UpdateStudentInput) => Promise<void>;
  student?: Student | null; // Agar shu kelib tursa - TAHRIRLASH (Update) rejimi yoqiladi
}

export const StudentFormModal = ({ isOpen, onClose, onSubmit, student }: StudentFormModalProps) => {
  const isEditMode = !!student;

  // Formaning boshlang'ich holati (Initial State)
  const [formData, setFormData] = useState<UpdateStudentInput>({
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

  // Agar tahrirlash rejimi bo'lsa, kelgan o'quvchi ma'lumotlarini formaga to'ldiramiz
  useEffect(() => {
    if (isEditMode && student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phone: student.phone || '',
        password: '', // Parolni odatda tahrirlayotganda majburiy ko'rsatmaymiz (ixtiyoriy)
        isActive: student.isActive ?? true,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '', // 'YYYY-MM-DD' formatiga keltirish
        startDate: student.startDate ? student.startDate.split('T')[0] : '',
      });
    } else {
      // Aks holda formani tozalaymiz (Yangi o'quvchi rejimi)
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

  // Input o'zgarganda state-ni yangilovchi universal funksiya
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Formani yuborish (Submit) va Frontend Validatsiya
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  // ... (validatsiya qismlari o'zidek qoladi)

  try {
    // Jo'natilayotgan ma'lumotlar nusxasini olamiz
    const dataToSend = { ...formData };

    // SANALARNI ISO FORMATIGA O'GIRISH (Backend so'rayotgan ISO 8601 formati)
    if (dataToSend.dateOfBirth) {
      dataToSend.dateOfBirth = new Date(dataToSend.dateOfBirth).toISOString();
    }
    if (dataToSend.startDate) {
      dataToSend.startDate = new Date(dataToSend.startDate).toISOString();
    }

    // AGAR YANGI O'QUVCHI BO'LSA (isEditMode = false)
    if (!isEditMode) {
      delete dataToSend.isActive; // CreateStudentDto da isActive yo'qligi uchun o'chirib tashlaymiz!
    }

    // Agar tahrirlash bo'lsa va parol yozilmagan bo'lsa
    if (isEditMode && !dataToSend.password) {
      delete dataToSend.password;
    }

    await onSubmit(dataToSend);
    onClose();
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Xatolik yuz berdi. Qayta urinib ko‘ring!');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        
        {/* Modal Sarlavhasi */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-main">
            {isEditMode ? 'O‘quvchi Ma’lumotlarini Tahrirlash' : 'Yangi O‘quvchi Qo‘shish'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-xl font-bold">×</button>
        </div>

        {/* Modal Tana Qismi (Forma) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Ismi</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Anvar"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Familiyasi</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Aliyev"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Telefon raqami</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998901234567"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tizim uchun Parol {isEditMode && <span className="text-xs text-text-muted">(ixtiyoriy)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Tug‘ilgan sanasi</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">O‘qishni boshlash sanasi</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-main focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Faqat TAHRIRLASH rejimida ko'rinadigan Aktivlik statusi (isActive) */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-text-main select-none">
                Tizimda faol (O‘quvchi statusi)
              </label>
            </div>
          )}

          {/* Modal Tugmalari */}
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-background hover:bg-border/40 text-text-main font-medium rounded-lg border border-border transition-all"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-75"
            >
              {isLoading ? 'Saqlanmoqda...' : isEditMode ? 'Yangilash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};