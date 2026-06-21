import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({ user: response.data, isLoading: false });
          return true;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          set({ user: response.data, isLoading: false });
          return true;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/auth/profile', userData);
          set({ user: response.data, isLoading: false });
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to update profile', isLoading: false });
          throw error;
        }
      },

      upgradePlan: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/upgrade');
          set({ user: response.data, isLoading: false });
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to upgrade plan', isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
