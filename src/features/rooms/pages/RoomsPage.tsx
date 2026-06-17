import { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '../api/rooms.api'; 
import { useAuthStore } from '../../../store/authStore'; 
import RoomRow from '../components/RoomRow';
import RoomModal from '../components/RoomModal';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  name: string;
  capacity: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const user = useAuthStore((state: any) => state.user);
  const currentRole = user?.role || 'MANAGER';

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roomsApi.findAll();
      if (Array.isArray(response.data)) {
        setRooms(response.data as Room[]);
      }
    } catch (error: any) {
      console.error("Xonalarni yuklashda xatolik:", error);
      alert(error.response?.data?.message || "Xonalarni yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) =>
        room.name.toLowerCase().includes(term) || String(room.capacity).includes(term)
      );
      setFilteredRooms(filtered);
    }
  }, [debouncedSearch, rooms]);

  const handleFormSubmit = async (payload: CreateRoomPayload) => {
    try {
      if (selectedRoom) {
        await roomsApi.update(selectedRoom.id, payload);
        alert("Xona muvaffaqiyatli yangilandi!");
      } else {
        await roomsApi.create(payload);
        alert("Yangi xona muvaffaqiyatli yaratildi!");
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Amal bajarilmadi.";
      alert(Array.isArray(errMsg) ? errMsg.join('\n') : errMsg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" xonasini ro'yxatdan o'chirmoqchimisiz?`)) return;
    try {
      await roomsApi.remove(id);
      alert("Xona o'chirildi.");
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || "O'chirishda xatolik yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b132b] text-slate-800 dark:text-slate-100 p-6 antialiased transition-colors duration-300">
      
      {/* Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide uppercase">
            Xonalar paneli
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Filtrlash, yaratish va xonalarni CRM tizimida boshqarish
          </p>
        </div>
        
        {currentRole === 'ADMIN' && (
          <button
            onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-wider cursor-pointer"
          >
            + Yangi xona
          </button>
        )}
      </div>

      {/* Qidiruv input paneli */}
      <div className="w-full mb-6">
        <input
          type="text"
          placeholder="Xona nomi yoki sig'imi bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-[#1c2541]/40 border border-slate-200 dark:border-[#3a506b]/30 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
        />
      </div>

      {/* Jadval paneli */}
      <div className="bg-white dark:bg-[#1c2541]/20 border border-slate-200 dark:border-[#3a506b]/20 rounded-2xl p-6 shadow-sm backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-[#3a506b]/10">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mavjud o'quv xonalari</h2>
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-100 dark:bg-[#1c2541]/60 border border-slate-200 dark:border-[#3a506b]/30 text-[#4361ee] dark:text-[#4cc9f0] rounded-full">
            Jami: {filteredRooms.length} ta
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#3a506b]/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Xona nomi</th>
                <th className="pb-3">Sig'imi</th>
                <th className="pb-3">Holati</th>
                <th className="pb-3 text-right pr-2">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3a506b]/10 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-slate-400 animate-pulse">Yuklanmoqda...</td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 text-sm font-medium">Hech qanday o'quv xonasi topilmadi.</td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    onEdit={(r) => { setSelectedRoom(r); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editData={selectedRoom}
        currentRole={currentRole}
      />
    </div>
  );
}