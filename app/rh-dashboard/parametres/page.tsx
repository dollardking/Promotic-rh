'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

// Définition des interfaces
interface Departement {
  id: number;
  nomDepartement: string;
  description: string | null;
}

interface Utilisateur {
  id: number;
  email: string;
  role: string;
}

export default function ParametresPage() {
  const { token, loading, user } = useAuth();
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomDepartement: '',
    description: '',
  });
  const [userPrefs, setUserPrefs] = useState({
    langue: 'fr',
    notificationsActives: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserPrefChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setUserPrefs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitDepartement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomDepartement) {
      setMessage('Le nom du département est requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/parametres/departements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout');
      }
      const data = await response.json();
      setDepartements((prev) => [...prev, data.departement as Departement]);
      setFormData({ nomDepartement: '', description: '' });
      setMessage('Département ajouté avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Erreur : ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/parametres/prefs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...userPrefs, utilisateurId: user?.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
      const data = await response.json();
      setMessage('Préférences mises à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Erreur : ${(error as Error).message}`);
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
        // Récupérer les départements
        const departementsResponse = await fetch('/api/parametres/departements', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        if (!departementsResponse.ok) {
          throw new Error('Échec de la récupération des départements');
        }
        const departementsData = await departementsResponse.json();
        setDepartements(departementsData.departements as Departement[]);

        // Récupérer les préférences de l'utilisateur connecté
        if (user?.id) {
          const prefsResponse = await fetch(`/api/parametres/prefs/${user.id}`, {
            headers: { 'authorization': `Bearer ${token}` },
          });
          if (!prefsResponse.ok) {
            throw new Error('Échec de la récupération des préférences');
          }
          const prefsData = await prefsResponse.json();
          if (prefsData.prefs) {
            setUserPrefs(prefsData.prefs as { langue: string; notificationsActives: boolean });
          }
        }
      } catch (error) {
        setMessage(`Erreur : ${(error as Error).message}`);
      }
    };
    fetchData();
  }, [token, loading, user?.id]);

  useEffect(() => {
    document.querySelector('.parametre-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Paramètres</h1>
        {message && (
          <div className="parametre-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Gestion des départements</h2>
          <form onSubmit={handleSubmitDepartement} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-black">Nom du département</label>
              <input
                type="text"
                name="nomDepartement"
                value={formData.nomDepartement}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
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
                  Ajout en cours...
                </span>
              ) : (
                'Ajouter département'
              )}
            </button>
          </form>
          <h3 className="text-lg font-semibold mb-2 text-black">Départements existants</h3>
          <ul className="space-y-2">
            {departements.map((dept) => (
              <li key={dept.id} className="p-2 bg-gray-100 rounded text-black">
                {dept.nomDepartement} - {dept.description || 'Aucune description'}
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Préférences personnelles</h2>
          <form onSubmit={handleUpdatePrefs} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Langue</label>
              <select
                name="langue"
                value={userPrefs.langue}
                onChange={handleUserPrefChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black">
                <input
                  type="checkbox"
                  name="notificationsActives"
                  checked={userPrefs.notificationsActives}
                  onChange={handleUserPrefChange}
                  className="mr-2"
                />
                Activer les notifications
              </label>
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
                  Mise à jour en cours...
                </span>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}