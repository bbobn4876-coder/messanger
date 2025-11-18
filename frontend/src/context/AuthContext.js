import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('pyrus_token'));

  useEffect(() => {
    if (token) {
      loadUser();
      socketService.connect(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      localStorage.setItem('pyrus_token', token);
      localStorage.setItem('pyrus_user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      socketService.connect(token);

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка входа';
      const requirePin = error.response?.data?.requirePin;
      return { success: false, error: errorMessage, requirePin };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { user, token } = response.data;

      localStorage.setItem('pyrus_token', token);
      localStorage.setItem('pyrus_user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      socketService.connect(token);

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка регистрации';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('pyrus_token');
      localStorage.removeItem('pyrus_user');
      setToken(null);
      setUser(null);
      socketService.disconnect();
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pyrus_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
