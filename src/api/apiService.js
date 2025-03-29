// src/api/apiService.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        const tokenType = localStorage.getItem('tokenType') || 'Bearer';
        if (token) {
            config.headers.Authorization = `${tokenType} ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry &&
            !originalRequest.url.includes('/api/auth/login')) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {}, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                });

                const { access_token, refresh_token, token_type } = response.data;

                // Update tokens in localStorage
                localStorage.setItem('accessToken', access_token);
                localStorage.setItem('tokenType', token_type || 'Bearer');
                if (refresh_token) {
                    localStorage.setItem('refreshToken', refresh_token);
                }

                // Update auth header for the original request
                originalRequest.headers.Authorization = `${token_type || 'Bearer'} ${access_token}`;

                // Retry the original request
                return axios(originalRequest);
            } catch (err) {
                // If refresh fails, logout user and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tokenType');

                // Only redirect if in browser context
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
const authAPI = {
    register: (userData) => api.post('/api/auth/register', userData),

    login: (username, password) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        return api.post('/api/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    },

    getMe: () => api.get('/api/auth/me'),

    getGoogleLoginUrl: () => api.get('/api/auth/login/google'),
    getGithubLoginUrl: () => api.get('/api/auth/login/github'),
    getLinkedInLoginUrl: () => api.get('/api/auth/login/linkedin'),

    logout: () => {
        // Clear all auth data from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenType');

        // Also clear the Authorization header
        delete api.defaults.headers.common['Authorization'];

        // Optionally, call a backend endpoint to invalidate the token
        // return api.post('/api/auth/logout');

        return Promise.resolve();
    },

    refreshToken: (refreshToken) => {
        return api.post('/api/auth/refresh-token', {}, {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });
    }
};

// Scenarios API
const scenariosAPI = {
    getAll: () => api.get('/api/scenarios'),
    getById: (id) => api.get(`/api/scenarios/${id}`),
    create: (data) => api.post('/api/scenarios', data),
    update: (id, data) => api.put(`/api/scenarios/${id}`, data),
    delete: (id) => api.delete(`/api/scenarios/${id}`),
    getParameters: (id) => api.get(`/api/scenarios/${id}/parameters`),
    updateParameters: (id, params) => api.post(`/api/scenarios/${id}/parameters/update`, params),
    getYearlyFinancials: (id) => api.get(`/api/scenarios/${id}/financials/yearly`),
    getMonthlyFinancials: (id) => api.get(`/api/scenarios/${id}/financials/monthly`),
    getYearlyStaff: (id) => api.get(`/api/scenarios/${id}/staff/yearly`),
    getMonthlyExpenses: (id) => api.get(`/api/scenarios/${id}/expense-breakdown/monthly`),
    setDefault: (id) => api.put(`/api/scenarios/${id}/set-default`),
    duplicate: (id, data) => api.post(`/api/scenarios/${id}/duplicate`, data || {}),
};

// Export the API modules
const apiService = {
    ...api,
    auth: authAPI,
    scenarios: scenariosAPI,
};

export default apiService;