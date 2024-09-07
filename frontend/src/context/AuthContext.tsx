import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import api from '../services/axiosConfig';

interface ExtendedJwtPayload extends JwtPayload {
  id: string;
  CPF: string;
  nomeCompleto: string;
  tipoUsuario: string;
  CodigoTransportadora: number;
  numeroCelular?: string;
}

interface UsuarioDetalhado extends ExtendedJwtPayload {
  numeroCelular: string;
}

interface AuthContextType {
  user: UsuarioDetalhado | null;
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
  const [user, setUser] = useState<UsuarioDetalhado | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const navigate = useNavigate();

  // Função para buscar detalhes do usuário
  const fetchUserDetails = useCallback(async () => {
    if (user?.id) {
      console.log("Chamando fetchUserDetails para usuário:", user?.id);
      try {
        const response = await api.get(`/usuarios/${user.id}`);

        const userDetails = response.data;

        // Verifica se há alterações nos dados antes de chamar setUser para evitar loops
        if (userDetails.CPF !== user?.CPF || userDetails.NumeroCelular !== user?.numeroCelular) {
          setUser((prevUser) =>
            prevUser
              ? {
                  ...prevUser,
                  CPF: userDetails.CPF || prevUser.CPF,
                  numeroCelular: userDetails.NumeroCelular || prevUser.numeroCelular,
                }
              : null
          );
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do usuário:', error);
      }
    }
  }, [user]);

  // Função de login
  const login = useCallback((accessToken: string, refreshToken: string) => {
    console.log("Logando usuário");
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const decodedUser = jwtDecode<ExtendedJwtPayload>(accessToken);
    setUser(decodedUser as UsuarioDetalhado);
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    console.log("Fazendo logout");
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('TipoAgendamento');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Função para renovar o access token
  const refreshAccessToken = useCallback(async () => {
    if (refreshToken) {
      console.log("Tentando renovar o token de acesso");
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

  // Primeira verificação do token: Executa apenas uma vez no carregamento inicial
  useEffect(() => {
    console.log("Verificando accessToken no primeiro useEffect");
    if (accessToken) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(accessToken);
      setUser(decodedUser as UsuarioDetalhado);

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (decodedUser.exp || 0) - currentTime;

      if (timeUntilExpiry < 300) {
        refreshAccessToken();
      }
    } else if (refreshToken) {
      refreshAccessToken();
    }
  }, [accessToken, refreshToken, refreshAccessToken]);

  // Verifica detalhes do usuário uma vez, depois que o `user` é definido pela primeira vez
  useEffect(() => {
    console.log("Verificando user e accessToken no segundo useEffect");
    if (user?.id && accessToken) {
      fetchUserDetails();
    }
  }, [user?.id, accessToken, fetchUserDetails]);

  // Verifica se existe um token no localStorage ao carregar o componente
  useEffect(() => {
    console.log("Verificando localStorage para tokens");
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(storedAccessToken);
      setUser(decodedUser as UsuarioDetalhado);
      setAccessToken(storedAccessToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
