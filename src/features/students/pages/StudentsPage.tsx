import { useState } from 'react';
import { StudentFormModal } from '../components/StudentFormModal';
import type { Student } from '../types/types';
import { studentService } from '../api/StudentService';


export const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Yangi talaba qo'shish bosilganda
  const handleCreateClick = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  // Tahrirlash tugmasi bosilganda (Jadval ichidan)
  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Formadan ma'lumot kelganda backend'ga yuborish
  const handleFormSubmit = async (data: any) => {
    if (selectedStudent) {
      // UPDATE
      await studentService.update(selectedStudent.id, data);
      alert("O'quvchi muvaffaqiyatli yangilandi!");
    } else {
      // CREATE
      await studentService.create(data);
      alert("Yangi o'quvchi qo'shildi!");
    }
    // Bu yerda jadvalni qayta yuklash (fetchStudents) funksiyasini chaqirib qo'yasiz jigar
  };

  return (
    <div className="p-6">
      <button onClick={handleCreateClick} className="bg-primary text-white px-4 py-2 rounded-lg">
        + O‘quvchi qo‘shish
      </button>

      {/* MODALNI SAHIFAGA QO'SHISH */}
      <StudentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        student={selectedStudent}
      />
    </div>
  );
};