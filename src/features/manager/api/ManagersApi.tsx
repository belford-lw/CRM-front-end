import { apiClient } from '../../../api/apiClient';

// Backenddan keladigan menejerlar ro'yxati elementi turi
export interface ManagerListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
}

// Yangi menejer yaratish uchun payload
export interface CreateManagerPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password?: string;
  photoUrl?: string;
  monthlySalary: number;
}

// Menejerni tahrirlash uchun payload (hamma maydonlar ixtiyoriy - @IsOptional)
export interface UpdateManagerPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  monthlySalary?: number;
}

export const managersApi = {
  // Ro'yxatni olish
  list: async (): Promise<ManagerListItem[]> => {
    const response = await apiClient.get<ManagerListItem[]>('/managers');
    return response.data;
  },

  // Yangi menejer qo'shish
  create: async (payload: CreateManagerPayload): Promise<void> => {
    await apiClient.post('/managers', payload);
  },

  // MENEJERNI TAHRIRLASH (Yangi qo'shilgan qism)
  update: async (userId: string, payload: UpdateManagerPayload): Promise<void> => {
    await apiClient.patch(`/managers/${userId}`, payload);
  },

  // Tizimdan o'chirish
  remove: async (userId: string): Promise<void> => {
    await apiClient.delete(`/managers/${userId}`);
  },
};