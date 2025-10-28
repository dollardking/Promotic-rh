'use client';

import { useAuth } from '../../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ModifierDemandePage() {
  const { token, loading } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({ startDate: '', endDate: '', type: 'conge', reason: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchConge = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent:', { loading, token });
        return;
      }
      try {
        const response = await fetch(`/api/conges/${id}`, {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('Données reçues de l\'API:', data); // Log pour débogage
        if (response.ok) {
          const conge = data.conge;
          setFormData({
            startDate: conge.startDate instanceof Date ? conge.startDate.toISOString().split('T')[0] : conge.startDate,
            endDate: conge.endDate instanceof Date ? conge.endDate.toISOString().split('T')[0] : conge.endDate,
            type: conge.type,
            reason: conge.reason,
          });
        } else {
          setMessage('Erreur lors de la récupération de la demande.');
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        setMessage('Erreur lors de la récupération de la demande.');
        console.error('Erreur fetch:', error);
      }
    };

    fetchConge();
  }, [token, loading, id]);

  useEffect(() => {
    document.querySelector('.modifier-message')?.classList.add('animate-fadeIn');
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/conges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          setMessage('');
          router.push('/dashboard/mes-demandes');
        }, 3000);
      } else {
        setMessage(data.error || 'Erreur lors de la modification.');
      }
    } catch (error) {
      setMessage('Erreur lors de la modification.');
      console.error('Erreur fetch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Modifier la Demande</h1>
        {message && (
          <div className="modifier-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
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
                  Enregistrement en cours...
                </span>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/mes-demandes')}
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
            >
              Retour
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}