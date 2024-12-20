import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/axiosConfig';

interface ExtendedJwtPayload {
  id: string;
  cpf: string;
  nomecompleto: string;
  tipousuario: string;
  codigotransportadora: number;
  numerocelular?: string;
  exp?: number;
}

interface UsuarioDetalhado extends ExtendedJwtPayload {
  numerocelular: string;
}

interface AuthContextType {
  user: UsuarioDetalhado | null;
  token: string | null;
  refreshToken: string | null;
  login: (token: string, refreshToken: string) => void;
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
  const [user, setUser] = useState<UsuarioDetalhado | null>(null);
  const [token, setAccessToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('TipoAgendamento');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const login = useCallback((token: string, refreshToken: string) => {
    try {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(token);
      if (!decodedUser || !decodedUser.id) {
        throw new Error('Token inválido');
      }

      setAccessToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(decodedUser as UsuarioDetalhado);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      logout();
    }
  }, [logout]);

  // Função para renovar o token
  const refreshAccessToken = useCallback(async () => {
    if (refreshToken) {
      try {
        const response = await api.post('/refresh-token', { refreshToken });
        if (response.data && response.data.token) {
          login(response.data.token, refreshToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [refreshToken, login, logout]);

  // Verifica o token no início e atualiza o estado
  useEffect(() => {
    if (token) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(token);
      setUser(decodedUser as UsuarioDetalhado);

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (decodedUser.exp || 0) - currentTime;

      if (timeUntilExpiry < 300) {
        refreshAccessToken();
      }
    } else if (refreshToken) {
      refreshAccessToken();
    }
  }, [token, refreshToken, refreshAccessToken]);

  // Carregar token do localStorage ao montar o componente
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('token');
    if (storedAccessToken) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(storedAccessToken);
      setUser(decodedUser as UsuarioDetalhado);
      setAccessToken(storedAccessToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
