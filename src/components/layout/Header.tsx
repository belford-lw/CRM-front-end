
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

export const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="text-text-muted text-sm font-medium">
        Xush kelibsiz, bugun: {new Date().toLocaleDateString('uz-UZ')}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-background border border-border text-text-main hover:bg-card transition-colors text-sm font-medium"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        {/* Tizimdan Chiqish */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
        >
          Chiqish
        </button>
      </div>
    </header>
  );
};