import { create } from 'zustand';

export type Role = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setInitializing: (status: boolean) => void;
  clearAuth: () => void;
}

// 🔥 F5 MUAMMOSINI ILDIZI BILAN YO'QOTISH: 
// Dastur yuklanishidan oldin sessionStorage'ni sinxron o'qib olamiz
const getInitialState = () => {
  const storedUser = sessionStorage.getItem('mock_user');
  const storedToken = sessionStorage.getItem('mock_token');

  if (storedUser && storedToken) {
    try {
      return {
        user: JSON.parse(storedUser) as User,
        accessToken: storedToken,
        isAuthenticated: true,
        isInitializing: false, // Token srazu borligi uchun yuklanish spinneri ham shart emas!
      };
    } catch (e) {
      return null;
      console.log(e);
      
    }
  }
  return null;
};

// Agar sessionStorage bo'lsa o'shani oladi, bo'lmasa standart qiymatda ochiladi
const defaultState = getInitialState() || {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...defaultState,

  setAuth: (user, accessToken) => {
    // 💡 Avtomatlashtirish: setAuth chaqirilganda o'zi sessionStorage'ga yozib qo'yadi.
    // LoginPage'da qo'lda yozib o'tirish shart emas!
    sessionStorage.setItem('mock_user', JSON.stringify(user));
    sessionStorage.setItem('mock_token', accessToken);
    
    set({ user, accessToken, isAuthenticated: true, isInitializing: false });
  },

  setAccessToken: (accessToken) => set({ accessToken }),
  setInitializing: (status) => set({ isInitializing: status }),

  clearAuth: () => {
    // Tizimdan chiqilganda tozalash
    sessionStorage.removeItem('mock_user');
    sessionStorage.removeItem('mock_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
  },
}));