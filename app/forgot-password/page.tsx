'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation en temps réel
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
    } else {
      setError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setSuccess("Lien de réinitialisation envoyé ! Vérifiez vos emails");
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
          Mot de passe oublié ?
        </h1>
        <p className="text-white/70 text-center mb-8">
          Entrez votre email, on vous envoie un lien de réinitialisation
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tonemail@exemple.com"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all duration-300 focus:outline-none ${
                error 
                  ? 'border-red-500 focus:border-red-400' 
                  : email && !error 
                    ? 'border-green-500 focus:border-green-400' 
                    : 'border-white/30 focus:border-white/60'
              }`}
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!error}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/70">
          Retour à la{' '}
          <Link href="/login" className="text-purple-300 hover:text-white font-bold underline">
            connexion
          </Link>
        </p>
      </div>
    </div>
  );
}