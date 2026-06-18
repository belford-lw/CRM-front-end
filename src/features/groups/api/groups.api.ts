import axios from 'axios';

// ==========================================
// 📑 GURURHLAR MODULI UCHUN MA'LUMOT TURLARI (TYPES & DTOS)
// ==========================================

// Backenddan keladigan Guruhning asosiy modeli (Service dagi toView formatiga mos)
export interface Group {
  id: string;
  name: string;
  capacity: number;
  daysPattern: 'ODD' | 'EVEN';
  startTime: string; // HH:MM formatda
  endTime: string;   // HH:MM formatda
  monthlyFee: number;
  isActive: boolean;
  roomId: string | null;
  deactivatedAt: string | null;
  deactivateReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination va Meta ma'lumotlar formati
export interface MetaData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// findAll so'rovi uchun Query parametrlari (QueryGroupDto ga to'liq mos)
export interface QueryGroupDto {
  search?: string;
  daysPattern?: 'ODD' | 'EVEN';
  isActive?: boolean | string; // string shaklida ham yuborilishi mumkin
  roomId?: string;
  page?: number;
  limit?: number;
}

// Yangi guruh ochish uchun ma'lumotlar (CreateGroupDto ga mos)
export interface CreateGroupDto {
  name: string;
  capacity: number;
  daysPattern: 'ODD' | 'EVEN';
  startTime: string; // "14:00"
  endTime: string;   // "16:00"
  monthlyFee: number;
  roomId?: string | null;
}

// Guruhni tahrirlash uchun ma'lumotlar (UpdateGroupDto ga mos)
export interface UpdateGroupDto {
  name?: string;
  capacity?: number;
  daysPattern?: 'ODD' | 'EVEN';
  startTime?: string;
  endTime?: string;
  monthlyFee?: number;
  roomId?: string | null;
  isActive?: boolean;
  deactivateReason?: string;
}

// Guruh statistikasi uchun javob turi (getStats metodiga mos)
export interface GroupStatsResponse {
  group: {
    id: string;
    name: string;
    isActive: boolean;
    capacity: number;
  };
  activeEnrollments: number;
  remaining: number;
  isFull: boolean;
}

// Guruh o'quvchilari ro'yxati uchun javob turi (getGroupStudents metodiga mos)
export interface GroupStudentListItem {
  enrollmentId: string;
  studentId: string;
  userId: string;
  fullName: string;
  phone: string;
  joinDate: string;
}

export interface GroupStudentsResponse {
  group: {
    id: string;
    name: string;
  };
  students: GroupStudentListItem[];
}

// ==========================================
// 🚀 AXIOS SO'ROVLARI (GROUPS API)
// ==========================================

// Tokenlar JwtAuthGuard uchun interceptor yoki global tarzda birikadi deb hisoblaymiz
const api = axios.create({ baseURL: '/api' }); 

export const groupsApi = {
  /**
   * 1. Yangi guruh yaratish (Create)
   * Backend: @Post() create(@Body() dto: CreateGroupDto)
   */
  create: (data: CreateGroupDto) => 
    api.post<Group>('/groups', data),

  /**
   * 2. Guruhlarni filtrlari va sahifalari bilan olish (FindAll)
   * Backend: @Get() findAll(@Query() q: QueryGroupDto)
   */
  findAll: (params: QueryGroupDto) => 
    api.get<{ meta: MetaData; items: Group[] }>('/groups', { params }),

  /**
   * 3. Bitta guruhni ID orqali olish (FindOne)
   * Backend: @Get(':id') findOne(@Param('id') id: string)
   */
  findOne: (id: string | number) => 
    api.get<Group>(`/groups/${id}`),

  /**
   * 4. Guruh statistikasini olish (Sig'im, qolgan joylar va h.k.)
   * Backend: @Get(':id/stats') getStats(@Param('id') id: string)
   */
  getStats: (id: string | number) => 
    api.get<GroupStatsResponse>(`/groups/${id}/stats`),

  /**
   * 5. Guruh ichidagi faol o'quvchilar ro'yxatini olish
   * Backend: @Get(':id/students') getStudents(@Param('id') id: string)
   */
  getStudents: (id: string | number) => 
    api.get<GroupStudentsResponse>(`/groups/${id}/students`),

  /**
   * 6. Guruh ma'lumotlarini qisman yangilash (Update)
   * Backend: @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateGroupDto)
   */
  update: (id: string | number, data: UpdateGroupDto) => 
    api.patch<Group>(`/groups/${id}`, data),

  /**
   * 7. Guruhni arxivlash / soft-delete qilish
   * Backend: @Delete(':id') remove(@Param('id') id: string, @Query('reason') reason?: string)
   */
  remove: (id: string | number, reason?: string) => 
    api.delete<Group>(`/groups/${id}`, { params: { reason } }),
};