'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function SalairesPage() {
  const { user, token, loading } = useAuth();
  const [salaires, setSalaires] = useState([]);
  const [filteredSalaires, setFilteredSalaires] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ mois: '', salaireBase: '', deductions: '' });
  const [filters, setFilters] = useState({ year: '', month: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mois || !formData.salaireBase) {
      setMessage('Mois et salaire de base sont requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/salaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mois: formData.mois,
          salaireBase: parseFloat(formData.salaireBase),
          deductions: formData.deductions ? parseFloat(formData.deductions) : 0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      setSalaires((prev) => [data.salaire, ...prev]);
      setFilteredSalaires((prev) => [data.salaire, ...prev]);
      setFormData({ mois: '', salaireBase: '', deductions: '' });
      setMessage('Salaire enregistré avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSalaires = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        const response = await fetch('/api/salaires', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSalaires(data.salaires);
          setFilteredSalaires(data.salaires);
        } else {
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des salaires:', error);
      }
    };
    fetchSalaires();
  }, [token, loading]);

  useEffect(() => {
    let updatedSalaires = [...salaires];
    if (filters.year) {
      updatedSalaires = updatedSalaires.filter((s) => new Date(s.mois).getFullYear().toString() === filters.year);
    }
    if (filters.month) {
      updatedSalaires = updatedSalaires.filter((s) => (new Date(s.mois).getMonth() + 1).toString().padStart(2, '0') === filters.month);
    }
    setFilteredSalaires(updatedSalaires);
  }, [filters, salaires]);

  useEffect(() => {
    document.querySelector('.salaire-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Paie / Salaires</h1>
        {message && (
          <div className="salaire-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Ajouter un Salaire</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Mois</label>
              <input
                type="month"
                name="mois"
                value={formData.mois}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Salaire de base (€)</label>
              <input
                type="number"
                name="salaireBase"
                value={formData.salaireBase}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Déductions (€)</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                step="0.01"
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
          <h2 className="text-xl font-semibold mb-4 text-black">Historique des Salaires</h2>
          <div className="mb-4 space-y-2">
            <div>
              <label className="block text-sm font-bold text-black">Année</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Toutes les années</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Mois</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Tous les mois</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="space-y-2">
            {filteredSalaires.map((salaire: any) => (
              <li key={salaire.id} className="p-2 bg-gray-100 rounded text-black">
                Mois: {new Date(salaire.mois).toLocaleString('default', { month: 'long', year: 'numeric' })} - Salaire de base: {salaire.salaireBase}€ - Primes: {salaire.primes.toFixed(2)}€ - Déductions: {salaire.deductions}€ - Statut: {salaire.statut}
                {salaire.datePaiement && ` - Payé le: ${new Date(salaire.datePaiement).toLocaleDateString()}`}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}