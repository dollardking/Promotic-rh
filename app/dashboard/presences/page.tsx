'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  date: string;
  statut: 'Present' | 'Absent' | 'Conge' | 'Maladie' | 'Retard' | 'AbsentSansJustification';
  heureArrivee: string;
  heureDepart: string;
}

export default function PresencesPage() {
  const { token, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    statut: 'Present',
    heureArrivee: '',
    heureDepart: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'statut' && value !== 'Present') {
      setFormData(prev => ({
        ...prev,
        [name]: value as FormData['statut'],
        heureArrivee: '',
        heureDepart: '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.statut) return setMessage('Date et statut requis !');
    if (formData.statut === 'Present' && !formData.heureArrivee) {
      return setMessage('Heure d’arrivée requise pour Présent');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/presences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setFormData({ ...formData, heureArrivee: '', heureDepart: '' });
      setMessage('Présence enregistrée avec succès !');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND IDENTIQUE AUX AUTRES PAGES EMPLOYÉ */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-2xl mx-auto text-white">
        <h1 className="text-5xl font-bold text-center mb-8 text-yellow-400 drop-shadow-2xl">
          Pointer ma présence
        </h1>

        <div className="text-center mb-10">
          <Link href="/dashboard/historique-presences" className="inline-block text-2xl font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 transform hover:scale-105">
            Voir mon historique →
          </Link>
        </div>

        {/* MESSAGE FOND BLANC + TEXTE BLEU/ROUGE */}
        {message && (
  <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border-2 shadow-lg transition-all
    ${message.includes('succès') || message.includes('envoyée')
      ? 'bg-green-600/10 border-green-500 text-indigo-900'
      : 'bg-red-600/10 border-red-500 text-indigo-900'
    }`}>
    <span className="drop-shadow-md">{message}</span>
  </div>
)}

        <form onSubmit={handleSubmit} className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8">
          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-black focus:border-yellow-400 focus:outline-none transition"
            >
              <option value="Present">Présent</option>
              <option value="Absent">Absent</option>
              <option value="Conge">En congé</option>
              <option value="Maladie">Maladie</option>
              <option value="Retard">En retard</option>
              <option value="AbsentSansJustification">Absent sans justification</option>
            </select>
          </div>

          {formData.statut === 'Present' && (
            <>
              <div>
                <label className="block text-lg font-semibold text-gray-300 mb-2">Heure d’arrivée</label>
                <input
                  type="time"
                  name="heureArrivee"
                  value={formData.heureArrivee}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-300 mb-2">Heure de départ (facultatif)</label>
                <input
                  type="time"
                  name="heureDepart"
                  value={formData.heureDepart}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 disabled:opacity-70"
          >
            {isSubmitting ? 'Enregistrement...' : 'Pointer maintenant'}
          </button>
        </form>
      </div>
    </>
  );
}