
import { AxiosError } from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { apiClient } from '../../../api/apiClient';

// API xatolik javobi uchun interfeys
interface ApiErrorResponse {
  message?: string;
}

export const ProfilePage = () => {
  // Zustand stordan joriy foydalanuvchi ma'lumotlarini olamiz
  const user = useAuthStore((state) => state.user);

  // Parolni o'zgartirish formasi holatlari
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Tizim holatlari
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parol almashtirish so'rovi
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validatsiyalar
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Iltimos, barcha parollarni kiriting!');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak!');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yangi parollar bir-biriga mos kelmadi!');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Haqiqiy API so'rovi (Backend tayyor bo'lganda ishlaydi)
      await apiClient.post('/me/change-password', {
        oldPassword,
        newPassword,
      });

      setSuccess('Parolingiz muvaffaqiyatli o‘zgartirildi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;

      // Mock rejim (Agar backend ulangan bo'lmasa, sinab ko'rish uchun)
      if (!axiosError.response) {
        console.warn('⚠️ [Profile] Backend topilmadi, vaqtinchalik muvaffaqiyatli simulyatsiya yoqildi.');
        setSuccess('Parolingiz muvaffaqiyatli o‘zgartirildi! (Mock simulyatsiya)');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const msg = axiosError.response.data?.message || 'Parolni o‘zgartirishda xatolik yuz berdi!';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Foydalanuvchining roliga qarab rangli baddj (badge) tayyorlash
  const getRoleBadgeClass = (role?: string): string => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MANAGER': return 'bg-primary/10 text-primary border-primary/20';
      case 'TEACHER': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
      {/* Sarlavha butun blok uchun */}
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold text-text-main">Foydalanuvchi Profili</h1>
        <p className="text-text-muted text-sm">Shaxsiy ma'lumotlaringizni ko'rish va xavfsizlik sozlamalari</p>
      </div>

      {/* 1. MA'LUMOTLAR PANELI (Role ID-ga qarab) */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main">
                {user?.firstName || 'Ism'} {user?.lastName || 'Familiya'}
              </h2>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded border ${getRoleBadgeClass(user?.role)}`}>
                {user?.role || 'FOYDALANUVCHI'}
              </span>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-4">
            <div>
              <span className="text-xs text-text-muted block">Foydalanuvchi ID (Role ID)</span>
              <code className="text-sm font-mono text-text-main bg-background px-2 py-1 rounded border border-border block mt-1 break-all">
                {user?.id || 'ID-topilmadi'}
              </code>
            </div>

            <div>
              <span className="text-xs text-text-muted block">Telefon raqami</span>
              <span className="text-sm font-semibold text-text-main block mt-0.5">
                {user?.phone || 'Kiritilmagan'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-3 bg-background border border-border rounded-lg text-xs text-text-muted">
          Sizning tizimdagi huquqlaringiz ajratilgan rolingiz doirasida cheklangan. Ma'lumotlarni o'zgartirish uchun rahbariyatga murojaat qiling.
        </div>
      </div>

      {/* 2. PAROL ALMASHTIRISH PANELI */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text-main mb-1">Xavfsizlik va Parol</h3>
        <p className="text-text-muted text-xs mb-6">Tizimga kirish parolini istalgan vaqtda yangilashingiz mumkin</p>

        {/* Status xabarlari */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-lg font-medium">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="old-pass">
              Joriy parol
            </label>
            <input
              id="old-pass"
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1" htmlFor="new-pass">
                Yangi parol
              </label>
              <input
                id="new-pass"
                type="password"
                placeholder="Kamida 6 ta belgi"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1" htmlFor="confirm-pass">
                Yangi parolni tasdiqlang
              </label>
              <input
                id="confirm-pass"
                type="password"
                placeholder="Parolni qayta kiriting"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};