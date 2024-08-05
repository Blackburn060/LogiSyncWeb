import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import api from '../services/axiosConfig';

interface ExtendedJwtPayload extends JwtPayload {
  id: string;
  nomeCompleto: string;
  tipoUsuario: string;
  CodigoTransportadora: number;
}

interface AuthContextType {
  user: ExtendedJwtPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedJwtPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const navigate = useNavigate();

  const login = useCallback((accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const decodedUser = jwtDecode<ExtendedJwtPayload>(accessToken);
    setUser(decodedUser);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const refreshAccessToken = useCallback(async () => {
    if (refreshToken) {
      try {
        const response = await api.post('/refresh-token', { refreshToken });
        if (response.data && response.data.accessToken) {
          login(response.data.accessToken, refreshToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [refreshToken, login, logout]);

  useEffect(() => {
    if (accessToken) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(accessToken);
      setUser(decodedUser);

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (decodedUser.exp || 0) - currentTime;

      if (timeUntilExpiry < 300) {
        refreshAccessToken();
      }
    } else if (refreshToken) {
      refreshAccessToken();
    }
  }, [accessToken, refreshToken, refreshAccessToken]);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(storedAccessToken);
      setUser(decodedUser);
      setAccessToken(storedAccessToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
