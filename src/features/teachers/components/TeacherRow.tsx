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
    <tr className="hover:bg-background/50 transition-colors group">
      <td className="py-3 pl-2">
        <img
          src={teacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName)}&background=4361ee&color=fff&size=40`}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-border shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName)}&background=random`;
          }}
        />
      </td>
      <td className="py-3.5 font-semibold text-text-main">
        {teacher.fullName}
      </td>
      <td className="py-3.5 text-text-main font-mono opacity-90">{teacher.phone}</td>
      <td className="py-3.5">
        {teacher.monthlySalary ? (
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Oylik: {parseFloat(String(teacher.monthlySalary)).toLocaleString()} so'm
          </span>
        ) : teacher.percentShare ? (
          <span className="bg-[#4361ee]/10 text-[#4361ee] dark:text-[#4cc9f0] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-[#4361ee]/20">
            Foiz: {teacher.percentShare}%
          </span>
        ) : (
          <span className="bg-text-main/10 text-text-muted text-[11px] px-2.5 py-1 rounded-lg">Belgilanmagan</span>
        )}
      </td>
      <td className="py-3.5">
        {teacher.isActive ? (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Faol
          </span>
        ) : (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Nofaol
          </span>
        )}
      </td>
      <td className="py-3.5 text-right pr-2 space-x-2">
        <button
          onClick={() => onEdit(teacher)}
          className="text-xs bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-blue-500/20 cursor-pointer"
        >
          Tahrirlash
        </button>
        
        {teacher.isActive ? (
          <button
            onClick={() => onDelete(teacher.id)}
            className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-rose-500/20 cursor-pointer"
          >
            Nofaol qilish
          </button>
        ) : (
          <button
            onClick={() => onRestore(teacher.id)}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white px-2.5 py-1 rounded-md transition-all border border-emerald-500/20 cursor-pointer"
          >
            Tiklash
          </button>
        )}
      </td>
    </tr>
  );
}