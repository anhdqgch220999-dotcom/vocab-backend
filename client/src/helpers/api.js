import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://vocab-backend-oll9.onrender.com';

// Tạo axios instance
const axiosInstance = axios.create({
   baseURL,
   headers: {
      'Content-Type': 'application/json'
   }
});

// Interceptor để tự động thêm token
axiosInstance.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('token');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
   }
);

// Interceptor để xử lý response
axiosInstance.interceptors.response.use(
   (response) => {
      return response.data;
   },
   (error) => {
      console.error('API Error:', error);
      
      if (error.response?.status === 401) {
         localStorage.removeItem('token');
         window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error);
   }
);

// API object
export const api = {
   get: (url) => axiosInstance.get(url),
   post: (url, data) => axiosInstance.post(url, data),
   put: (url, data) => axiosInstance.put(url, data),
   delete: (url) => axiosInstance.delete(url)
};

// Vocab APIs
const backendUrl = '/vocabs/';

export const viewAllWords = async () => {
   try {
      console.log('Fetching words from:', baseURL + backendUrl);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      const response = await api.get(backendUrl);
      console.log('Words fetched:', response);
      return response;
   } catch (err) {
      console.error('Error fetching words:', err);
      return null;
   }
};

export const viewWordById = async (id) => {
   try {
      const response = await api.get(backendUrl + id);
      return response;
   } catch (err) {
      console.error(err);
      return null;
   }
};

export const addNewWord = async (word) => {
   try {
      const response = await api.post(backendUrl, word);
      return response;
   } catch (err) {
      console.error(err);
      return null;
   }
};

export const editWord = async (id, word) => {
   try {
      const response = await api.put(backendUrl + id, word);
      return response;
   } catch (err) {
      console.error(err);
      return null;
   }
};

export const deleteWord = async (id) => {
   try {
      const response = await api.delete(backendUrl + id);
      return response;
   } catch (err) {
      console.error(err);
      return null;
   }
};

// Language APIs
export const getActiveLanguages = async () => {
   try {
      const response = await axiosInstance.get('/api/languages/active');
      return response;
   } catch (err) {
      console.error('Error fetching languages:', err);
      return null;
   }
};

// Admin Language APIs
export const getAllLanguages = async () => {
   try {
      const response = await axiosInstance.get('/api/languages/all');
      return response;
   } catch (err) {
      console.error('Error fetching all languages:', err);
      return null;
   }
};

export const addNewLanguage = async (languageData) => {
   try {
      const response = await axiosInstance.post('/api/languages', languageData);
      return response;
   } catch (err) {
      console.error('Error adding language:', err);
      return null;
   }
};

export const updateLanguageStatus = async (languageId, isActive) => {
   try {
      const response = await axiosInstance.put(`/api/languages/${languageId}/status`, { isActive });
      return response;
   } catch (err) {
      console.error('Error updating language status:', err);
      return null;
   }
};

export const deleteLanguageById = async (languageId) => {
   try {
      const response = await axiosInstance.delete(`/api/languages/${languageId}`);
      return response;
   } catch (err) {
      console.error('Error deleting language:', err);
      return null;
   }
};

// Quiz APIs
export const getQuizQuestions = async (params) => {
   try {
      const response = await axiosInstance.get('/quiz/questions', { params });
      return response;
   } catch (err) {
      console.error('Error getting quiz questions:', err);
      throw err;
   }
};

export const submitQuiz = async (quizData) => {
   try {
      const response = await axiosInstance.post('/quiz/submit', quizData);
      return response;
   } catch (err) {
      console.error('Error submitting quiz:', err);
      throw err;
   }
};

export const getQuizHistory = async (params = {}) => {
   try {
      const response = await axiosInstance.get('/quiz/history', { params });
      return response;
   } catch (err) {
      console.error('Error getting quiz history:', err);
      return null;
   }
};

export const getQuizDetail = async (quizId) => {
   try {
      const response = await axiosInstance.get(`/quiz/${quizId}`);
      return response;
   } catch (err) {
      console.error('Error getting quiz detail:', err);
      return null;
   }
};
