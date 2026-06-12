import { useAuthStore } from "../../../store/authStore";


// === 1. MANAGER & ADMIN DASHBOARD ===
const ManagerDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <h4 className="text-sm font-medium text-text-muted">Umumiy guruhlar</h4>
        <p className="text-3xl font-bold text-text-main mt-2">24 ta</p>
      </div>
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <h4 className="text-sm font-medium text-text-muted">Jami o'quvchilar</h4>
        <p className="text-3xl font-bold text-primary mt-2">342 ta</p>
      </div>
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <h4 className="text-sm font-medium text-text-muted">Oylik tushum</h4>
        <p className="text-3xl font-bold text-green-500 mt-2">+45,000,000 UZS</p>
      </div>
    </div>
    <div className="p-6 bg-card border border-border rounded-xl">
      <h3 className="text-lg font-bold text-text-main mb-2">Manager vazifalari</h3>
      <p className="text-text-muted text-sm">Bu yerda yangi arizalar, lidlar oqimi va qarzdorlar ro'yxati filtri joylashadi.</p>
    </div>
  </div>
);

// === 2. TEACHER DASHBOARD ===
const TeacherDashboard = () => (
  <div className="space-y-6">
    <div className="p-6 bg-card border border-border rounded-xl">
      <h2 className="text-xl font-bold text-text-main mb-2">Ustoz, dars jadvalingiz</h2>
      <p className="text-text-muted text-sm">Bugungi faol guruhlaringiz va davomat qilinishi kerak bo'lgan darslar ro'yxati.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-background border border-border rounded-lg">
        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">14:00 - Node.js Backend</span>
        <p className="text-sm font-medium text-text-main mt-2">Xona: Turing xonasi (3-qavat)</p>
      </div>
      <div className="p-4 bg-background border border-border rounded-lg">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">16:30 - Frontend React</span>
        <p className="text-sm font-medium text-text-main mt-2">Xona: Zamonaviy xona (2-qavat)</p>
      </div>
    </div>
  </div>
);

// === 3. STUDENT DASHBOARD ===
const StudentDashboard = () => (
  <div className="space-y-6">
    <div className="p-6 bg-card border border-border rounded-xl text-center md:text-left">
      <h2 className="text-xl font-bold text-text-main">Mening O'quv Markazim</h2>
      <p className="text-text-muted text-sm mt-1">Vazifalar holati, oylik to'lovlar balansi va o'zlashtirish reytingi.</p>
    </div>
    <div className="p-6 bg-card border border-border rounded-xl">
      <h3 className="text-md font-bold text-text-main mb-3">Bugungi uyga vazifa</h3>
      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-sm text-text-main">
        React Router mantiqini va login sahifasini to'liq ulash (Muddati: Bugun 23:59 gacha).
      </div>
    </div>
  </div>
);

// === ASOSIY UNIVERSAL KOMPONENT ===
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  // Foydalanuvchining roliga qarab tegishli dashboardni aniqlaymiz
  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'ADMIN':
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      default:
        return (
          <div className="p-6 text-center text-text-muted">
            Rolingiz aniqlanmadi. Tizim administratoriga murojaat qiling.
          </div>
        );
    }
  };

  return (
    <div className="p-1 space-y-4">
      <div>
        <h1 className="text-2xl font-black text-text-main tracking-tight">Dashboard</h1>
        <p className="text-xs text-text-muted">
          Tizimga xush kelibsiz, <strong className="text-primary">{user?.firstName} {user?.lastName}</strong> ({user?.role})
        </p>
      </div>
      
      {/* Tanlangan dashboard interfeysi yuklanadi */}
      {renderDashboardByRole()}
    </div>
  );
};