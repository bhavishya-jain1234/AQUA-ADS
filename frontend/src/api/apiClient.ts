import axios from 'axios';

function resolveApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  // Same-origin /api — Vite dev & preview proxy to the backend; for hosted SPAs on a
  // different API host, set VITE_API_BASE_URL at build time.
  return '/api';
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
