import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { groupsApi } from '../api/groups.api';
// ⚠️ Agar senda alohida roomsApi bo'lsa, uni import qil:
// import { roomsApi } from '../api/rooms.api';

// Backenddan keladigan Group interfeysi
interface Group {
  id: string;
  name: string;
  capacity: number;
  daysPattern: 'ODD' | 'EVEN';
  startTime: string;
  endTime: string;
  monthlyFee: number;
  isActive: boolean;
  roomId: string | null;
  deactivatedAt: string | null;
  deactivateReason: string | null;
  createdAt: string;
}

// Xona interfeysi
interface Room {
  id: string;
  name: string;
  capacity?: number;
}

interface MetaData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type FilterStatus = 'all' | 'active' | 'inactive';

export const GroupsPage = () => {
  // Guruhlar va Xonalar statelari
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]); // Xonalar ro'yxati uchun state
  const [meta, setMeta] = useState<MetaData>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRoomsLoading, setIsRoomsLoading] = useState<boolean>(false);

  // Qidiruv va Filtr holatlari
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [daysPatternFilter, setDaysPatternFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // Modal va Form holatlari
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  
  // Form elementlari
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number>(20);
  const [daysPattern, setDaysPattern] = useState<'ODD' | 'EVEN'>('ODD');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [monthlyFee, setMonthlyFee] = useState<string>('300 000');
  const [roomId, setRoomId] = useState<string>(''); // Tanlangan xona ID si

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Xonalarni backenddan yuklab olish funksiyasi
  const fetchRooms = useCallback(async () => {
    setIsRoomsLoading(true);
    try {
      // O'zingni loyihandagi roomsApi mock yoki real endpointga almashtirishing mumkin:
      // const response = await roomsApi.findAll();
      // setRooms(response?.data || []);
      
      // Vaqtinchalik mock ma'lumotlar (agar backend tayyor bo'lsa yuqoridagidek qilasiz)
      const mockRooms: Room[] = [
        { id: 'room-101', name: 'Frontend Xonasi (101)' },
        { id: 'room-102', name: 'Backend Xonasi (102)' },
        { id: 'room-103', name: 'Dizayn Xonasi (103)' },
      ];
      setRooms(mockRooms);
    } catch (err) {
      console.error('Xonalarni yuklashda xatolik:', err);
    } finally {
      setIsRoomsLoading(false);
    }
  }, []);

  // Komponent yuklanganda xonalarni bir marta olib kelamiz
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Backenddan guruhlarni yuklash funksiyasi
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const query: any = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        daysPattern: daysPatternFilter !== 'all' ? daysPatternFilter : undefined,
      };

      if (statusFilter === 'active') query.isActive = true;
      if (statusFilter === 'inactive') query.isActive = false;

      const response = await groupsApi.findAll(query);
      
      setGroups(response?.data?.items || []);
      setMeta(response?.data?.meta || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err: any) {
      console.error(err);
      setGroups([]); 
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, daysPatternFilter]);

  // Debounce effekti bilan qidiruv tizimi
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGroups();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [fetchGroups]);

  // .length xatoliklarini oldini olish uchun xavfsiz hisoblaydigan useMemo
  const safeGroupsList = useMemo(() => {
    return Array.isArray(groups) ? groups : [];
  }, [groups]);

  // Xona nomini ID bo'yicha jadvalda chiroyli ko'rsatish uchun helper
  const getRoomName = (id: string | null) => {
    if (!id) return 'Xona yo‘q';
    const foundRoom = rooms.find(r => r.id === id);
    return foundRoom ? foundRoom.name : id;
  };

  const getInitials = (title: string) => {
    if (!title) return 'G';
    const words = title.trim().split(' ');
    return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : title[0].toUpperCase();
  };

  const openCreateModal = () => {
    setToast(null);
    setEditingGroup(null);
    setName('');
    setCapacity(20);
    setDaysPattern('ODD');
    setStartTime('14:00');
    setEndTime('16:00');
    setMonthlyFee('300 000');
    setRoomId(''); // Default xona tanlanmagan
    setIsModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setToast(null);
    setEditingGroup(group);
    setName(group.name);
    setCapacity(group.capacity);
    setDaysPattern(group.daysPattern);
    setStartTime(group.startTime);
    setEndTime(group.endTime);
    setMonthlyFee(group.monthlyFee ? Number(group.monthlyFee).toLocaleString('fr-FR') : '0');
    setRoomId(group.roomId || ''); // Tahrirlashda guruh xonasi selectga o'tadi
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const cleanMonthlyFee = Number(monthlyFee.replace(/\s/g, ''));

    if (name.trim().length < 3 || name.trim().length > 60) {
      setToast({ type: 'error', text: 'Guruh nomi 3 tadan 60 tagacha belgidan iborat bo‘lishi kerak!' });
      return;
    }
    if (capacity < 1) {
      setToast({ type: 'error', text: 'Sig‘im kamida 1 ta bo‘lishi shart!' });
      return;
    }
    if (cleanMonthlyFee < 0) {
      setToast({ type: 'error', text: 'Oylik to‘lov manfiy bo‘lishi mumkin emas!' });
      return;
    }

    const payload: any = {
      name: name.trim(),
      capacity: Number(capacity),
      daysPattern,
      startTime,
      endTime,
      monthlyFee: cleanMonthlyFee,
      roomId: roomId || null, // Agar tanlanmagan bo'lsa null ketadi
    };

    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, payload);
        setToast({ type: 'success', text: 'Guruh muvaffaqiyatli tahrirlandi!' });
      } else {
        await groupsApi.create(payload);
        setToast({ type: 'success', text: 'Yangi guruh muvaffaqiyatli yaratildi!' });
      }
      fetchGroups();
      closeFormModal();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Amalni bajarishda xatolik yuz berdi!';
      setToast({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
    }
  };

  const handleToggleStatus = async (group: Group) => {
    if (group.isActive) {
      const reason = window.prompt('Guruhni arxivlash sababini kiriting (Ixtiyoriy):');
      if (reason === null) return;

      try {
        await groupsApi.remove(group.id, reason || undefined);
        fetchGroups();
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Xatolik yuz berdi');
      }
    } else {
      if (window.confirm('Guruhni qaytadan faol holatga oʻtkazmoqchimisiz?')) {
        try {
          await groupsApi.update(group.id, { isActive: true });
          fetchGroups();
        } catch (err: any) {
          alert(err?.response?.data?.message || 'Xatolik yuz berdi');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main p-6 antialiased transition-colors duration-300">
      
      {/* Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-wide uppercase">
            Guruhlar boshqaruvi
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Backend validatsiyalari va xonalar jadvaliga integratsiya qilingan tizim
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          + Yangi Guruh Yaratish
        </button>
      </div>

      {toast && !isModalOpen && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {toast.text}
        </div>
      )}

      {/* FILTR PANEL */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Guruh nomi bo'yicha qidirish..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-text-main placeholder:text-text-muted text-xs focus:outline-none focus:border-[#4cc9f0] transition-all"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={daysPatternFilter}
            onChange={e => { setDaysPatternFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto min-w-[140px] max-w-[200px] px-3 py-2.5 bg-card border border-border rounded-xl text-text-main text-xs font-bold focus:outline-none focus:border-[#4cc9f0] cursor-pointer"
          >
            <option value="all">📅 Kunlar (Hammasi)</option>
            <option value="ODD">Toq kunlar (ODD)</option>
            <option value="EVEN">Juft kunlar (EVEN)</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as FilterStatus); setPage(1); }}
            className="w-full sm:w-auto min-w-[140px] max-w-[200px] px-3 py-2.5 bg-card border border-border rounded-xl text-text-main text-xs font-bold focus:outline-none focus:border-[#4cc9f0] cursor-pointer"
          >
            <option value="all">🔄 Holati (Hammasi)</option>
            <option value="active">🟢 Faol guruhlar</option>
            <option value="inactive">🔴 Arxivlanganlar</option>
          </select>
        </div>
      </div>

      {/* JADVAL QISMI */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="pb-3 pl-2">Guruh Nomi & Xona</th>
                <th className="pb-3">Kun tartibi</th>
                <th className="pb-3">Dars Vaqti</th>
                <th className="pb-3">Narxi (UZS)</th>
                <th className="pb-3">Sig'imi</th>
                <th className="pb-3">Holati</th>
                <th className="pb-3 text-right pr-2">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-text-muted animate-pulse">Ma'lumotlar yuklanmoqda...</td>
                </tr>
              ) : safeGroupsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted text-sm font-medium">Hech qanday guruh topilmadi.</td>
                </tr>
              ) : (
                safeGroupsList.map((g) => (
                  <tr key={g?.id} className={`hover:bg-background/50 transition-colors ${!g?.isActive ? 'opacity-60 bg-black/5 dark:bg-white/5' : ''}`}>
                    <td className="py-3.5 pl-2 flex items-center gap-3 font-semibold text-text-main">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ring-2 ring-border ${
                        g?.isActive ? 'bg-gradient-to-br from-[#4361ee] to-[#3f37c9]' : 'bg-gray-500'
                      }`}>
                        {getInitials(g?.name || '')}
                      </div>
                      <div>
                        <div className={!g?.isActive ? 'line-through text-text-muted' : ''}>{g?.name}</div>
                        {/* Xona nomini dinamik chiqarish */}
                        <div className="text-[10px] text-text-muted font-mono uppercase">🚪 {getRoomName(g?.roomId)}</div>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${g?.daysPattern === 'ODD' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                        {g?.daysPattern === 'ODD' ? 'Toq kunlar (Du-Chor-Ju)' : 'Juft kunlar (Se-Pay-Sha)'}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-text-main font-semibold">{g?.startTime} - {g?.endTime}</td>
                    <td className="py-3.5 font-mono text-xs">{g?.monthlyFee ? Number(g.monthlyFee).toLocaleString('fr-FR') : 0} UZS</td>
                    <td className="py-3.5 text-xs font-semibold">{g?.capacity} ta o'quvchi</td>
                    <td className="py-3.5">
                      {g?.isActive ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md uppercase">Faol</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-md uppercase w-fit">Arxiv</span>
                          {g?.deactivateReason && <span className="text-[10px] text-rose-400 italic mt-0.5 max-w-[120px] truncate" title={g.deactivateReason}>Sabab: {g.deactivateReason}</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-2 space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(g)}
                        className="text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-amber-500/20 cursor-pointer"
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(g)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all border cursor-pointer ${
                          g?.isActive 
                            ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border-rose-500/20' 
                            : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border-emerald-500/20'
                        }`}
                      >
                        {g?.isActive ? 'Arxivlash' : 'Tiklash'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-xs text-text-muted">Jami guruhlar: {meta.total} ta</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-background border border-border rounded-xl text-xs disabled:opacity-50 cursor-pointer"
              >
                Oldingi
              </button>
              <span className="text-xs font-bold px-3 py-1 bg-border/20 rounded-xl">{page} / {meta.pages}</span>
              <button
                disabled={page === meta.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-background border border-border rounded-xl text-xs disabled:opacity-50 cursor-pointer"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL OYNASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            <button onClick={closeFormModal} className="absolute top-4 right-4 text-text-muted hover:text-text-main text-lg border-none bg-transparent cursor-pointer">✕</button>

            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              {editingGroup ? 'Guruh Maʻlumotlarini Tahrirlash' : 'Yangi Guruh Qoʻshish'}
            </h2>

            {toast && toast.type === 'error' && (
              <div className="mb-4 p-3 rounded-xl text-xs font-semibold border bg-rose-500/10 text-rose-500 border-rose-500/20">
                {toast.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-text-muted">Guruh Nomi * (3-60 ta belgi)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="NodeJS-9:00" className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Maksimal Sig'im *</label>
                  <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} min={1} className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Kun tartibi (Pattern) *</label>
                  <select value={daysPattern} onChange={e => setDaysPattern(e.target.value as 'ODD' | 'EVEN')} className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] cursor-pointer">
                    <option value="ODD">Toq kunlar (ODD)</option>
                    <option value="EVEN">Juft kunlar (EVEN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Boshlanish vaqti * (HH:MM)</label>
                  <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="14:00" className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs font-mono focus:outline-none focus:border-[#4cc9f0] transition-all" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-muted">Tugash vaqti * (HH:MM)</label>
                  <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="16:00" className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs font-mono focus:outline-none focus:border-[#4cc9f0] transition-all" required />
                </div>
              </div>

              {/* FORMATLANGAN OYLIK TO'LOV INPUTI */}
              <div>
                <label className="text-[11px] font-bold text-text-muted">Oylik To'lov Summasi * (UZS)</label>
                <input 
                  type="text" 
                  value={monthlyFee} 
                  onChange={e => {
                    const rawValue = e.target.value.replace(/\D/g, ''); 
                    const formattedValue = rawValue ? Number(rawValue).toLocaleString('fr-FR') : ''; 
                    setMonthlyFee(formattedValue);
                  }} 
                  placeholder="350 000" 
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] transition-all" 
                  required 
                />
              </div>

              {/* 🚪 XONA BIRIKTIRISH DINAMIK SELECTI */}
              <div>
                <label className="text-[11px] font-bold text-text-muted">Xona biriktirish (Dinamik)</label>
                <select
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs focus:outline-none focus:border-[#4cc9f0] cursor-pointer transition-all"
                >
                  <option value="">— Xona tanlanmagan (Ixtiyoriy) —</option>
                  
                  {isRoomsLoading ? (
                    <option disabled>Xonalar yuklanmoqda...</option>
                  ) : rooms.length === 0 ? (
                    <option disabled>Bo'sh xonalar topilmadi</option>
                  ) : (
                    rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        🚪 {room.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={closeFormModal} className="px-4 py-2 bg-background hover:bg-border/40 text-text-muted rounded-xl text-xs font-bold transition-all cursor-pointer">Bekor qilish</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer">{editingGroup ? 'Yangilash' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};