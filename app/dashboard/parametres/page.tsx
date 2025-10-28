'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function ParametresPage() {
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        const response = await fetch(`/api/users/${user?.id}`, {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            prenom: data.user.prenom || '',
            nom: data.user.nom || '',
            email: data.user.email || '',
            motDePasse: '', // Ne pas pré-remplir le mot de passe
          });
        } else {
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };
    fetchUserData();
  }, [token, loading, user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse || undefined, // Envoyer uniquement si modifié
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');
      setMessage('Profil mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-xl font-semibold mb-4 text-black">Modifier mon profil</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <input
                type="password"
                name="motDePasse"
                value={formData.motDePasse}
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