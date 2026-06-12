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
      // ⚡ CHAQMOQ TEZKORLIGIDAGI TEKSHIRUV:
      // Agar Zustand tepada sinxron tarzda sessionStorage'dan tokenni topib bo'lgan bo'lsa,
      // ortiqcha async kutishlarsiz va backendga so'rov urmasdan jarayonni shu yerda tugatamiz!
      if (useAuthStore.getState().accessToken) {
        setInitializing(false);
        return;
      }

      try {
        // Agar zaxirada (sessionStorage) hech narsa bo'lmasa, demak real production rejimdamiz.
        // Haqiqiy backend cookie orqali sessiyani tekshiramiz.
        const response = await apiClient.post<RefreshResponse>('/auth/refresh');
        const { user, accessToken } = response.data;
        setAuth(user, accessToken);
        console.log('🔄 [Auth] Haqiqiy backend sessiyasi muvaffaqiyatli tiklandi.');
      } catch (error) {
        console.warn('🔄 [Auth] Faol ochiq sessiya topilmadi yoki backend oʻchiq.' + error);
        setInitializing(false); // Token mutlaqo yo'q bo'lsa yuklanish tugaydi va RoleGuard loginga otadi
      }
    };

    initSessiya();
  }, [setAuth, setInitializing]);

  return <RouterProvider router={router} />;
}

export default App;