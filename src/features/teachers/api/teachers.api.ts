import { apiClient } from "../../../api/apiClient";

export const teachersApi = {
  // Alohida API yaratmasdan, tayyor apiClient'dan foydalanamiz
  findAll: (query: Record<string, any>) => apiClient.get('/teachers', { params: query }),
  
  create: (payload: any) => apiClient.post('/teachers', payload),
  
  update: (id: string | number, payload: any) => apiClient.patch(`/teachers/${id}`, payload),
  
  remove: (id: string | number) => apiClient.delete(`/teachers/${id}`),
  
  restore: (id: string | number) => apiClient.patch(`/teachers/${id}/restore`),
};