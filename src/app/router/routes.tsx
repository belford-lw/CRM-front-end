import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RoleGuard } from './RoleGuard';
import { LoginPage } from '../../features/auth/pages/loginPage';
import MainLayout from '../../components/layout/MainLayout';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ProfilePage } from '../../features/profiles/pages/ProfilePage';
import { ManagersPage } from '../../features/manager/pages/ManagersPage';
import { StudentsPage } from '../../features/students/pages/StudentsPage';
import { GroupsPage } from '../../features/groups/pages/GroupsPage'; // <-- Guruhlar sahifasini import qildik

// O'qituvchilar sahifasi importi
import TeachersPage from '../../features/teachers/pages/TeachersPage';

// Xonalar sahifasi importi
import RoomsPage from '../../features/rooms/pages/RoomsPage';


export const router = createBrowserRouter([
  // 1. Ochiq sahifa (Faqat tizimga kirmaganlar uchun)
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // 2. To'liq himoyalangan CRM ichki tizimi
  {
    path: '/',
    element: <RoleGuard />, // Faqat Tizimga kirganini (token) tekshiradi
    children: [
      {
        element: <MainLayout />, // Tizimga kirgan bo'lsa Layout ichiga kiradi
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          // Rolga qarab o'zgaruvchi universal dashboard
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          // Hamma rollar ishlata oladigan shaxsiy profil sahifasi
          {
            path: 'profile',
            element: <ProfilePage />,
          },

          {
            element: <RoleGuard allowedRoles={['ADMIN']}/>,
            children: [
              {path: 'managers', element: <ManagersPage/>}
            ]
          },
          
          // ================= ADMIN, MANAGER VA TEACHER KIRALAYDIGAN JOYLAR =================
          // O'qituvchi ham guruh talabalari ro'yxatini ko'ra olishi uchun guruhlar sahifasini shu yerga oldik
          {
            element: <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']} />,
            children: [
              { path: 'groups', element: <GroupsPage /> }, // <-- Haqiqiy guruhlar sahifasi ulandi!
            ],
          },
          
          // ================= FAQAT ADMIN VA MANAGER KIRADIGAN JOYLAR =================
          {
            element: <RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />,
            children: [
              { path: 'students', element: <StudentsPage/> },
              { path: 'teachers', element: <TeachersPage /> },
              { path: 'rooms', element: <RoomsPage /> },
              { path: 'finance', element: <div className="p-6 text-text-main">Moliya sahifasi</div> },
            ],
          },

          // ================= FAQAT O'QITUVCHI KIRADIGAN JOYLAR =================
          {
            element: <RoleGuard allowedRoles={['TEACHER']} />,
            children: [
              { path: 'attendance', element: <div className="p-6 text-text-main">Davomat sahifasi</div> },
            ],
          },
        ],
      },
    ],
  },
  
  // Ruxsat berilmagan sahifa xabari
  {
    path: '/unauthorized',
    element: (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <h1 className="text-4xl font-extrabold text-red-500 mb-2">403 - Ruxsat yo'q</h1>
        <p className="text-text-muted max-w-sm">Sizning profilingiz orqali ushbu sahifaga kirish taqiqlangan!</p>
        <a href="/dashboard" className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Dashboardga qaytish</a>
      </div>
    ),
  },

  // Noto'g'ri link yozilsa hammasini bitta joyga yig'ish
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);