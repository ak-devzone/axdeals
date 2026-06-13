import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  getProfile: () => api.get('/auth/profile'),
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
};

export const clickService = {
  track: (data) => api.post('/clicks/track', data),
};

export const wishlistService = {
  getAll:  ()         => api.get('/wishlist'),
  getIds:  ()         => api.get('/wishlist/ids'),
  add:     (id)       => api.post(`/wishlist/${id}`),
  remove:  (id)       => api.delete(`/wishlist/${id}`),
};

export default api;
