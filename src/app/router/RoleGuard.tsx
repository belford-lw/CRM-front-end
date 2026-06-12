import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, type Role } from '../../store/authStore';

interface RoleGuardProps {
  allowedRoles?: Role[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const location = useLocation();

  // 1. Orqa fonda F5 yuklanishi ketayotgan bo'lsa, spinner ko'rsatib turamiz
  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc]">
        <svg className="animate-spin h-9 w-9 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold opacity-70">Sessiya tiklanmoqda...</span>
      </div>
    );
  }

  // 2. Tizimga kirmagan bo'lsa, loginga otadi va kelgan linkini eslab qoladi
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Rol ruxsatlari to'g'ri kelmasa
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Hamma shartlar to'g'ri bo'lsa, sahifaga ruxsat
  return <Outlet />;
};