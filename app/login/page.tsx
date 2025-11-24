'use client';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/useAuth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; submit?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  // Validation en temps réel
  useEffect(() => {
    const newErrors: typeof errors = {};

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Minimum 6 caractères';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Supprime l'erreur dès que l'utilisateur tape
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

      login(data.token);
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md">
        <h1 className="text-4xl font-black text-white text-center mb-8">Connexion promotic_RH</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white/80 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tonemail@exemple.com"
              className={`w-full mt-2 px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all duration-300 ${
                errors.email 
                  ? 'border-red-500 focus:border-red-400' 
                  : formData.email && !errors.email 
                    ? 'border-green-500 focus:border-green-400' 
                    : 'border-white/30 focus:border-white/60'
              } focus:outline-none`}
            />
            {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
          </div>

          <div>
            <label className="text-white/80 text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full mt-2 px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all duration-300 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-400' 
                  : formData.password.length >= 6 
                    ? 'border-green-500 focus:border-green-400' 
                    : 'border-white/30 focus:border-white/60'
              } focus:outline-none`}
            />
            {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-center">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link href="/forgot-password" className="text-white/70 hover:text-white text-sm underline">
            Mot de passe oublié ?
          </Link>
          <p className="text-white/70">
            Pas de compte ?{' '}
            <Link href="/register" className="text-purple-300 hover:text-white font-bold">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}