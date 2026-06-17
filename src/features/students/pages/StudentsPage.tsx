import { useState, useEffect } from 'react';
import { StudentFormModal } from '../components/StudentFormModal';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types/types';
import { studentService } from '../api/StudentService';

export const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchStudents = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      
      const params: any = {
        page: pageNumber,
        limit: 10,
        search: searchTerm.trim() || undefined,
      };

      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const data = await studentService.getAll(params);
      
      setStudents(data?.items || []);
      if (data?.meta) setMeta(data.meta);
    } catch (error) {
      console.error("Backenddan o'quvchilarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const handleCreateClick = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string | number) => {
    if (confirm("Ushbu o'quvchini faolsizlantirmoqchimisiz? (Tizimga kira olmaydi)")) {
      try {
        await studentService.delete(id);
        fetchStudents(meta.page);
      } catch (error) {
        alert("Xatolik yuz berdi");
      }
    }
  };

  const handleRestoreClick = async (id: string | number) => {
    try {
      await studentService.restore(id);
      fetchStudents(meta.page);
    } catch (error) {
      alert("Qayta tiklashda xatolik yuz berdi");
    }
  };

  const handleFormSubmit = async (data: CreateStudentInput | UpdateStudentInput) => {
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.id, data as UpdateStudentInput);
      } else {
        await studentService.create(data as CreateStudentInput);
      }
      fetchStudents(1);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Yuborishda xatolik:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main p-6 antialiased transition-colors duration-300">
      
      {/* Sahifa Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-wide uppercase">
            O‘quvchilar paneli
          </h1>
          <p className="text-xs text-text-muted mt-1">
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
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text-main placeholder:text-text-muted text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/10 transition-all duration-300"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text-main text-sm focus:outline-none focus:border-[#4cc9f0] transition-all duration-300 cursor-pointer"
          >
            <option value="all" className="bg-card text-text-main">Barcha holatdagilar</option>
            <option value="active" className="bg-card text-text-main">Faqat Faol o‘quvchilar</option>
            <option value="inactive" className="bg-card text-text-main">Tark etganlar (Faolmas)</option>
          </select>
        </div>
      </div>

      {/* Asosiy Ma'lumotlar Jadvali */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors duration-300">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-text-muted animate-pulse">
            Serverdan ma'lumotlar yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm font-medium">
            Hech qanday o‘quvchi topilmadi.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-16">Rasm</th>
                  <th className="pb-3">Ism Familiya</th>
                  <th className="pb-3">Telefon raqami</th>
                  <th className="pb-3">Tug‘ilgan sana</th>
                  <th className="pb-3">Boshlagan sana</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {students.map((student) => {
                  const studentName = student.fullName || `${student.firstName} ${student.lastName || ''}`.trim();
                  return (
                    <tr key={student.id} className="hover:bg-background/50 transition-colors group">
                      <td className="py-3 pl-2">
                        <img
                          src={student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=4361ee&color=fff&size=40`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border border-border shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`;
                          }}
                        />
                      </td>
                      <td className="py-3.5 font-semibold text-text-main">
                        {studentName}
                      </td>
                      <td className="py-3.5 text-text-main font-mono opacity-90">{student.phone}</td>
                      <td className="py-3.5 text-text-muted">
                        {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('uz-UZ') : '-'}
                      </td>
                      <td className="py-3.5 text-text-muted">
                        {student.startDate ? new Date(student.startDate).toLocaleDateString('uz-UZ') : '-'}
                      </td>
                      <td className="py-3.5">
                        {student.isActive ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Faol
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Tark etgan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="text-xs bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-blue-500/20 cursor-pointer"
                        >
                          Tahrirlash
                        </button>
                        
                        {student.isActive ? (
                          <button
                            onClick={() => handleDeleteClick(student.id)}
                            className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-rose-500/20 cursor-pointer"
                          >
                            O'chirish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreClick(student.id)}
                            className="text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-emerald-500/20 cursor-pointer"
                          >
                            Tiklash
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination boshqaruvi */}
            {meta.pages > 1 && (
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button
                  disabled={meta.page === 1}
                  onClick={() => fetchStudents(meta.page - 1)}
                  className="px-3 py-1.5 bg-background border border-border text-xs rounded-lg disabled:opacity-30 cursor-pointer text-text-muted hover:bg-border/40 transition-all"
                >
                  Oldingi
                </button>
                <span className="text-xs text-text-muted self-center px-2">
                  {meta.page} / {meta.pages}
                </span>
                <button
                  disabled={meta.page === meta.pages}
                  onClick={() => fetchStudents(meta.page + 1)}
                  className="px-3 py-1.5 bg-background border border-border text-xs rounded-lg disabled:opacity-30 cursor-pointer text-text-muted hover:bg-border/40 transition-all"
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