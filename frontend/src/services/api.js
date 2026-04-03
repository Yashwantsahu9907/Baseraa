import axios from 'axios';
import Cookies from 'js-cookie';

const isLocal = window.location.hostname === 'localhost';
const api = axios.create({
    baseURL: isLocal ? 'http://localhost:5000/api' : 'https://baseraa.onrender.com/api',
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
