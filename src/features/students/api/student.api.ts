import { apiClient } from '../../../api/apiClient';

export const studentsApi = {
  // Paginatsiya va qidiruv parametrlari bilan birga olish
  findAll: (params: { search?: string; isActive?: string; page?: number; limit?: number }) => {
    return apiClient.get('/students', { params });
  },
  
  findOne: (id: string) => {
    return apiClient.get(`/students/${id}`);
  },
  
  create: (payload: any) => {
    return apiClient.post('/students', payload);
  },
  
  update: (id: string, payload: any) => {
    return apiClient.patch(`/students/${id}`, payload);
  },
  
  remove: (id: string) => {
    return apiClient.delete(`/students/${id}`);
  },
  
  restore: (id: string) => {
    return apiClient.patch(`/students/${id}/restore`);
  }
};