'use client'; // Ajoute cette directive en haut pour forcer le rendu côté client

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string>(''); // État pour stocker le token

  // Extraire le token côté client uniquement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const extractedToken = urlParams.get('token') || '';
    setToken(extractedToken);
  }, []);

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!password) newErrors.push('Le mot de passe est requis.');
    else if (password.length < 6) newErrors.push('Le mot de passe doit avoir au moins 6 caractères.');
    if (!confirmPassword) newErrors.push('La confirmation du mot de passe est requise.');
    else if (password !== confirmPassword) newErrors.push('Les mots de passe ne correspondent pas.');
    return newErrors.length > 0 ? newErrors.join(' ') : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
    } else {
      setError(null);
      setIsSubmitting(true);
      try {
        if (!token) throw new Error('Token manquant dans l\'URL.');
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de la réinitialisation.');
        setSuccess(data.message);
        setTimeout(() => window.location.href = '/login', 2000);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute w-1/5 h-1/5 bg-blue-700 rounded-full animate-float" style={{ top: '10%', left: '5%' }}></div>
        <div className="absolute w-1/4 h-1/4 bg-blue-400 rounded-lg animate-float-delayed" style={{ top: '30%', right: '5%' }}></div>
        <div className="absolute w-1/3 h-1/3 bg-blue-500 rounded-full animate-float" style={{ bottom: '20%', left: '10%' }}></div>
        <div className="absolute w-1/6 h-1/6 bg-blue-800 rounded-md animate-float-delayed" style={{ bottom: '10%', right: '15%' }}></div>
        <div className="absolute w-1/7 h-1/7 bg-blue-600 rounded-xl animate-float" style={{ top: '50%', left: '25%' }}></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md z-10 relative">
        <h1 className="text-2xl font-bold mb-4 text-center">Nouveau mot de passe</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm text-black font-bold">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="••••••••"
              style={{ color: '#666' }}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-black font-bold">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="••••••••"
              style={{ color: '#666' }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-1">{success}</p>}
          </div>
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-all duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting || !!error}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Réinitialisation en cours...
              </span>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Retourner à la{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            connexion
          </Link>
          ?
        </p>
      </div>
    </div>
  );
}