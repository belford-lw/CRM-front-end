import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // Dastlab localStorage'dan tekshiradi, bo'lmasa default 'dark' (CRM uchun dark tavsiya etiladi)
  theme: (localStorage.getItem('crm-theme') as Theme) || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('crm-theme', newTheme);
      return { theme: newTheme };
    }),
}));