
// TO'G'RILANGAN JOYI: Tip boshqa fayldan import qilinmadi, shu yerning o'zida yaratildi!
export interface Room {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomRowProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string, name: string) => void;
}

export default function RoomRow({ room, onEdit, onDelete }: RoomRowProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-gray-600 dark:text-gray-300 text-sm border-b dark:border-gray-700">
      <td className="p-4 pl-6 font-medium text-gray-950 dark:text-white">
        {room.name}
      </td>
      <td className="p-4">
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded">
          {room.capacity} ta o'quvchi
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          room.isActive 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        }`}>
          {room.isActive ? 'Faol' : 'Nofaol'}
        </span>
      </td>
      <td className="p-4 text-center flex justify-center gap-4">
        <button
          type="button"
          onClick={() => onEdit(room)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          Tahrirlash
        </button>
        <button
          type="button"
          onClick={() => onDelete(room.id, room.name)}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
        >
          O'chirish
        </button>
      </td>
    </tr>
  );
}