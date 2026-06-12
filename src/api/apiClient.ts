import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { useAuthStore } from "../store/authStore";


interface RefreshResponse {
  accessToken: string;
}

interface FailedQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: AxiosError | Error) => void;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // HTTP-Only Cookielarni doimiy yuborish uchun shart!
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. REQUEST INTERCEPTOR: Har bir so'rovga tokenni xotiradan olib qo'shadi
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: 401 xatoni tutib, tokenni avtomat yangilaydi
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Agar xatolik 401 bo'lsa va bu aynan refresh so'rovining o'zi bo'lmasa
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshResponse>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        const finalError = refreshError instanceof AxiosError ? refreshError : new Error(String(refreshError));
        processQueue(finalError, null);
        
        // Agar refresh token ham o'lik bo'lsa, tizimdan mutlaqo chiqaramiz
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(finalError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);