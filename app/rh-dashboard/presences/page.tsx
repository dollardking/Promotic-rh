'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

// Définition des interfaces
interface Presence {
  id: number;
  employeId: number;
  heureArrivee: Date;
  heureDepart: Date | null;
  trajet: Date | null;
  statut: string;
  dateCreation: Date;
}

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export default function PresencesPage() {
  const { token, loading } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [filteredPresences, setFilteredPresences] = useState<Presence[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeId: 0,
    heureArrivee: '',
    heureDepart: '',
    trajet: '',
    statut: 'Present',
  });
  const [filters, setFilters] = useState({ statut: '', employeName: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeId || !formData.heureArrivee || !formData.statut) {
      setMessage('Les champs requis (employé, heure d\'arrivée, statut) doivent être remplis.');
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
          ...formData,
          heureArrivee: new Date(formData.heureArrivee).toISOString(),
          heureDepart: formData.heureDepart ? new Date(formData.heureDepart).toISOString() : null,
          trajet: formData.trajet ? new Date(formData.trajet).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'ajout');
      setPresences((prev) => [data.presence as Presence, ...prev]);
      setFilteredPresences((prev) => [data.presence as Presence, ...prev]);
      setFormData({ employeId: 0, heureArrivee: '', heureDepart: '', trajet: '', statut: 'Present' });
      setMessage('Présence enregistrée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        // Récupérer les présences
        const presencesResponse = await fetch('/api/presences', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        const presencesData = await presencesResponse.json();
        if (presencesResponse.ok) {
          setPresences(presencesData.presences as Presence[]);
          setFilteredPresences(presencesData.presences as Presence[]);
        }

        // Récupérer les employés pour le sélecteur
        const employesResponse = await fetch('/api/employes', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        const employesData = await employesResponse.json();
        if (employesResponse.ok) {
          setEmployes(employesData.employes as Employe[]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    fetchData();
  }, [token, loading]);

  useEffect(() => {
    let updatedPresences = [...presences];
    if (filters.statut) {
      updatedPresences = updatedPresences.filter((p) => p.statut === filters.statut);
    }
    if (filters.employeName) {
      updatedPresences = updatedPresences.filter((p) =>
        employes.some((e) => e.id === p.employeId && `${e.prenom} ${e.nom}`.toLowerCase().includes(filters.employeName.toLowerCase()))
      );
    }
    setFilteredPresences(updatedPresences);
  }, [filters, presences, employes]);

  useEffect(() => {
    document.querySelector('.presence-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Gestion des présences</h1>
        {message && (
          <div className="presence-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Enregistrer une présence</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Employé</label>
              <select
                name="employeId"
                value={formData.employeId}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                <option value={0}>Sélectionner un employé</option>
                {employes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom} ({e.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Heure d'arrivée</label>
              <input
                type="datetime-local"
                name="heureArrivee"
                value={formData.heureArrivee}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Heure de départ</label>
              <input
                type="datetime-local"
                name="heureDepart"
                value={formData.heureDepart}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Heure de trajet</label>
              <input
                type="datetime-local"
                name="trajet"
                value={formData.trajet}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
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
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des présences</h2>
          <div className="mb-4 space-y-2">
            <div>
              <label className="block text-sm font-bold text-black">Filtrer par statut</label>
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
            <div>
              <label className="block text-sm font-bold text-black">Rechercher par employé</label>
              <input
                type="text"
                name="employeName"
                value={filters.employeName}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
                placeholder="Nom ou prénom"
              />
            </div>
          </div>
          <ul className="space-y-2">
            {filteredPresences.map((presence) => (
              <li key={presence.id} className="p-2 bg-gray-100 rounded text-black">
                {employes.find((e) => e.id === presence.employeId)?.prenom || 'Inconnu'} {employes.find((e) => e.id === presence.employeId)?.nom || ''} - 
                Arrivée: {presence.heureArrivee.toLocaleString()} - 
                Départ: {presence.heureDepart?.toLocaleString() || 'N&#39;A'} - 
                Trajet: {presence.trajet?.toLocaleString() || 'N&#39;A'} - 
                Statut: {presence.statut}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}