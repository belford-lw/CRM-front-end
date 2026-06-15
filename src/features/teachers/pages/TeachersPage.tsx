import React, { useState, useEffect, useCallback } from 'react';
import { teachersApi } from '../api/teachers.api';
import TeacherRow from '../components/TeacherRow';
import TeacherModal from '../components/TeacherModal';

interface Teacher {
  id: string | number;
  userId?: string | number;
  fullName: string;
  phone: string;
  photoUrl?: string;
  monthlySalary?: string | number | null;
  percentShare?: string | number | null;
  isActive: boolean;
}

interface MetaData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  items: Teacher[];
  meta?: MetaData;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [meta, setMeta] = useState<MetaData>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  
  const [search, setSearch] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('true');
  const [page, setPage] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const loadTeachers = useCallback(async (currentSearch: string, currentIsActive: string, currentPage: number) => {
    setLoading(true);
    try {
      const query = {
        search: currentSearch.trim() || undefined,
        isActive: currentIsActive || undefined,
        page: currentPage,
        limit: 10
      };
      
      const response = await teachersApi.findAll(query);
      const data = response.data as ApiResponse;
      
      if (data && data.items) {
        setTeachers(data.items);
        setMeta({
          page: Number(data.meta?.page) || currentPage,
          limit: Number(data.meta?.limit) || 10,
          total: Number(data.meta?.total) || data.items.length,
          pages: Number(data.meta?.pages) || 1
        });
      }
    } catch (error: any) {
      console.error("Yuklashda xatolik:", error);
      if (error.response?.status === 401) {
        alert("Sessiya muddati tugagan! Iltimos, qaytadan tizimga kiring.");
        return;
      }
      const errMsg = error.response?.data?.message || "Server bilan bog'lanishda xatolik.";
      alert(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadTeachers(search, isActive, page);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, isActive, page, loadTeachers]);

  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedTeacher && selectedTeacher.id) {
        await teachersApi.update(selectedTeacher.id, payload);
        alert("Muvaffaqiyatli yangilandi!");
      } else {
        await teachersApi.create(payload);
        alert("Muvaffaqiyatli yaratildi!");
      }
      setIsModalOpen(false);
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Amal bajarilmadi.";
      alert("Xatolik: " + (Array.isArray(errMsg) ? errMsg.join('\n') : errMsg));
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!id || !window.confirm("O'qituvchi holatini nofaol qilmoqchimisiz?")) return;
    try {
      await teachersApi.remove(id);
      alert("O'qituvchi holati nofaol qilindi.");
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      alert(error.response?.data?.message || "O'chirishda xatolik.");
    }
  };

  const handleRestore = async (id: string | number) => {
    if (!id) return;
    try {
      await teachersApi.restore(id);
      alert("O'qituvchi faoliyati qayta tiklandi.");
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      alert(error.response?.data?.message || "Tiklashda xatolik.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">O'qituvchilar paneli</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Filtrlash, yaratish va boshqarish tizimi</p>
        </div>
        <button
          onClick={() => { setSelectedTeacher(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition text-sm font-medium"
        >
          + Yangi o'qituvchi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 transition-colors duration-200">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">Faol o'qituvchilar</option>
            <option value="false">Nofaol o'qituvchilar</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Yuklanmoqda...</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Hech qanday o'qituvchi topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm border-b dark:border-gray-600">
                  <th className="p-4 w-16">Rasm</th>
                  <th className="p-4">To'liq ism</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">To'lov sxemasi</th>
                  <th className="p-4">Holati</th>
                  <th className="p-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {teachers.map((teacher) => (
                  <TeacherRow
                    key={teacher.id || teacher.userId}
                    teacher={teacher}
                    onEdit={(t: Teacher) => { setSelectedTeacher(t); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && meta.pages > 1 && (
          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Jami {meta.total} tadan {teachers.length} tasi ko'rsatilmoqda</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                Oldingi
              </button>
              <span className="px-3 py-1 font-medium text-gray-800 dark:text-gray-200">{page} / {meta.pages}</span>
              <button
                disabled={page === meta.pages}
                onClick={() => setPage(p => Math.min(p + 1, meta.pages))}
                className="px-3 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>

      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editData={selectedTeacher}
      />
    </div>
  );
}