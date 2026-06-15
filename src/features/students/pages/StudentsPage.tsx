import { useState, useEffect } from 'react';
import { StudentFormModal } from '../components/StudentFormModal';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types/types';
import { studentService } from '../api/StudentService';

export const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination holatlari (Backend meta ma'lumotlariga qarab)
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Backenddan o'quvchilarni qidiruv va filtrlarga asosan yuklab olish
  const fetchStudents = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      
      // Backend kutayotgan Query parametrlarini shakllantirish
      const params: any = {
        page: pageNumber,
        limit: 10,
        search: searchTerm.trim() || undefined,
      };

      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const data = await studentService.getAll(params);
      
      // Sening backend toView() formati bo'yicha items keladi
      setStudents(data?.items || []);
      if (data?.meta) setMeta(data.meta);
    } catch (error) {
      console.error("Backenddan o'quvchilarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Har safar qidiruv matni yoki filtr o'zgarganda backenddan qayta tortadi
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(1);
    }, 400); // Serverga nagruzka tushmasligi uchun 400ms kutib keyin uradi

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  // Yangi talaba qo'shish tugmasi
  const handleCreateClick = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  // Tahrirlash tugmasi
  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // O'quvchini o'chirish (Soft-delete)
  const handleDeleteClick = async (id: string | number) => {
    if (confirm("Ushbu o'quvchini faolsizlantirmoqchimisiz? (Tizimga kira olmaydi)")) {
      try {
        await studentService.delete(id);
        fetchStudents(meta.page); // Ro'yxatni yangilash
      } catch (error) {
        alert("Xatolik yuz berdi");
      }
    }
  };

  // Faolsizlantirilgan o'quvchini qayta tiklash (Restore)
  const handleRestoreClick = async (id: string | number) => {
    try {
      await studentService.restore(id);
      fetchStudents(meta.page);
    } catch (error) {
      alert("Qayta tiklashda xatolik yuz berdi");
    }
  };

  // Formadan toza ma'lumot kelganda backend'ga yuborish
  const handleFormSubmit = async (data: CreateStudentInput | UpdateStudentInput) => {
    try {
      if (selectedStudent) {
        // Sening backend id ni parametrda qabul qiladi
        await studentService.update(selectedStudent.id, data as UpdateStudentInput);
      } else {
        await studentService.create(data as CreateStudentInput);
      }
      fetchStudents(1); // Birinchi sahifaga qaytib jadvalni yangilaydi
      setIsModalOpen(false);
    } catch (error) {
      console.error("Yuborishda xatolik:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-6 antialiased">
      
      {/* Sahifa Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">
            O‘quvchilar paneli
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Backend tizimi bilan to'liq integratsiya qilingan boshqaruv
          </p>
        </div>
        
        <button
          onClick={handleCreateClick}
          className="px-5 py-2.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          + Yangi o‘quvchi
        </button>
      </div>

      {/* Qidiruv va Filtrlar paneli */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="sm:col-span-3">
          <input
            type="text"
            placeholder="Ism, familiya yoki telefon orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c2541]/40 border border-[#3a506b]/30 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c2541]/40 border border-[#3a506b]/30 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-[#4cc9f0] transition-all cursor-pointer"
          >
            <option value="all">Barcha holatdagilar</option>
            <option value="active">Faqat Faol o‘quvchilar</option>
            <option value="inactive">Tark etganlar (Faolmas)</option>
          </select>
        </div>
      </div>

      {/* Asosiy Ma'lumotlar Jadvali */}
      <div className="bg-[#1c2541]/20 border border-[#3a506b]/20 rounded-2xl p-6 backdrop-blur-md">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-slate-400 animate-pulse">
            Serverdan ma'lumotlar yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Hech qanday o‘quvchi topilmadi.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3a506b]/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Ism Familiya</th>
                  <th className="pb-3">Telefon raqami</th>
                  <th className="pb-3">Tug‘ilgan sana</th>
                  <th className="pb-3">Boshlagan sana</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a506b]/10 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 pl-2 font-semibold text-white">
                      {student.firstName || student.fullName || `${student.firstName} ${student.lastName}`}
                    </td>
                    <td className="py-3.5 text-slate-300 font-mono">{student.phone}</td>
                    <td className="py-3.5 text-slate-400">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {student.startDate ? new Date(student.startDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5">
                      {student.isActive ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Faol
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Tark etgan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-2 space-x-2">
                      <button
                        onClick={() => handleEditClick(student)}
                        className="text-xs bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-blue-500/20 cursor-pointer"
                      >
                        Tahrirlash
                      </button>
                      
                      {student.isActive ? (
                        <button
                          onClick={() => handleDeleteClick(student.id)}
                          className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-rose-500/20 cursor-pointer"
                        >
                          O'chirish
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestoreClick(student.id)}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-emerald-500/20 cursor-pointer"
                        >
                          Tiklash
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Oddiygina chiroyli Pagination qismi (Agar sahifalar 1 tadan ko'p bo'lsa chiqadi) */}
            {meta.pages > 1 && (
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#3a506b]/20">
                <button
                  disabled={meta.page === 1}
                  onClick={() => fetchStudents(meta.page - 1)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs rounded-lg disabled:opacity-30 cursor-pointer text-slate-300"
                >
                  Oldingi
                </button>
                <span className="text-xs text-slate-400 self-center px-2">
                  {meta.page} / {meta.pages}
                </span>
                <button
                  disabled={meta.page === meta.pages}
                  onClick={() => fetchStudents(meta.page + 1)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs rounded-lg disabled:opacity-30 cursor-pointer text-slate-300"
                >
                  Keyingi
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <StudentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        student={selectedStudent}
      />
    </div>
  );
};