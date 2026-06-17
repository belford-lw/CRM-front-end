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
  { name: 'Xonalar', path: '/rooms', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Davomat', path: '/attendance', allowedRoles: ['TEACHER'] },
  { name: 'Moliya Bo`limi', path: '/finance', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Mening Profilim', path: '/profile', allowedRoles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'] },
];

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const currentRole: Role = user?.role || 'MANAGER'; 

  const filteredMenu = navigationMenu.filter((item) => 
    item.allowedRoles.includes(currentRole)
  );

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col justify-between antialiased transition-colors duration-300">
      
      <div>
        {/* Brending logotipi */}
        <div className="h-20 flex items-center px-6 border-b border-border bg-background/30 backdrop-blur-md">
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
                    ? 'bg-gradient-to-r from-[#4361ee] to-[#3f37c9] text-white shadow-lg shadow-[#4361ee]/20'
                    : 'text-text-muted hover:bg-background/80 hover:text-text-main'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profil qismi */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4cc9f0] to-[#4361ee] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            {(user?.firstName || 'J')[0].toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tizimga kirildi</p>
            <p className="text-xs font-black text-text-main truncate transition-colors">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Jamoa A’zosi'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded-md bg-[#4361ee]/10 text-[#4361ee] dark:text-[#4cc9f0] uppercase tracking-widest border border-[#4361ee]/20">
              {currentRole}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};