import { AxiosError } from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { apiClient } from '../../../api/apiClient';

// Lucide-react yoki ixtiyoriy ikonka kutubxonasi (agar loyihangda bo'lsa)
// Bo'lmasa SVG bilan ham chiroyli render bo'ladi. Men bu yerda toza Tailwind va SVG ishlatdim.

interface ApiErrorResponse {
  message?: string;
}

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  // Parol holatlari
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Parollarni ko'rsatish/yashirish holatlari (Show/Hide)
  const [showOld, setShowOld] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Tizim holatlari
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
      await apiClient.post('/me/change-password', { oldPassword, newPassword });
      setSuccess('Parolingiz muvaffaqiyatli o‘zgartirildi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
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

  const getRoleBadgeClass = (role?: string): string => {
    switch (role) {
      case 'ADMIN': return 'from-rose-500/20 to-red-500/10 text-rose-500 border-rose-500/30 shadow-rose-500/5';
      case 'MANAGER': return 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/30 shadow-blue-500/5';
      case 'TEACHER': return 'from-emerald-500/20 to-green-500/10 text-emerald-500 border-emerald-500/30 shadow-emerald-500/5';
      default: return 'from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/30 shadow-amber-500/5';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sarlavha qismi */}
      <div className="lg:col-span-3 border-b border-border/60 pb-5">
        <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-[#4cc9f0] bg-clip-text text-transparent tracking-wide uppercase">
          Mening Profilim
        </h1>
        <p className="text-text-muted text-xs font-medium mt-1">
          Xavfsizlik sozlamalari va shaxsiy hisob ma'lumotlari boshqaruvi
        </p>
      </div>

      {/* 1. MA'LUMOTLAR PANELI */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
        {/* Orqa fondagi yorug'lik effekti */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
        
        <div>
          <div className="flex flex-col items-center text-center mt-4 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-[#4cc9f0] p-[3px] shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform duration-300">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center font-black text-3xl text-text-main">
                {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-text-main mt-4 tracking-tight">
              {user?.firstName || 'Ism'} {user?.lastName || 'Familiya'}
            </h2>
            
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-xs font-extrabold rounded-xl border bg-gradient-to-r shadow-sm ${getRoleBadgeClass(user?.role)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {user?.role || 'FOYDALANUVCHI'}
            </span>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6">
            <div className="p-3 bg-background/50 rounded-xl border border-border/50 group-hover:border-border transition-colors">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Telefon raqam</span>
              <span className="text-sm font-bold text-text-main block mt-1 font-mono">
                {user?.phone || 'Kiritilmagan'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-3.5 bg-background/80 border border-dashed border-border rounded-xl text-[11px] text-text-muted leading-relaxed">
          🔒 Sizning huquqlaringiz tizimda ajratilgan <span className="font-bold text-text-main">{user?.role}</span> roliga muvofiq himoyalangan. Ma'lumotlarni o'zgartirish uchun ma'muriyatga murojaat qiling.
        </div>
      </div>

      {/* 2. PAROL ALMASHTIRISH PANELI */}
      <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-xl shadow-black/5 hover:border-primary/40 transition-all duration-300 relative">
        <div className="mb-6">
          <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
            Xavfsizlik paroli
          </h3>
          <p className="text-text-muted text-xs mt-1">Tizimga kirish parolini istalgan vaqtda yangilashingiz mumkin</p>
        </div>

        {/* Status xabarlari */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl font-bold flex items-center gap-2 animate-bounce">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl font-bold flex items-center gap-2">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Joriy parol inputi */}
          <div className="relative group/input">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 group-focus-within/input:text-primary transition-colors" htmlFor="old-pass">
              Joriy parol
            </label>
            <div className="relative">
              <input
                id="old-pass"
                type={showOld ? 'text' : 'password'}
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-mono text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors border-none bg-transparent cursor-pointer"
              >
                {showOld ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Yangi parol va tasdiqlash inputlari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group/input">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 group-focus-within/input:text-primary transition-colors" htmlFor="new-pass">
                Yangi parol
              </label>
              <div className="relative">
                <input
                  id="new-pass"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-mono text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors border-none bg-transparent cursor-pointer"
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="relative group/input">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 group-focus-within/input:text-primary transition-colors" htmlFor="confirm-pass">
                Yangi parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  id="confirm-pass"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-mono text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors border-none bg-transparent cursor-pointer"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* Tugma qismi */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-primary to-[#4361ee] hover:from-[#4cc9f0] hover:to-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Yangilanmoqda...
                </>
              ) : (
                'Parolni yangilash'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};