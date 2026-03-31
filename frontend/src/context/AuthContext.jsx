import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (error) {
                    Cookies.remove('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            Cookies.set('token', res.data.token, { expires: 30 });
            setUser(res.data);
            toast.success('Logged in successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            Cookies.set('token', res.data.token, { expires: 30 });
            setUser(res.data);
            toast.success('Registration successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};
