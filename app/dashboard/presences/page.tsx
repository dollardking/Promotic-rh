'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function PresencesPage() {
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState({ date: '', statut: 'Present', heureArrivee: '', heureDepart: '', trajet: '' });
  const [presences, setPresences] = useState([]);
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', statut: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'statut' && value !== 'Present') {
      // Réinitialiser les champs horaires si le statut n'est pas "Présent"
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        heureArrivee: '',
        heureDepart: '',
        trajet: '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.statut) {
      setMessage('Date et statut sont requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/presences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formData.date,
          statut: formData.statut,
          heureArrivee: formData.heureArrivee || null,
          heureDepart: formData.heureDepart || null,
          trajet: formData.trajet || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      setPresences((prev) => [data.presence, ...prev]);
      setFilteredPresences((prev) => [data.presence, ...prev]);
      setFormData({ date: '', statut: 'Present', heureArrivee: '', heureDepart: '', trajet: '' });
      setMessage('Présence/Absence enregistrée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchPresences = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        const response = await fetch('/api/presences', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPresences(data.presences);
          setFilteredPresences(data.presences);
        } else {
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des présences:', error);
      }
    };
    fetchPresences();
  }, [token, loading]);

  useEffect(() => {
    let updatedPresences = [...presences];
    if (filters.startDate) {
      updatedPresences = updatedPresences.filter((p) => new Date(p.dateCreation) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      updatedPresences = updatedPresences.filter((p) => new Date(p.dateCreation) <= new Date(filters.endDate));
    }
    if (filters.statut) {
      updatedPresences = updatedPresences.filter((p) => p.statut === filters.statut);
    }
    setFilteredPresences(updatedPresences);
  }, [filters, presences]);

  useEffect(() => {
    document.querySelector('.presence-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Présences / Absences</h1>
        {message && (
          <div className="presence-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Signaler une Présence/Absence</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
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
            <div>
              <label className="block text-sm font-bold text-black">Heure d'arrivée</label>
              <input
                type="time"
                name="heureArrivee"
                value={formData.heureArrivee}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                disabled={formData.statut !== 'Present'}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Heure de départ</label>
              <input
                type="time"
                name="heureDepart"
                value={formData.heureDepart}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                disabled={formData.statut !== 'Present'}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Temps de trajet</label>
              <input
                type="time"
                name="trajet"
                value={formData.trajet}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                disabled={formData.statut !== 'Present'}
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
                'Enregistrer'
              )}
            </button>
          </form>
        </section>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Historique des Présences/Absences</h2>
          <div className="mb-4 space-y-2">
            <div>
              <label className="block text-sm font-bold text-black">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Statut</label>
              <select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Tous</option>
                <option value="Present">Présent</option>
                <option value="Absent">Absent</option>
                <option value="Conge">Congé</option>
                <option value="Maladie">Maladie</option>
                <option value="Retard">Retard</option>
                <option value="AbsentSansJustification">Absent sans justification</option>
              </select>
            </div>
          </div>
          <ul className="space-y-2">
            {filteredPresences.map((presence: any) => (
              <li key={presence.id} className="p-2 bg-gray-100 rounded text-black">
                {new Date(presence.dateCreation).toLocaleDateString()} - Statut: {presence.statut}
                {presence.heureArrivee && ` - Arrivée: ${new Date(presence.heureArrivee).toLocaleTimeString()}`}
                {presence.heureDepart && ` - Départ: ${new Date(presence.heureDepart).toLocaleTimeString()}`}
                {presence.trajet && ` - Trajet: ${new Date(presence.trajet).toLocaleTimeString()}`}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}