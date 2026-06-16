
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

interface StudentRowProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
}

export default function StudentRow({ student, onEdit, onDelete, onRestore }: StudentRowProps) {
  // Sanani chiroyli formatlash uchun yordamchi funksiya
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('uz-UZ');
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-gray-600 dark:text-gray-300 text-sm border-b dark:border-gray-700">
      <td className="p-4 pl-6 font-medium text-gray-950 dark:text-white">
        {student.fullName}
      </td>
      <td className="p-4 font-mono">{student.phone}</td>
      <td className="p-4">{formatDate(student.dateOfBirth)}</td>
      <td className="p-4">{formatDate(student.startDate)}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          student.isActive 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        }`}>
          {student.isActive ? 'Faol' : 'Nofaol'}
        </span>
      </td>
      <td className="p-4 text-center flex justify-center gap-4">
        <button
          type="button"
          onClick={() => onEdit(student)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          Tahrirlash
        </button>
        
        {student.isActive ? (
          <button
            type="button"
            onClick={() => onDelete(student.id, student.fullName)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
          >
            O'chirish
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRestore(student.id, student.fullName)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
          >
            Tiklash
          </button>
        )}
      </td>
    </tr>
  );
}