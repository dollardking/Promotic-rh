'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  startDate: string;
  endDate: string;
  type: 'conge' | 'permission';
  reason: string;
}

export default function CongesPage() {
  const { user, token, loading, logout } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    startDate: '',
    endDate: '',
    type: 'conge',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setMessage('Tous les champs sont requis !');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/conges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'En attente',
          utilisateurId: user?.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi');
      setFormData({ startDate: '', endDate: '', type: 'conge', reason: '' });
      setMessage('Demande envoyée avec succès !');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('expiré') || err.message.includes('session')) logout();
      setMessage(err.message || 'Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND NOIR + SOLEIL DISCRET */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-2xl mx-auto text-white">
        {/* TITRE */}
        <h1 className="text-5xl font-bold text-center mb-8 text-yellow-400 drop-shadow-2xl">
          Demande de congé / permission
        </h1>

        {/* LIEN HYPER VISIBLE AU HOVER */}
        <div className="text-center mb-10">
          <Link 
            href="/dashboard/mes-demandes" 
            className="inline-block text-2xl font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 transform hover:scale-105"
          >
            Voir toutes mes demandes →
          </Link>
        </div>

        {/* MESSAGE SUCCÈS/ERREUR – FOND BLANC COMME ADMIN */}
        {message && (
  <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border-2 shadow-lg transition-all
    ${message.includes('succès') || message.includes('envoyée')
      ? 'bg-green-600/10 border-green-500 text-indigo-900'
      : 'bg-red-600/10 border-red-500 text-indigo-900'
    }`}>
    <span className="drop-shadow-md">{message}</span>
  </div>
)}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Type de demande</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-black focus:border-yellow-400 focus:outline-none transition"
            >
              <option value="conge">Congé annuel</option>
              <option value="permission">Permission</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Motif / Raison</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={6}
              required
              placeholder="Décrivez clairement votre demande..."
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition resize-none"
            />
          </div>

          {/* BOUTON LUXUEUX */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-purple-600/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>

        <div className="text-center mt-20 text-gray-500 text-sm">
          PROMOTIC TOGO 2025 • VOTRE TEMPS COMPTE
        </div>
      </div>
    </>
  );
}