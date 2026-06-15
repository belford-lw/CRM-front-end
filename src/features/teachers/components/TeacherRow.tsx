import React from 'react';

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

interface TeacherRowProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string | number) => void;
  onRestore: (id: string | number) => void;
}

export default function TeacherRow({ teacher, onEdit, onDelete, onRestore }: TeacherRowProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-gray-600 dark:text-gray-300 text-sm border-b dark:border-gray-700">
      <td className="p-4">
        <img
          src={teacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName)}&background=indigo&color=fff&size=40`}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border dark:border-gray-600"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName)}&background=random`;
          }}
        />
      </td>
      <td className="p-4 font-medium text-gray-950 dark:text-white">{teacher.fullName}</td>
      <td className="p-4">{teacher.phone}</td>
      <td className="p-4">
        {teacher.monthlySalary ? (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded">
            Oylik: {parseFloat(String(teacher.monthlySalary)).toLocaleString()} so'm
          </span>
        ) : teacher.percentShare ? (
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded">
            Foiz: {teacher.percentShare}%
          </span>
        ) : (
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-0.5 rounded">Belgilanmagan</span>
        )}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          teacher.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        }`}>
          {teacher.isActive ? 'Faol' : 'Noaktiv'}
        </span>
      </td>
      <td className="p-4 text-center flex justify-center gap-3">
        <button 
          onClick={() => onEdit(teacher)} 
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          Tahrirlash
        </button>
        
        {teacher.isActive ? (
          <button 
            onClick={() => onDelete(teacher.id)} 
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
          >
            Nofaol qilish
          </button>
        ) : (
          <button 
            onClick={() => onRestore(teacher.id)} 
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
          >
            Tiklash
          </button>
        )}
      </td>
    </tr>
  );
}