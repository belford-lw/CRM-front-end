import type { Room } from "../pages/RoomsPage";

interface RoomRowProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string, name: string) => void;
}

export default function RoomRow({ room, onEdit, onDelete }: RoomRowProps) {
  return (
    <tr className="hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors group">
      <td className="py-3.5 pl-2 font-semibold text-slate-900 dark:text-white">
        {room.name}
      </td>
      <td className="py-3.5">
        <span className="bg-[#4361ee]/10 dark:bg-[#4cc9f0]/10 text-[#4361ee] dark:text-[#4cc9f0] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#4361ee]/20 dark:border-[#4cc9f0]/20">
          {room.capacity} ta o'quvchi
        </span>
      </td>
      <td className="py-3.5">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
          room.isActive 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {room.isActive ? 'Faol' : 'Nofaol'}
        </span>
      </td>
      <td className="py-3.5 text-right pr-2 space-x-2">
        <button
          type="button"
          onClick={() => onEdit(room)}
          className="text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-amber-500/20 cursor-pointer"
        >
          Tahrirlash
        </button>
        <button
          type="button"
          onClick={() => onDelete(room.id, room.name)}
          className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-rose-500/20 cursor-pointer"
        >
          O'chirish
        </button>
      </td>
    </tr>
  );
}