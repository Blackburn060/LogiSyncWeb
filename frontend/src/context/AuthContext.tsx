import React, { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface AuthContextType {
  user: JwtPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (token: string) => {
    setToken(token);
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode<JwtPayload>(token);
    setUser(decodedUser);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
