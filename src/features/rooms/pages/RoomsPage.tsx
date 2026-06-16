import React, { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '../api/rooms.api'; 
import { useAuthStore } from '../../../store/authStore'; 
import RoomRow from '../components/RoomRow';
import RoomModal from '../components/RoomModal';

// Tiplarni import qilmasdan, mustaqil ravishda shu faylning o'zida yozdik
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Xonalar paneli</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Filtrlash, yaratish va xonalarni boshqarish tizimi</p>
        </div>
        {currentRole === 'ADMIN' && (
          <button
            onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition text-sm font-medium"
          >
            + Yangi xona
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 transition-colors duration-200">
        <input
          type="text"
          placeholder="Xona nomi yoki sig'imi bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Yuklanmoqda...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Hech qanday o'quv xonasi topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm border-b dark:border-gray-600">
                  <th className="p-4 pl-6">Xona nomi</th>
                  <th className="p-4">Sig'imi</th>
                  <th className="p-4">Holati</th>
                  <th className="p-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredRooms.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    onEdit={(r) => { setSelectedRoom(r); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
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