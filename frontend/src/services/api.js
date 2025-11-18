import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавить токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pyrus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pyrus_token');
      localStorage.removeItem('pyrus_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data) => api.put('/users/password', data),
  setPin: (pin) => api.put('/users/pin', { pin }),
  searchUsers: (query) => api.get('/users/search', { params: { query } }),
};

// Chat API
export const chatAPI = {
  getUserChats: () => api.get('/chats'),
  createChat: (data) => api.post('/chats', data),
  getChatMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data, file) => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (data.content) {
      formData.append('content', data.content);
    }
    formData.append('type', data.type || 'text');

    return api.post(`/chats/${chatId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
};

export default api;
