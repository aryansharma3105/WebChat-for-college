import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('edu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('edu_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('edu_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('edu_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out...');
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const loginAdmin = async (adminId, password) => {
    const res = await api.post('/auth/admin-login', { adminId, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('edu_token', res.data.token);
      localStorage.setItem('edu_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const loginGoogle = async (googleResponse) => {
    const res = await api.post('/auth/google', googleResponse);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('edu_token', res.data.token);
      localStorage.setItem('edu_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Google authentication failed');
  };

  const loginDemoStudent = async (studentId) => {
    const res = await api.post('/auth/demo-student-login', { studentId });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('edu_token', res.data.token);
      localStorage.setItem('edu_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Demo login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('edu_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        loginAdmin,
        loginGoogle,
        loginDemoStudent,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
