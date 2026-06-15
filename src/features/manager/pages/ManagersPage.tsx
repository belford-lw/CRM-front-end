import React, { useState, useEffect } from 'react';
import { managersApi, type ManagerListItem } from '../api/ManagersApi';

export const ManagersPage = () => {
  const [managers, setManagers] = useState<ManagerListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form maydonlari (Backend CreateManagerDto ga mos)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchManagers = async () => {
    setIsLoading(true);
    const data = await managersApi.list();
    setManagers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!firstName || !lastName || !phone || !password || monthlySalary < 0) {
      setToast({ type: 'error', text: 'Iltimos, majburiy maydonlarni toʻgʻri toʻldiring!' });
      return;
    }

    try {
      await managersApi.create({
        firstName,
        lastName,
        phone,
        password,
        monthlySalary: Number(monthlySalary),
        photoUrl: photoUrl || undefined
      });

      setToast({ type: 'success', text: 'Manager muvaffaqiyatli yaratildi!' });
      
      // Formani tozalash
      setFirstName(''); setLastName(''); setPhone(''); setPassword(''); setMonthlySalary(0); setPhotoUrl('');
      fetchManagers();
    } catch (err) {
      setToast({ type: 'error', text: 'Xatolik yuz berdi!' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haqiqatdan ham ushbu managerni tizimdan oʻchirmoqchimisiz?')) {
      await managersApi.remove(id);
      fetchManagers();
    }
  };

  const filteredManagers = managers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sarlavha paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Managerlar Moduli</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Backend API bilan 100% integratsiya qilingan boshqaruv.</p>
        </div>
        
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Ism yoki telefon orqali qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CREATE MANAGER FORMA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Yangi Manager Qoʻshish</h2>
          
          {toast && (
            <div className={`p-3 rounded-xl text-xs font-semibold border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'}`}>
              {toast.text}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500">Ism *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Asilbek" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Familiya *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Silicon" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Telefon raqam *</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998901234567" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Tizim paroli *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Oylik Maoshi (UZS) *</label>
              <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(Number(e.target.value))} placeholder="5000000" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Rasm URL (Ixtiyoriy)</label>
              <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://image.com/photo.jpg" className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-blue-500"/>
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer">
              Managerni Saqlash
            </button>
          </form>
        </div>

        {/* LIST MANAGERS JADVALI */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mavjud Managerlar</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 rounded-full">
              Jami: {filteredManagers.length} ta
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Ism Familiya</th>
                  <th className="px-5 py-3">Telefon raqami</th>
                  <th className="px-5 py-3">Qoʻshilgan sana</th>
                  <th className="px-5 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 font-medium text-slate-400">Yuklanmoqda...</td>
                  </tr>
                ) : filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 font-medium text-slate-400">Managerlar topilmadi.</td>
                  </tr>
                ) : (
                  filteredManagers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                      <td className="px-5 py-3.5 font-semibold">{m.firstName} {m.lastName}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{m.phone}</td>
                      <td className="px-5 py-3.5 opacity-70">
                        {new Date(m.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/50 dark:border-red-900/40 transition-all cursor-pointer"
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

      </div>
    </div>
  );
};