import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface DecodedToken {
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

  // Déclaration de logout avec useCallback pour stabiliser la référence
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken) as DecodedToken;
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]); // logout est maintenant stable grâce à useCallback

  const login = (newToken: string) => {
    if (!newToken) {
      console.error('Aucun token fourni pour la connexion');
      return;
    }
    try {
      localStorage.setItem('token', newToken);
      const decoded = jwtDecode(newToken) as DecodedToken;
      if (decoded.exp * 1000 <= Date.now()) {
        console.error('Token expiré');
        logout();
        return;
      }
      setToken(newToken);
      setUser(decoded);
      router.push(decoded.role === 'employe' ? '/dashboard' : '/admin-dashboard');
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      logout();
    }
  };

  return { token, user, loading, login, logout };
};