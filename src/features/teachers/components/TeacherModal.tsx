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
  phone: '+998',
  password: '',
  photoUrl: '',
  monthlySalary: '',
  percentShare: '',
};

// 🌟 Raqamlarni 1,000,000 ko'rinishida formatlash uchun yordamchi funksiyalar
const formatNumber = (val: string | number | null | undefined): string => {
  if (!val && val !== 0) return '';
  const cleanStr = String(val).replace(/\D/g, ''); // faqat raqamlarni qoldiramiz
  return cleanStr.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // har 3ta raqamga vergul qo'yamiz
};

const parseNumber = (val: string): string => {
  return val.replace(/,/g, ''); // backendga yuborish uchun vergullarni olib tashlaymiz
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
        phone: editData.phone || '+998',
        password: '',
        photoUrl: editData.photoUrl || '',
        // 🌟 Tahrirlash ochilganda kelgan oylikni vizual formatlaymiz
        monthlySalary: editData.monthlySalary !== null && editData.monthlySalary !== undefined ? formatNumber(editData.monthlySalary) : '',
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
    
    if (name === 'phone' && !value.startsWith('+998')) {
      return;
    }

    // 🌟 Oylik yozilayotganda real vaqtda vergul qo'yib borish mantiqi
    if (name === 'monthlySalary') {
      const formatted = formatNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Record<string, any> = {};
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || formData.phone.trim() === '+998') {
      return alert("Iltimos, barcha majburiy maydonlarni to‘ldiring!");
    }

    payload.firstName = formData.firstName.trim();
    payload.lastName = formData.lastName.trim();
    payload.phone = formData.phone.replace(/\s+/g, '');
    
    if (formData.password) {
      if (formData.password.length < 6) return alert("Parol kamida 6 ta belgidan iborat bo'lishi shart");
      payload.password = formData.password;
    }
    
    payload.photoUrl = formData.photoUrl.trim() || null;

    if (payScheme === 'salary') {
      if (!formData.monthlySalary) return alert("Oylik summasini kiriting");
      // 🌟 Backendga yuborishdan oldin vergullarni tozalab, toza raqam qilib yuboramiz
      payload.monthlySalary = parseNumber(formData.monthlySalary);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-background/30 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            {editData ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi yaratish"}
          </h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-main text-2xl border-none bg-transparent cursor-pointer">&times;</button>
        </div>

        {/* Form oynasi */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Ism *</label>
              <input required minLength={2} type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Sardor" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Familiya *</label>
              <input required minLength={2} type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Toshpolatov" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Telefon *</label>
            <input required type="text" name="phone" placeholder="+998901234567" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Parol {editData ? <span className="text-[10px] text-text-muted opacity-70 font-normal lowercase">(ixtiyoriy)</span> : "* (Kamida 6 belgi)"}
            </label>
            <input required={!editData} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Rasm URL (Ixtiyoriy)</label>
            <input type="text" name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="https://example.com/avatar.jpg" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
          </div>

          {/* To'lov tizimi */}
          <div className="border border-border p-4 rounded-xl bg-background/50">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">To'lov Tizimi *</label>
            <div className="flex gap-5 mb-3">
              <label className="flex items-center text-xs gap-1.5 cursor-pointer font-bold text-text-main">
                <input type="radio" checked={payScheme === 'salary'} onChange={() => setPayScheme('salary')} className="accent-[#4361ee] h-4 w-4" /> Fiksirlangan Oylik
              </label>
              <label className="flex items-center text-xs gap-1.5 cursor-pointer font-bold text-text-main">
                <input type="radio" checked={payScheme === 'percent'} onChange={() => setPayScheme('percent')} className="accent-[#4361ee] h-4 w-4" /> Foiz ulushi (%)
              </label>
            </div>

            {payScheme === 'salary' ? (
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Oylik summasi (so'mda)</label>
                {/* 🌟 Type textga o'zgardi va placeholder qo'yildi */}
                <input required type="text" name="monthlySalary" value={formData.monthlySalary} onChange={handleInputChange} placeholder="1,500,000" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Foiz ulushi (0 - 100 %)</label>
                <input required type="number" min="0" max="100" step="0.01" name="percentShare" value={formData.percentShare} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-background hover:bg-border/50 text-text-muted rounded-xl text-xs font-bold transition-all cursor-pointer">Bekor qilish</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}