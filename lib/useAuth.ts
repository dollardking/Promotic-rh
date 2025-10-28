import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface DecodedToken {
  id: number;
  email: string;
  role: string;
  prenom?: string;
  exp: number;
}

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Stored token:', storedToken);
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken) as DecodedToken;
        console.log('Decoded token:', decoded);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          console.warn('Token expiré, déconnexion');
          logout();
        }
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  const login = (newToken: string) => {
    if (!newToken) {
      console.error('Aucun token fourni pour la connexion');
      return;
    }
    try {
      localStorage.setItem('token', newToken);
      const decoded = jwtDecode(newToken) as DecodedToken;
      console.log('Login decoded token:', decoded);
      if (decoded.exp * 1000 <= Date.now()) {
        console.error('Token expiré');
        logout();
        return;
      }
      setToken(newToken);
      setUser(decoded);
      const role = decoded.role.toLowerCase();
      if (role === 'employe') {
        router.push('/dashboard');
      } else if (role === 'rh') {
        router.push('/rh-dashboard');
      } else if (role === 'admin') {
        router.push('/admin-dashboard');
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      logout();
    }
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decoded = jwtDecode(token) as DecodedToken;
        if (decoded.exp * 1000 <= Date.now()) {
          console.warn('Token expiré lors de la vérification périodique');
          logout();
        }
      }
    };
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token, logout]);

  return { token, user, loading, login, logout };
};