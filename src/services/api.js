import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    // só redireciona pro login se NÃO for rota pública
    const isPublic = err.config?.url?.startsWith('/public') ||
                     err.config?.url?.startsWith('/leads');
    if (err.response?.status === 401 && !isPublic) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;