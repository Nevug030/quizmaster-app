import axios from 'axios';
import { Category, Question } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://quizmaster-app-kqm7.onrender.com/api'; // Updated URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quizApi = {
  // Kategorien abrufen
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Fragen abrufen
  getQuestions: async (categories?: string[], difficulties?: string[]): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (difficulties && difficulties.length > 0) {
      params.append('difficulties', difficulties.join(','));
    }
    
    const response = await api.get(`/questions?${params.toString()}`);
    return response.data;
  },

  // Neue Kategorie hinzufügen
  addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  // Neue Frage hinzufügen
  addQuestion: async (question: Omit<Question, 'id'>): Promise<Question> => {
    const response = await api.post('/questions', question);
    return response.data;
  },

  // Blacklist abrufen
  getBlacklist: async (): Promise<string[]> => {
    const response = await api.get('/blacklist');
    return response.data;
  },

  // Frage zur Blacklist hinzufügen
  addToBlacklist: async (questionId: string): Promise<{ success: boolean; blacklist: string[] }> => {
    const response = await api.post('/blacklist', { questionId });
    return response.data;
  },

  // Frage von Blacklist entfernen
  removeFromBlacklist: async (questionId: string): Promise<{ success: boolean; blacklist: string[] }> => {
    const response = await api.delete(`/blacklist/${questionId}`);
    return response.data;
  },
};

export default api; 