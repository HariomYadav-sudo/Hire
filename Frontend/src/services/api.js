import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to automatically add Authorization token to headers
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    signup: async (name, email, password) => {
      const response = await client.post('/auth/signup', { name, email, password });
      return response.data;
    },
    login: async (email, password) => {
      const response = await client.post('/auth/login', { email, password });
      return response.data;
    },
    getMe: async () => {
      const response = await client.get('/auth/me');
      return response.data;
    }
  },
  dashboard: {
    getStats: async () => {
      const response = await client.get('/dashboard/stats');
      return response.data;
    },
    getRecommendations: async () => {
      const response = await client.get('/dashboard/recommendations');
      return response.data;
    },
    getSuggestions: async () => {
      const response = await client.get('/dashboard/suggestions');
      return response.data;
    }
  },
  internships: {
    list: async (filters = {}) => {
      const response = await client.get('/internships', { params: filters });
      return response.data;
    },
    get: async (id) => {
      const response = await client.get(`/internships/${id}`);
      return response.data;
    },
    apply: async (id) => {
      const response = await client.post(`/internships/${id}/apply`);
      return response.data;
    },
    save: async (id) => {
      const response = await client.post(`/internships/${id}/save`);
      return response.data;
    },
    unsave: async (id) => {
      const response = await client.delete(`/internships/${id}/save`);
      return response.data;
    },
    getSaved: async () => {
      const response = await client.get('/saved-internships');
      return response.data;
    },
    getApplied: async () => {
      const response = await client.get('/applied-internships');
      return response.data;
    }
  },
  resume: {
    generate: async (profileData) => {
      const response = await client.post('/resume/generate', profileData);
      return response.data;
    }
  },
  copilot: {
    chat: async (messages, message) => {
      const response = await client.post('/copilot/chat', { messages, message });
      return response.data;
    }
  }
};
