import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: string }>) => {
    const status = err.response?.status;
    const msg = err.response?.data?.error;

    if (status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (status === 403) {
      toast.error('Você não tem permissão para esta ação.');
    } else if (status === 409) {
      toast.error(msg || 'Conflito de dados.');
    } else if (status === 422) {
      toast.error(msg || 'Dados inválidos. Verifique o formulário.');
    } else if (status && status >= 500) {
      toast.error('Erro no servidor. Tente novamente em instantes.');
    }

    return Promise.reject(err);
  }
);

export default api;