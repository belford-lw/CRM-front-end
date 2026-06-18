import { apiClient } from '../../../api/apiClient';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types/types';

// Backenddan keladigan pagination (findAll) javob formati
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
  /**
   * 1. Barcha o'quvchilarni backenddan filtrlari bilan olish
   * Backend @Get() findAll(@Query() q: QueryStudentDto) metodiga mos keladi
   */
  getAll: async (params?: { search?: string; isActive?: boolean | string; page?: number; limit?: number }): Promise<FindAllResponse> => {
    const response = await apiClient.get<FindAllResponse>('/students', { params });
    return response.data;
  },

  /**
   * 2. Bitta o'quvchini ID orqali batafsil ma'lumotlarini olish
   * Backend @Get(':id') findOne(@Param('id') id: string) metodiga mos keladi
   */
  getById: async (id: string | number): Promise<Student> => {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  },

  /**
   * 3. Yangi o'quvchi yaratish (Create)
   * Backend @Post() create(@Body() dto: CreateStudentDto) metodiga mos keladi
   */
  create: async (data: CreateStudentInput): Promise<Student> => {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  },

  /**
   * 4. O'quvchi ma'lumotlarini qisman yangilash (Update)
   * Backend @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateStudentDto) metodiga mos keladi
   */
  update: async (id: string | number, data: UpdateStudentInput): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  /**
   * 5. O'quvchini faolsizlantirish (Soft-delete: user.isActive = false)
   * Backend @Delete(':id') remove(@Param('id') id: string) metodiga mos keladi
   */
  delete: async (id: string | number): Promise<any> => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  /**
   * 6. Faolsizlantirilgan o'quvchini qayta tiklash (Restore)
   * Backend @Patch(':id/restore') restore(@Param('id') id: string) metodiga mos keladi
   */
  restore: async (id: string | number): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}/restore`);
    return response.data;
  }
};