import { useNavigate, useLocation } from 'react-router-dom';

import { AxiosError } from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { useState, type FormEvent } from 'react';
import { apiClient } from '../../../api/apiClient';

// Backend rol turlari
type Role = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';

// API'dan keladigan muvaffaqiyatli javob interfeysi
interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: Role;
  };
}

// Backend'dan keladigan xatolik xabari interfeysi
interface ApiErrorResponse {
  message?: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Kiritish maydonlari holati
  const [phone, setPhone] = useState<string>('+998900001122');
  const [password, setPassword] = useState<string>('Admin@12345');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Yo'naltirish manzilini aniqlash (RoleGuard tomonidan to'silgan sahifa yoki Dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Dastlabki qat'iy validatsiya
    if (!phone.trim() || !password.trim()) {
      setError('Iltimos, telefon raqam va parolni kiriting!');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Haqiqiy Backend API so'rovi
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        phone: phone.trim(),
        password: password.trim(),
      });

      const { user, accessToken } = response.data;
      
      // Zustand global holatini yangilash
      setAuth(user, accessToken);
      
      console.log(`✅ [Login] Tizimga kirildi. Rol: ${user.role}. Yo'naltirilmoqda: ${from}`);
      navigate(from, { replace: true });

    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      
      // Agar backend hali tayyor bo'lmasa, jamoa to'xtab qolmasligi uchun MOCK rejimga o'tadi
      if (!axiosError.response) {
        console.warn('⚠️ [API] Backend bilan aloqa yo`q. Vaqtinchalik tizimga kirish rejimi yoqildi.');
        
        // Mock rejim uchun tekshiruv (Parol: 123456 bo'lsa kiradi)
        if (password === '123456') {
          const mockUser = {
            id: 'usr-silicon-main',
            firstName: 'Asilbek',
            lastName: 'Lead',
            phone: phone,
            role: 'MANAGER' as Role, // Test uchun xohlagan rolni o'zgartirib ko'rishingiz mumkin
          };
          const mockToken = 'mock-jwt-access-token-for-team';
          
          setAuth(mockUser, mockToken);
          navigate(from, { replace: true });
        } else {
          setError('Telefon raqam yoki parol xato! (Vaqtinchalik test paroli: 123456)');
        }
      } else {
        // Backend'dan qaytgan haqiqiy xatolik xabarini chiqarish
        const errorMessage = axiosError.response.data?.message || 'Tizimga kirishda xatolik yuz berdi!';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 transition-colors duration-200">
        
        {/* Brending va Sarlavha */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary tracking-wider mb-2">
            SILICON CRM
          </h1>
          <p className="text-text-muted text-sm">
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        {/* Xatolik panelini ko'rsatish */}
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium transition-all animate-pulse">
            {error}
          </div>
        )}

        {/* Kirish Formasi */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="login-phone">
              Telefon raqam yoki Login
            </label>
            <input
              id="login-phone"
              type="text"
              autoComplete="username"
              placeholder="+998 (90) 123-4567"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="login-password">
              Parol
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Kirish Tugmasi va Yuklanish holati simulyatsiyasi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Tekshirilmoqda...
              </>
            ) : (
              'Tizimga kirish'
            )}
          </button>
        </form>

        {/* Tizim Osti Matni */}
        <div className="mt-8 text-center border-t border-border/60 pt-4">
          <span className="text-xs text-text-muted font-medium tracking-wide">
            Zarbdor Technical School © {new Date().getFullYear()}
          </span>
        </div>

      </div>
    </div>
  );
};