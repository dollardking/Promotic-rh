'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');

  // Récupère le token depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  // Validation en temps réel
  useEffect(() => {
    if (password && password.length < 6) {
      setError('Minimum 6 caractères');
    } else if (confirmPassword && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
    } else {
      setError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Mot de passe trop court');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!token) {
      setError('Token manquant');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setSuccess('Mot de passe changé avec succès ! Redirection...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md">
        <h1 className="text-4xl font-black text-white text-center mb-8">
          Nouveau mot de passe
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all duration-300 focus:outline-none ${
                error && password 
                  ? 'border-red-500 focus:border-red-400' 
                  : password.length >= 6 
                    ? 'border-green-500' 
                    : 'border-white/30 focus:border-white/60'
              }`}
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all duration-300 focus:outline-none ${
                error && confirmPassword 
                  ? 'border-red-500 focus:border-red-400' 
                  : confirmPassword && password === confirmPassword 
                    ? 'border-green-500' 
                    : 'border-white/30 focus:border-white/60'
              }`}
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!error || !password || !confirmPassword}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Sauvegarde...' : 'Changer le mot de passe'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/70">
          <Link href="/login" className="text-purple-300 hover:text-white font-bold underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}