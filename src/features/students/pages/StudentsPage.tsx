import React, { useState, useEffect, useCallback } from 'react';
import { studentsApi } from '../api/student.api'; // To'g'ri API yo'li
import { useAuthStore } from '../../../store/authStore';
import StudentRow from '../components/StudentRow'; // O'zgartirildi: Faqat komponentning o'zi qoldi
import StudentModal from '../components/StudentModal';

// TO'G'RILANGAN JOYI: Student interfeysi mustaqil ravishda shu faylning o'ziga yozildi!
export interface Student {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  dateOfBirth: string | null;
  startDate: string | null;
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Backend Pagination va Filtr holatlari
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('true'); // Standart: Faollar
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const user = useAuthStore((state: any) => state.user);
  const currentRole = user?.role || 'MANAGER';

  // Serverdan ma'lumotlarni yuklash funksiyasi
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        limit: 10,
      };

      if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
      if (isActiveFilter !== 'all') queryParams.isActive = isActiveFilter;

      const response = await studentsApi.findAll(queryParams);
      
      if (response.data && Array.isArray(response.data.items)) {
        setStudents(response.data.items as Student[]);
        setTotalPages(response.data.meta.pages || 1);
      }
    } catch (error: any) {
      console.error("Studentlarni yuklashda xatolik:", error);
      alert(error.response?.data?.message || "Studentlarni yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, isActiveFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Qidiruv inputi uchun Debounce (400ms kechikish)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Qidiruv o'zgarganda birinchi sahifaga qaytamiz
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Forma topshirilganda (Yaratish / Tahrirlash)
  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedStudent) {
        await studentsApi.update(selectedStudent.id, payload);
        alert("Student muvaffaqiyatli yangilandi!");
      } else {
        await studentsApi.create(payload);
        alert("Yangi student muvaffaqiyatli yaratildi!");
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Amal bajarilmadi.";
      alert(Array.isArray(errMsg) ? errMsg.join('\n') : errMsg);
    }
  };

  // Soft Delete (Nofaol qilish)
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" studentini nofaol holatga o'tkazmoqchimisiz?`)) return;
    try {
      await studentsApi.remove(id);
      alert("Student o'chirildi (nofaol qilindi).");
      fetchStudents();
    } catch (error: any) {
      alert(error.response?.data?.message || "Xatolik yuz berdi.");
    }
  };

  // Restore (Qayta faollashtirish)
  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" studentini qayta faollashtirmoqchimisiz?`)) return;
    try {
      await studentsApi.restore(id);
      alert("Student qayta faollashtirildi.");
      fetchStudents();
    } catch (error: any) {
      alert(error.response?.data?.message || "Xatolik yuz berdi.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Studentlar paneli</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">O'quvchilarni boshqarish, filtrlash va sahifalash tizimi</p>
        </div>
        <button
          onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition text-sm font-medium"
        >
          + Yangi student
        </button>
      </div>

      {/* Filter paneli */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 transition-colors duration-200">
        <input
          type="text"
          placeholder="Ism, familiya yoki telefon bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <select
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="true">Faqat Faollar</option>
          <option value="false">Faqat Nofaollar</option>
          <option value="all">Barcha studentlar</option>
        </select>
      </div>

      {/* Jadval qismi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Yuklanmoqda...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Hech qanday o'quvchi topilmadi.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm border-b dark:border-gray-600">
                    <th className="p-4 pl-6">F.I.O</th>
                    <th className="p-4">Telefon</th>
                    <th className="p-4">Tug'ilgan sanasi</th>
                    <th className="p-4">Boshlagan sanasi</th>
                    <th className="p-4">Holati</th>
                    <th className="p-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {students.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student as any}
                      onEdit={(s) => { setSelectedStudent(s as any); setIsModalOpen(true); }}
                      onDelete={handleDelete}
                      onRestore={handleRestore}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginatsiya boshqaruvi */}
            {totalPages > 1 && (
              <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-sm disabled:opacity-50 text-gray-700 dark:text-gray-200"
                >
                  Orqaga
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Sahifa {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-sm disabled:opacity-50 text-gray-700 dark:text-gray-200"
                >
                  Oldinga
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editData={selectedStudent}
      />
    </div>
  );
}