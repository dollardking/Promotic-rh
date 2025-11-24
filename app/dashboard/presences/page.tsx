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
    date: '',
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
        [name]: value as FormData['statut'], // Typé proprement
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
      setFormData({ date: '', statut: 'Present', heureArrivee: '', heureDepart: '' });
      setMessage('Présence enregistrée avec succès !');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      // `err` est maintenant typé comme unknown → on le cast proprement
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-3xl font-bold">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <h1 className="text-6xl font-black text-white text-center mb-12 drop-shadow-2xl">
          Pointer ma Présence
        </h1>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl text-center font-bold text-2xl transition-all animate-pulse ${
            message.includes('succès')
              ? 'bg-green-500/20 border-2 border-green-400 text-green-300'
              : 'bg-red-500/20 border-2 border-red-400 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl space-y-8">
          <div>
            <label className="text-white/80 text-xl font-medium">Date du jour</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-white/80 text-xl font-medium">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white focus:border-purple-400 focus:outline-none transition"
            >
              <option value="Present" className="bg-gray-800">Présent</option>
              <option value="Absent" className="bg-gray-800">Absent</option>
              <option value="Conge" className="bg-gray-800">En congé</option>
              <option value="Maladie" className="bg-gray-800">Maladie</option>
              <option value="Retard" className="bg-gray-800">En retard</option>
              <option value="AbsentSansJustification" className="bg-gray-800">Absent sans justification</option>
            </select>
          </div>

          {formData.statut === 'Present' && (
            <>
              <div>
                <label className="text-white/80 text-xl font-medium">Heure d’arrivée</label>
                <input
                  type="time"
                  name="heureArrivee"
                  value={formData.heureArrivee}
                  onChange={handleChange}
                  required
                  className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-white/80 text-xl font-medium">Heure de départ (facultatif)</label>
                <input
                  type="time"
                  name="heureDepart"
                  value={formData.heureDepart}
                  onChange={handleChange}
                  className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-7 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-3xl rounded-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Enregistrement...' : 'Pointer ma présence'}
          </button>

          <div className="text-center pt-6">
            <Link href="/dashboard/historique-presences" className="text-white/80 text-xl underline hover:text-white transition">
              Voir mon historique de présences
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}