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
  { name: 'Guruhlar', path: '/groups', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'O‘quvchilar', path: '/students', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'O‘qituvchilar', path: '/teachers', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Davomat', path: '/attendance', allowedRoles: ['TEACHER'] },
  { name: 'Moliya Bo‘limi', path: '/finance', allowedRoles: ['ADMIN', 'MANAGER'] },
  { name: 'Mening Profilim', path: '/profile', allowedRoles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'] },
];

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  
  // Haqiqiy login bo'lguncha jamoaga ko'rinib turishi uchun vaqtinchalik rol
  const currentRole: Role = user?.role || 'MANAGER'; 

  const filteredMenu = navigationMenu.filter((item) => 
    item.allowedRoles.includes(currentRole)
  );

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-xl font-bold text-primary tracking-wider">SILICON CRM</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-background hover:text-text-main'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border bg-background/50">
        <p className="text-xs text-text-muted">Tizimga kirildi:</p>
        <p className="text-sm font-semibold text-text-main truncate">
          {user?.firstName || 'Jamoa A’zosi'}
        </p>
        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary">
          {currentRole}
        </span>
      </div>
    </aside>
  );
};