// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = "http://localhost:8080/api/v1";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post(`${API_BASE}/auth/login`, { 
                email, 
                password 
            });
            
            if (response.data.data.token) {
                const newToken = response.data.data.token;
                localStorage.setItem('token', newToken);
                setToken(newToken);
                
                // Set user from response data and store in localStorage
                const userData = {
                    username: response.data.data.username,
                    email: response.data.data.email,
                    role: response.data.data.role
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Sign in failed');
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            setError(null);
            const response = await axios.post(`${API_BASE}/auth/register`, { 
                username,
                email, 
                password 
            });
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Sign up failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    };

    // Check authentication status on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error('Error checking authentication:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
