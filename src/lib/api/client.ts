import axios from 'axios';
import { API_BASE_URL } from './config';

const KEYS = {
  ACCESS: 'TBSS_ACCESS_TOKEN',
  REFRESH: 'TBSS_REFRESH_TOKEN',
  USER: 'TBSS_USER',
} as const;

export const tokenManager = {
  getAccess: () => localStorage.getItem(KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(KEYS.REFRESH),
  getUser: () => {
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(KEYS.ACCESS, access);
    localStorage.setItem(KEYS.REFRESH, refresh);
  },
  setUser: (user: unknown) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clearAll: () => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    localStorage.removeItem(KEYS.USER);
  },
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap the ApiResponse<T> envelope
client.interceptors.response.use((response) => {
  const body = response.data;
  if (body !== null && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = body.data;
  }
  return response;
});

client.interceptors.request.use((config) => {
  const token = tokenManager.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh once, else force logout
let refreshing: Promise<string> | null = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry || original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      refreshing ??= axios
        .post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: tokenManager.getRefresh() })
        .then(({ data: raw }) => {
          const payload = raw?.data ?? raw;
          tokenManager.setTokens(payload.accessToken, payload.refreshToken);
          return payload.accessToken as string;
        })
        .finally(() => { refreshing = null; });

      const token = await refreshing;
      original.headers['Authorization'] = `Bearer ${token}`;
      return client(original);
    } catch (refreshError) {
      tokenManager.clearAll();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export default client;
