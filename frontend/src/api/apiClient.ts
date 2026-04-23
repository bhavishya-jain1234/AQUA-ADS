import axios from 'axios';

function resolveApiBaseUrl(): string {
  let explicit = import.meta.env.VITE_API_BASE_URL?.trim();
  if (explicit) {
    if (!explicit.startsWith('http://') && !explicit.startsWith('https://')) {
      // If it starts with a slash, we prepend window.location.origin
      if (explicit.startsWith('/')) {
        explicit = (typeof window !== 'undefined' ? window.location.origin : '') + explicit;
      } else {
        explicit = 'https://' + explicit;
      }
    }
    const cleanUrl = explicit.replace(/\/$/, '');
    if (cleanUrl) return cleanUrl;
  }
  return typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Don't override Authorization header if it's already set (e.g., for admin requests)
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('aqua_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
