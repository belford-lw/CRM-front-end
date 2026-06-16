import { apiClient } from '../../../api/apiClient'; 

// Ichki foydalanish uchun lokal tiplar
interface ApiRoom {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roomsApi = {
  findAll: () => {
    return apiClient.get<ApiRoom[]>('/rooms');
  },
  findOne: (id: string) => {
    return apiClient.get<ApiRoom>(`/rooms/${id}`);
  },
  create: (payload: any) => {
    return apiClient.post<ApiRoom>('/rooms', payload);
  },
  update: (id: string, payload: any) => {
    return apiClient.patch<ApiRoom>(`/rooms/${id}`, payload);
  },
  remove: (id: string) => {
    return apiClient.delete<ApiRoom>(`/rooms/${id}`);
  },
};