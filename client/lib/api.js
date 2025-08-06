// API configuration and client

// Dynamic API base URL - use relative path in production, localhost in development
const getApiBaseUrl = () => {
  // In development, use localhost:3000
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  // In production, use relative path (same domain)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('devhub_token');
};

// Helper function to create request headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// API client with common methods
export const api = {
  // GET request
  get: async (endpoint, includeAuth = true) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: createHeaders(includeAuth),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // POST request
  post: async (endpoint, data = null, includeAuth = true) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // PUT request
  put: async (endpoint, data = null, includeAuth = true) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // DELETE request
  delete: async (endpoint, includeAuth = true) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: createHeaders(includeAuth),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export default api;
