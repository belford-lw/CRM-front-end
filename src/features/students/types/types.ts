// Role enum (Backend Prisma modeliga mos)
export type Role = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';

// O'quvchi modeli
export interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  dateOfBirth?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null; // Soft-delete uchun
}

// Create Student Dto
export interface CreateStudentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  dateOfBirth?: string;
  startDate?: string;
}

// Update Student Dto
export interface UpdateStudentInput extends CreateStudentInput {
  isActive?: boolean;
}

// QueryStudentDto (Filtrlash va Pagination uchun)
export interface QueryStudentDto {
  page?: number;
  limit?: number;
  search?: string;     // Ism, familiya yoki telefon bo'yicha qidiruv
  isActive?: boolean;  // Faollik holati bo'yicha filter
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API dan qaytadigan umumiy ro'yxat formati (Pagination bilan)
export interface PaginatedStudentsResponse {
  data: Student[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}