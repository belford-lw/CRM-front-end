import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

type Role = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';

interface NavigationItem {
  name: string;
  path: string;
  allowedRoles: Role[];
}

const navigationMenu: NavigationItem[] = [
  { name: 'Asosiy Dashboard', path: '/dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'] },
  { name: 'Manager', path: '/managers', allowedRoles: ['ADMIN', 'MANAGER'] }, 
  { name: 'Guruhlar', path: '/groups', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'O`quvchilar', path: '/students', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'O`qituvchilar', path: '/teachers', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Davomat', path: '/attendance', allowedRoles: ['TEACHER'] },
  { name: 'Moliya Bo`limi', path: '/finance', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Mening Profilim', path: '/profile', allowedRoles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'] },
];

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  
  // Real login foydalanuvchisi rolini olamiz, agar yo'q bo'lsa guard himoyalaydi
  const currentRole: Role = user?.role || 'MANAGER'; 

  const filteredMenu = navigationMenu.filter((item) => 
    item.allowedRoles.includes(currentRole)
  );

  return (
    // To'q ko'k (Deep Navy) shaffof va zamonaviy yon panel
    <aside className="w-64 bg-[#1c2541] border-r border-[#3a506b]/30 h-screen sticky top-0 flex flex-col justify-between antialiased">
      
      <div>
        {/* Brending logotipi: Yo'ldoshev CRM unikal gradientda */}
        <div className="h-20 flex items-center px-6 border-b border-[#3a506b]/30 bg-[#0b132b]/20">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] tracking-wider uppercase">
            Yo'ldoshev CRM
          </span>
        </div>
        
        {/* Navigatsiya menyusi */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                  isActive
                    // Aktiv menyu: Neon-ko'k gradient va yengil soya effekti
                    ? 'bg-gradient-to-r from-[#4361ee] to-[#3f37c9] text-white shadow-lg shadow-[#4361ee]/20'
                    // Passiv menyu: Shaffof hover effekti
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profil qismi: Pastki chiziq bilan ajratilgan oynasimon footer */}
      <div className="p-4 border-t border-[#3a506b]/30 bg-[#0b132b]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Avatar simulyatsiyasi (Ismning birinchi harfi bilan) */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4cc9f0] to-[#4361ee] flex items-center justify-center text-white font-black text-sm shadow-md">
            {(user?.firstName || 'J')[0].toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tizimga kirildi</p>
            <p className="text-xs font-black text-slate-200 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Jamoa A’zosi'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded-md bg-[#4cc9f0]/10 text-[#4cc9f0] uppercase tracking-widest border border-[#4cc9f0]/20">
              {currentRole}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
};