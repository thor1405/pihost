import { create } from 'zustand';
import api from '../services/api';

export const useProjectStore = create((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch projects', 
        isLoading: false 
      });
    }
  },

  createProject: async (name, framework) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/projects', { name, framework });
      set(state => ({ 
        projects: [response.data, ...state.projects],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create project', 
        isLoading: false 
      });
      throw error;
    }
  },

  deployProject: async (projectId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/projects/${projectId}/deploy`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${projectId}`);
      set((state) => ({ 
        projects: state.projects.filter(p => p._id !== projectId),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete project', isLoading: false });
      throw error;
    }
  }
}));
