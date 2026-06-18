// 1. Backenddan keladigan guruhning asosiy modeli (Prisma Group modeliga mos)
export interface Group {
  id: string;
  name: string;
  capacity: number;
  daysPattern: 'ODD' | 'EVEN';
  startTime: string; // HH:MM formatda (toView da o'girilgan)
  endTime: string;   // HH:MM formatda (toView da o'girilgan)
  monthlyFee: number;
  isActive: boolean;
  roomId: string | null;
  deactivatedAt: string | null;
  deactivateReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// 2. GroupsService.findAll qidiruv tizimi uchun Query parametrlari (QueryGroupDto)
export interface QueryGroupDto {
  search?: string;
  daysPattern?: 'ODD' | 'EVEN';
  isActive?: boolean;
  roomId?: string;
  page?: number;
  limit?: number;
}

// 3. Yangi guruh ochish uchun ma'lumotlar turi (CreateGroupDto)
export interface CreateGroupDto {
  name: string;
  capacity: number;
  daysPattern: 'ODD' | 'EVEN';
  startTime: string; // "14:00"
  endTime: string;   // "16:00"
  monthlyFee: number;
  roomId?: string; // Ixtiyoriy
}

// 4. Guruhni tahrirlash uchun ma'lumotlar turi (UpdateGroupDto)
export interface UpdateGroupDto extends Partial<CreateGroupDto> {
  isActive?: boolean;
  deactivateReason?: string;
}

// 5. Guruh statistikasi uchun tur (getStats repf-ga mos)
export interface GroupStats {
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

// 6. Guruh ichidagi o'quvchilar ro'yxati uchun tur (getGroupStudents-ga mos)
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

// 7. Frontend filtrlash paneli uchun holat turi
export type FilterStatus = 'all' | 'active' | 'inactive';