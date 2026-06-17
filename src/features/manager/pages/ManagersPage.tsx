import React, { useState, useEffect } from 'react';
import { managersApi, type ManagerListItem } from '../api/ManagersApi';

export const ManagersPage = () => {
  const [managers, setManagers] = useState<ManagerListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal va rejimni boshqarish
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ManagerListItem | null>(null);

  // Form maydonlari
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const data = await managersApi.list();
      setManagers(data);
    } catch (err) {
      console.error('Yuklashda xatolik:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Telefon inputi uchun format (+998 ni himoya qilish)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!input.startsWith('+998')) input = '+998';
    const digits = input.substring(4).replace(/\D/g, '').substring(0, 9);
    setPhone('+998' + digits);
  };

  // Maosh kiritilganda vergul bilan formatlash
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
      setMonthlySalary('');
      return;
    }
    setMonthlySalary(Number(rawValue).toLocaleString('en-US'));
  };

  // Ism va Familiyaning bosh harfini olish (Avatar uchun)
  const getInitials = (first: string, last: string) => {
    const f = first ? first.trim().charAt(0).toUpperCase() : '';
    const l = last ? last.trim().charAt(0).toUpperCase() : '';
    return f + l || 'M';
  };

  // Tahrirlash tugmasi bosilganda formani to'ldirish
  const openEditModal = (manager: ManagerListItem) => {
    setToast(null);
    setEditingManager(manager);
    setFirstName(manager.firstName);
    setLastName(manager.lastName);
    setPhone(manager.phone);
    setPassword('');
    setMonthlySalary(''); 
    setPhotoUrl('');
    setIsModalOpen(true);
  };

  // Modalni yopish va formani tozalash
  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingManager(null);
    setFirstName('');
    setLastName('');
    setPhone('+998');
    setPassword('');
    setMonthlySalary('');
    setPhotoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const cleanSalary = monthlySalary ? Number(monthlySalary.replace(/,/g, '')) : undefined;

    if (!firstName.trim() || !lastName.trim() || phone.trim().length < 13 || (!editingManager && !password)) {
      setToast({ type: 'error', text: 'Iltimos, barcha majburiy maydonlarni toʻgʻri toʻldiring!' });
      return;
    }

    try {
      if (editingManager) {
        await managersApi.update(editingManager.id, {
          firstName,
          lastName,
          phone,
          password: password || undefined,
          monthlySalary: cleanSalary,
          photoUrl: photoUrl.trim() || undefined
        });
        setToast({ type: 'success', text: 'Manager muvaffaqiyatli yangilandi!' });
      } else {
        await managersApi.create({
          firstName,
          lastName,
          phone,
          password,
          monthlySalary: cleanSalary || 0,
          photoUrl: photoUrl.trim() || undefined
        });
        setToast({ type: 'success', text: 'Manager muvaffaqiyatli yaratildi!' });
      }

      closeFormModal();
      fetchManagers();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Xatolik yuz berdi!';
      setToast({ type: 'error', text: errorMsg });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haqiqatdan ham ushbu managerni tizimdan oʻchirmoqchimisiz?')) {
      try {
        await managersApi.remove(id);
        fetchManagers();
      } catch (err) {
        alert('Oʻchirishda xatolik yuz berdi!');
      }
    }
  };

  const filteredManagers = managers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background text-text-main p-6 antialiased selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-wide uppercase">
            Managerlar paneli
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Backend API tizimi bilan to'liq integratsiya qilingan boshqaruv
          </p>
        </div>
        
        <button
          onClick={() => { setToast(null); setEditingManager(null); setIsModalOpen(true); }}
          className="px-5 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          + Yangi Manager
        </button>
      </div>

      {toast && !isModalOpen && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Qidiruv inputi */}
      <div className="w-full mb-6">
        <input
          type="text"
          placeholder="Ism yoki telefon orqali qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text-main placeholder:text-text-muted text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all duration-300"
        />
      </div>

      {/* Jadval paneli */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Mavjud Managerlar</h2>
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-background border border-border text-[#4cc9f0] rounded-full">
            Jami: {filteredManagers.length} ta
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="pb-3 pl-2">Profil & Ism</th>
                <th className="pb-3">Telefon raqami</th>
                <th className="pb-3">Qoʻshilgan sana</th>
                <th className="pb-3 text-right pr-2">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-text-muted animate-pulse">Yuklanmoqda...</td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted text-sm font-medium">Managerlar topilmadi.</td>
                </tr>
              ) : (
                filteredManagers.map((m) => (
                  <tr key={m.id} className="hover:bg-background/50 transition-colors group">
                    <td className="py-3.5 pl-2 flex items-center gap-3 font-semibold text-text-main">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4361ee] to-[#3f37c9] flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider ring-2 ring-border">
                        {getInitials(m.firstName, m.lastName)}
                      </div>
                      <span>{m.firstName} {m.lastName}</span>
                    </td>
                    <td className="py-3.5 text-text-main font-mono opacity-90">{m.phone}</td>
                    <td className="py-3.5 text-text-muted">
                      {new Date(m.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-3.5 text-right pr-2 space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        className="text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-amber-500/20 cursor-pointer"
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-rose-500/20 cursor-pointer"
                      >
                        Oʻchirish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNIVERSAL MODAL OYNASI (CREATE & UPDATE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={closeFormModal}
              className="absolute top-4 right-4 text-text-muted hover:text-text-main text-lg transition-colors cursor-pointer border-none bg-transparent"
            >
              ✕
            </button>

            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              {editingManager ? 'Manager Maʻlumotlarini Tahrirlash' : 'Yangi Manager Qoʻshish'}
            </h2>

            {toast && toast.type === 'error' && (
              <div className="mb-4 p-3 rounded-xl text-xs font-semibold border bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20">
                {toast.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Ism *</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    placeholder="Sardor" 
                    className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Familiya *</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    placeholder="Toshpulatov" 
                    className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted">Telefon raqam *</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  placeholder="+998901234567" 
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs font-mono focus:outline-none focus:border-[#4cc9f0] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted">
                  Tizim paroli {editingManager ? '(Ixtiyoriy)' : '*'}
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder={editingManager ? "O'zgartirmaslik uchun bo'sh" : "••••••••"} 
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted">Oylik Maoshi (UZS)</label>
                <input 
                  type="text" 
                  value={monthlySalary} 
                  onChange={handleSalaryChange} 
                  placeholder="0" 
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted">Rasm URL (Ixtiyoriy)</label>
                <input 
                  type="text" 
                  value={photoUrl} 
                  onChange={e => setPhotoUrl(e.target.value)} 
                  placeholder="https://image.com/photo.jpg" 
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/50 text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 bg-background hover:bg-border/40 text-text-muted rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {editingManager ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};