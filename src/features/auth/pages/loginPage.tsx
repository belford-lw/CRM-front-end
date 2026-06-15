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
    <div 
      // O'zgarish: before:backdrop-blur-sm butkul olib tashlandi (rasm tiniq bo'lishi uchun)
      // O'zgarish: before:bg-[#0b132b]/80 yordamida rasmning yorqinligi pasaytirildi (qorong'uroq qilindi)
      className="min-h-screen flex items-center justify-center p-4 antialiased bg-cover bg-center bg-no-repeat relative before:absolute before:inset-0 before:bg-[#0b132b]/60"
      style={{ 
        // O'quv markaz va zamonaviy dars xonasini ifodalovchi premium orqa fon rasmi
        backgroundImage: `url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1920&auto=format&fit=crop')` 
      }}
    >
      
      {/* Karta: Shaffof va Blur qilingan premium oynasimon Glassmorphism paneli */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 relative z-10 transition-all duration-300">
        
        {/* Brending va Sarlavha: Yo'ldoshev CRM */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] tracking-wide mb-2 uppercase drop-shadow-sm">
            Yo'ldoshev CRM
          </h1>
          <p className="text-slate-300/80 text-xs font-medium">
            O‘quv markazini boshqarish tizimiga kirish
          </p>
        </div>

        {/* Xatolik paneli */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl font-medium flex items-start gap-2.5 animate-fadeIn backdrop-blur-md">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Kirish Formasi */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Telefon Input Bloki */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2" htmlFor="login-phone">
              Telefon raqam yoki Login
            </label>
            <input
              id="login-phone"
              type="text"
              autoComplete="username"
              placeholder="+998 (90) 123-4567"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              // bg-white/10 va backdrop-blur-lg orqali orqa fon tiniq rasm bo'lsa ham input ichi chiroyli xira-oq bo'lib turadi
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/15 rounded-xl text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Parol Input Bloki */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2" htmlFor="login-password">
              Parol
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              // bg-white/10 va backdrop-blur-lg orqali orqa fon tiniq rasm bo'lsa ham input ichi chiroyli xira-oq bo'lib turadi
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/15 rounded-xl text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#4cc9f0] focus:ring-4 focus:ring-[#4cc9f0]/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Kirish Tugmasi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#4361ee] to-[#3f37c9] hover:from-[#4cc9f0] hover:to-[#4361ee] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#4361ee]/20 hover:shadow-[#4cc9f0]/20 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="tracking-wide">Tekshirilmoqda...</span>
              </>
            ) : (
              <span className="tracking-wide">Tizimga kirish</span>
            )}
          </button>
        </form>

        {/* Tizim Osti Matni */}
        <div className="mt-8 text-center border-t border-white/10 pt-4">
          <span className="text-[10px] text-slate-300 font-semibold tracking-widest uppercase block">
            Zarbdor Yo'ldoshev EduCenter © {new Date().getFullYear()}
          </span>
        </div>

      </div>
    </div>
  );
};