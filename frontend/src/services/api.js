import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor to add token to every request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
