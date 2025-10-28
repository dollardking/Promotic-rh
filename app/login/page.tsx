'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/useAuth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis.';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'L\'email n\'est pas valide.';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis.';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit avoir au moins 6 caractères.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de la connexion.');
        login(data.token); // Suppression du setTimeout
      } catch (error) {
        setErrors({ submit: (error as Error).message });
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
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg z-10 relative">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Connexion à promotic_RH</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-black font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="tonemail@example.com"
              style={{ color: '#666' }}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-black font-bold">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="••••••••"
              style={{ color: '#666' }}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-all duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting || Object.keys(errors).length > 0}
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
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
          {errors.submit && <p className="text-red-500 text-sm mt-1">{errors.submit}</p>}
        </form>
        <div className="mt-2 text-center text-sm text-gray-600">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pas de compte ?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}