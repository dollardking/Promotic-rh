// app/dashboard/presences/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState } from 'react';
import Link from 'next/link';

export default function PresencesPage() {
  const { token, loading } = useAuth();
  const [formData, setFormData] = useState({
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        heureArrivee: '',
        heureDepart: '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.statut) {
      setMessage('Date et statut sont requis.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (formData.statut === 'Present' && !formData.heureArrivee) {
      setMessage('L&apos;heure d&apos;arrivée est requise pour &apos;Présent&apos;.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/presences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formData.date,
          statut: formData.statut,
          heureArrivee: formData.heureArrivee,
          heureDepart: formData.heureDepart,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur d'enregistrement");

      setFormData({ date: '', statut: 'Present', heureArrivee: '', heureDepart: '' });
      setMessage('Présence enregistrée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-800">Enregistrer ma présence</h1>

        {message && (
          <div className={`p-4 rounded-lg text-center font-medium border ${
            message.includes('succès') ? 'text-green-700 bg-green-100 border-green-300' : 'text-red-700 bg-red-100 border-red-300'
          }`}>
            {message}
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-black">Informer de ma présence</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Present">Présent</option>
                <option value="Absent">Absent</option>
                <option value="Conge">Congé</option>
                <option value="Maladie">Maladie</option>
                <option value="Retard">Retard</option>
                <option value="AbsentSansJustification">Absent sans justification</option>
              </select>
            </div>

            {formData.statut === 'Present' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Heure d&apos;arrivée</label>
                  <input
                    type="time"
                    name="heureArrivee"
                    value={formData.heureArrivee}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Heure de départ</label>
                  <input
                    type="time"
                    name="heureDepart"
                    value={formData.heureDepart}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/dashboard/historique-presences" className="text-blue-600 font-medium hover:underline">
              Voir mon historique
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}