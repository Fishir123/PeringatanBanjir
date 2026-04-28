import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './authApi';
import {
  clearAuthStorage,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from './authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(getAuthUser());

  const login = async ({ username, password }) => {
    const data = await loginUser({ username, password });
    setAuthToken(data.token);
    setAuthUser(data.user);
    setToken(data.token);
    setUser(data.user);
    navigate('/', { replace: true });
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
};
