import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { apiClient } from './api/apiClient';
import { router } from './app/router/routes';

interface RefreshResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  };
}

function App() {
  const theme = useThemeStore((state) => state.theme);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const isInitializing = useAuthStore((state) => state.isInitializing); // Yuklanish holatini olamiz

  // Dark/Light Mode boshqaruvi
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // F5 (Refresh) bo'lganda sessiyani tekshirish zanjiri
  useEffect(() => {
    const initSessiya = async (): Promise<void> => {
      // 1. Agar xotirada (Zustand) allaqachon token bo'lsa, backendga qayta so'rov urmaymiz
      if (useAuthStore.getState().accessToken) {
        setInitializing(false);
        return;
      }

      try {
        // 2. HTTP-Only Cookie orqali sessiyani tekshirish va tokenni yangilash
        const response = await apiClient.post<RefreshResponse>('/auth/refresh');
        const { user, accessToken } = response.data;
        
        // Storni yangilaymiz (Zustand ichida initializing avtomat false bo'lishi ham mumkin, lekin kafolatlaymiz)
        setAuth(user, accessToken);
        console.log('🔄 [Auth] Haqiqiy backend sessiyasi muvaffaqiyatli tiklandi.');
      } catch (error) {
        console.warn('🔄 [Auth] Faol ochiq sessiya topilmadi yoki backend oʻchiq: ', error);
      } finally {
        // ⚡ MUHIM: So'rov muvaffaqiyatli bo'lsa ham, xato bo'lsa ham yuklanish (initializing) tugashi shart!
        setInitializing(false);
      }
    };

    initSessiya();
  }, [setAuth, setInitializing]);

  // Tizim to'liq tekshirib bo'linguncha routerni render qilmay turamiz.
  // Bu komponentlar (masalan, Sidebar) yuklanganda token topilmay "Logout" bo'lib ketishining oldini oladi.
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-text-main">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-text-muted">Tizim yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;