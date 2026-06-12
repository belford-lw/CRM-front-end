import { apiClient } from '../../../api/apiClient';
import type { CreateStudentInput, Student, UpdateStudentInput } from '../types/types';

export const studentService = {
  // Yangi o'quvchi yaratish (Create)
  create: async (data: CreateStudentInput): Promise<Student> => {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  },

  // O'quvchi ma'lumotlarini yangilash (Update)
  update: async (id: string, data: UpdateStudentInput): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },
};