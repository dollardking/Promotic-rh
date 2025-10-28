'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CongesPage() {
  const { user, token, loading, logout } = useAuth();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ startDate: '', endDate: '', type: 'conge', reason: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const reason = searchParams.get('reason');
    if (id && startDate && endDate && type && reason) {
      setFormData({
        startDate,
        endDate,
        type,
        reason,
      });
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason || !token) {
      setMessage('Veuillez remplir tous les champs requis ou assurez-vous d\'être connecté.');
      return;
    }
    if (loading) {
      setMessage('Chargement en cours, veuillez patienter.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/conges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: 'En attente',
          utilisateurId: user?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Votre session a expiré. Veuillez vous reconnecter.');
          logout();
          return;
        }
        throw new Error(data.error || 'Erreur lors de la soumission');
      }
      setFormData({ startDate: '', endDate: '', type: 'conge', reason: '' });
      setMessage('✅ Demande soumise avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.querySelector('.conge-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Congés / Permissions</h1>
        {message && (
          <div className="conge-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Nouvelle Demande</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="conge">Congé</option>
                <option value="permission">Permission</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Raison</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
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
                  Soumission en cours...
                </span>
              ) : (
                'Soumettre'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}