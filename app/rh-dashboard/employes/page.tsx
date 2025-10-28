'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

// Définition de l'interface Employe
interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export default function EmployesPage() {
  const { token, loading } = useAuth(); // Suppression de user
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [filteredEmployes, setFilteredEmployes] = useState<Employe[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', role: 'employe' });
  const [filters, setFilters] = useState({ nom: '', role: '' });

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
    if (!formData.nom || !formData.prenom || !formData.email || !formData.role) {
      setMessage('Tous les champs sont requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/employes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'ajout');
      setEmployes((prev) => [data.employe as Employe, ...prev]);
      setFilteredEmployes((prev) => [data.employe as Employe, ...prev]);
      setFormData({ nom: '', prenom: '', email: '', role: 'employe' });
      setMessage('Employé ajouté avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchEmployes = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        const response = await fetch('/api/employes', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setEmployes(data.employes as Employe[]);
          setFilteredEmployes(data.employes as Employe[]);
        } else {
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      }
    };
    fetchEmployes();
  }, [token, loading]);

  useEffect(() => {
    let updatedEmployes = [...employes];
    if (filters.nom) {
      updatedEmployes = updatedEmployes.filter((e) => e.nom.toLowerCase().includes(filters.nom.toLowerCase()));
    }
    if (filters.role) {
      updatedEmployes = updatedEmployes.filter((e) => e.role === filters.role);
    }
    setFilteredEmployes(updatedEmployes);
  }, [filters, employes]);

  useEffect(() => {
    document.querySelector('.employe-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Gestion des employés</h1>
        {message && (
          <div className="employe-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Ajouter un employé</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-bold text-black">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                <option value="employe">Employé</option>
                <option value="rh">Responsable RH</option>
                <option value="admin">Admin</option>
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
                  Ajout en cours...
                </span>
              ) : (
                'Ajouter'
              )}
            </button>
          </form>
        </section>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des employés</h2>
          <div className="mb-4 space-y-2">
            <div>
              <label className="block text-sm font-bold text-black">Rechercher par nom</label>
              <input
                type="text"
                name="nom"
                value={filters.nom}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Filtrer par rôle</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Tous</option>
                <option value="employe">Employé</option>
                <option value="rh">Responsable RH</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <ul className="space-y-2">
            {filteredEmployes.map((employe: Employe) => (
              <li key={employe.id} className="p-2 bg-gray-100 rounded text-black">
                {employe.prenom} {employe.nom} - Email: {employe.email} - Rôle: {employe.role}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}