import { apiClient } from "../../../api/apiClient";

// Backend list() qaytaradigan ma'lumotlar shakli
export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

// CreateManagerDto talab qiladigan maydonlar
export interface CreateManagerPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  monthlySalary: number;
  photoUrl?: string;
}

export const managersApi = {
  // GET /managers
  getAll: async (): Promise<Manager[]> => {
    try {
      const response = await apiClient.get<Manager[]>('/managers');
      return response.data;
    } catch (error) {
      console.warn('⚠️ [API] Backend offline. Vaqtinchalik bazadan oqilmoqda...');
      const local = sessionStorage.getItem('crm_dynamic_users');
      return local ? JSON.parse(local) : [];
    }
  },

  // POST /managers
  create: async (dto: CreateManagerPayload): Promise<any> => {
    try {
      const response = await apiClient.post('/managers', dto);
      return response.data;
    } catch (error) {
      // Backend yo'q bo'lsa login ishlayverishi uchun sinov rejimida saqlash
      const newMock: Manager = {
        id: `user-id-${Date.now()}`,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        createdAt: new Date().toISOString(),
      };
      
      const local = sessionStorage.getItem('crm_dynamic_users');
      const current = local ? JSON.parse(local) : [];
      // Login tekshira olishi uchun parolni ham qo'shib saqlaymiz
      sessionStorage.setItem('crm_dynamic_users', JSON.stringify([...current, { ...newMock, password: dto.password, role: 'MANAGER' }]));
      return newMock;
    }
  },

  // DELETE /managers/:userId
  delete: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/managers/${userId}`);
    } catch (error) {
      const local = sessionStorage.getItem('crm_dynamic_users');
      if (local) {
        const filtered = JSON.parse(local).filter((u: any) => u.id !== userId);
        sessionStorage.setItem('crm_dynamic_users', JSON.stringify(filtered));
      }
    }
  }
};
