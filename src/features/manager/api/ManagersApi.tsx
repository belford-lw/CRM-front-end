import { apiClient } from '../../../api/apiClient';

// Backenddan keladigan menejerlar ro'yxati elementi turi
export interface ManagerListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

// Yangi menejer yaratish uchun payload (CreateManagerDto ga mos)
export interface CreateManagerPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string; // Backendda majburiy bo'lgani uchun ? olib tashlandi
  photoUrl?: string;
  monthlySalary: number;
}

// Menejerni tahrirlash uchun payload (UpdateManagerDto ga mos)
export interface UpdateManagerPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  monthlySalary?: number;
}

export const managersApi = {
  /**
   * Barcha menejerlar ro'yxatini olish
   * Backend: GET /managers (Faqat ADMINlar uchun)
   */
  list: async (): Promise<ManagerListItem[]> => {
    const response = await apiClient.get<ManagerListItem[]>('/managers');
    return response.data;
  },

  /**
   * Yangi menejer qo'shish
   * Backend: POST /managers (Faqat ADMINlar uchun)
   */
  create: async (payload: CreateManagerPayload): Promise<ManagerListItem> => {
    const response = await apiClient.post<ManagerListItem>('/managers', payload);
    return response.data;
  },

  /**
   * Menejer ma'lumotlarini tahrirlash
   * Backend: PATCH /managers/:userId (Faqat ADMINlar uchun)
   */
  update: async (userId: string, payload: UpdateManagerPayload): Promise<ManagerListItem> => {
    const response = await apiClient.patch<ManagerListItem>(`/managers/${userId}`, payload);
    return response.data;
  },

  /**
   * Menejerni tizimdan o'chirish
   * Backend: DELETE /managers/:userId (Faqat ADMINlar uchun)
   */
  remove: async (userId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/managers/${userId}`);
    return response.data;
  },
};