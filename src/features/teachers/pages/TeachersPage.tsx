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
      } else {
        await teachersApi.create(payload);
      }
      setIsModalOpen(false);
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Amal bajarilmadi.";
      alert("Xatolik: " + (Array.isArray(errMsg) ? errMsg.join('\n') : errMsg));
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!id || !window.confirm("O'qituvchi holatini nofaol qilmoqchimisiz? (Tizimga kira olmaydi)")) return;
    try {
      await teachersApi.remove(id);
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      alert(error.response?.data?.message || "O'chirishda xatolik.");
    }
  };

  const handleRestore = async (id: string | number) => {
    if (!id) return;
    try {
      await teachersApi.restore(id);
      loadTeachers(search, isActive, page);
    } catch (error: any) {
      alert(error.response?.data?.message || "Tiklashda xatolik.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main p-6 antialiased transition-colors duration-300">
      
      {/* Sahifa Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-wide uppercase">
            O‘qituvchilar paneli
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Backend tizimi bilan to'liq integratsiya qilingan ustozlar boshqaruvi
          </p>
        </div>
        
        <button
          onClick={() => { setSelectedTeacher(null); setIsModalOpen(true); }}
          className="px-5 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          + Yangi o‘qituvchi
        </button>
      </div>

      {/* Qidiruv va Filtrlar paneli */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="sm:col-span-3">
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text-main placeholder:text-text-muted text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all duration-300"
          />
        </div>
        <div>
          <select
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text-main text-sm focus:outline-none focus:border-[#4cc9f0] transition-all duration-300 cursor-pointer"
          >
            <option value="true" className="bg-card text-text-main">Faol o'qituvchilar</option>
            <option value="false" className="bg-card text-text-main">Nofaol o'qituvchilar</option>
          </select>
        </div>
      </div>

      {/* Asosiy Ma'lumotlar Jadvali */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors duration-300">
        {loading ? (
          <div className="text-center py-12 text-sm text-text-muted animate-pulse">
            Serverdan ma'lumotlar yuklanmoqda...
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm font-medium">
            Hech qanday o‘qituvchi topilmadi.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-16">Rasm</th>
                  <th className="pb-3">To'liq ism</th>
                  <th className="pb-3">Telefon raqami</th>
                  <th className="pb-3">To'lov sxemasi</th>
                  <th className="pb-3">Holati</th>
                  <th className="pb-3 text-right pr-2">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
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
            
            {/* Pagination boshqaruvi */}
            {meta.pages > 1 && (
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 bg-background border border-border text-xs rounded-lg disabled:opacity-30 cursor-pointer text-text-muted hover:bg-border/40 transition-all"
                >
                  Oldingi
                </button>
                <span className="text-xs text-text-muted self-center px-2">
                  {page} / {meta.pages}
                </span>
                <button
                  disabled={page === meta.pages}
                  onClick={() => setPage(p => Math.min(p + 1, meta.pages))}
                  className="px-3 py-1.5 bg-background border border-border text-xs rounded-lg disabled:opacity-30 cursor-pointer text-text-muted hover:bg-border/40 transition-all"
                >
                  Keyingi
                </button>
              </div>
            )}
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