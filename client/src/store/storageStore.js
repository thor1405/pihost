import { create } from 'zustand';
import api from '../services/api';

export const useStorageStore = create((set, get) => ({
  files: [],
  isLoading: false,
  error: null,

  fetchFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/storage');
      set({ files: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch files', isLoading: false });
    }
  },

  uploadFile: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/storage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set((state) => ({ 
        files: [response.data, ...state.files],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to upload file', isLoading: false });
      throw error;
    }
  },

  deleteFile: async (fileId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/storage/${fileId}`);
      set((state) => ({ 
        files: state.files.filter(f => f._id !== fileId),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete file', isLoading: false });
      throw error;
    }
  }
}));
