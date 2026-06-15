import { apiClient } from '../../../api/apiClient';
import type { CreateStudentInput, Student, UpdateStudentInput } from '../types/types';

// Backenddan keladigan pagination formati uchun interfeys
interface FindAllResponse {
  items: Student[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const studentService = {
  // Barcha o'quvchilarni backenddan filtrlari bilan olish
  getAll: async (params?: { search?: string; isActive?: boolean | string; page?: number; limit?: number }): Promise<FindAllResponse> => {
    const response = await apiClient.get<FindAllResponse>('/students', { params });
    return response.data;
  },

  // Yangi o'quvchi yaratish (Create)
  create: async (data: CreateStudentInput): Promise<Student> => {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  },

  // O'quvchi ma'lumotlarini yangilash (Update)
  update: async (id: string | number, data: UpdateStudentInput): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  // O'quvchini faolsizlantirish (Soft-delete: isActive = false)
  delete: async (id: string | number): Promise<any> => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  // Faolsizlantirilgan o'quvchini qayta tiklash (Restore)
  restore: async (id: string | number): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}/restore`);
    return response.data;
  }
};