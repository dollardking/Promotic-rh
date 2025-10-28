'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

// Définition des interfaces
interface Salaire {
  id: number;
  employeId: number;
  salaireBase: number;
  primes: number;
  deductions: number;
  mois: Date;
  datePaiement: Date | null;
  statut: string;
  dateCreation: Date;
}

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export default function SalairesPage() {
  const { token, loading } = useAuth();
  const [salaires, setSalaires] = useState<Salaire[]>([]);
  const [filteredSalaires, setFilteredSalaires] = useState<Salaire[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeId: 0,
    salaireBase: 0,
    primes: 0,
    deductions: 0,
    mois: '',
    datePaiement: '',
    statut: 'En attente',
  });
  const [filters, setFilters] = useState({ mois: '', statut: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salaireBase' || name === 'primes' || name === 'deductions' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeId || !formData.salaireBase || !formData.mois) {
      setMessage('Les champs requis (employé, salaire de base, mois) doivent être remplis.');
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
          ...formData,
          mois: new Date(formData.mois).toISOString(),
          datePaiement: formData.datePaiement ? new Date(formData.datePaiement).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'ajout');
      setSalaires((prev) => [data.salaire as Salaire, ...prev]);
      setFilteredSalaires((prev) => [data.salaire as Salaire, ...prev]);
      setFormData({
        employeId: 0,
        salaireBase: 0,
        primes: 0,
        deductions: 0,
        mois: '',
        datePaiement: '',
        statut: 'En attente',
      });
      setMessage('Salaire enregistré avec succès !');
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
        // Récupérer les salaires
        const salairesResponse = await fetch('/api/salaires', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        const salairesData = await salairesResponse.json();
        if (salairesResponse.ok) {
          setSalaires(salairesData.salaires as Salaire[]);
          setFilteredSalaires(salairesData.salaires as Salaire[]);
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
    let updatedSalaires = [...salaires];
    if (filters.mois) {
      updatedSalaires = updatedSalaires.filter((s) =>
        s.mois.toISOString().slice(0, 7) === new Date(filters.mois).toISOString().slice(0, 7)
      );
    }
    if (filters.statut) {
      updatedSalaires = updatedSalaires.filter((s) => s.statut === filters.statut);
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
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Gestion des salaires</h1>
        {message && (
          <div className="salaire-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Enregistrer un salaire</h2>
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
              <label className="block text-sm font-bold text-black">Salaire de base</label>
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
              <label className="block text-sm font-bold text-black">Primes</label>
              <input
                type="number"
                name="primes"
                value={formData.primes}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Déductions</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                step="0.01"
              />
            </div>
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
              <label className="block text-sm font-bold text-black">Date de paiement</label>
              <input
                type="date"
                name="datePaiement"
                value={formData.datePaiement}
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
                <option value="En attente">En attente</option>
                <option value="Paye">Payé</option>
                <option value="Salaire non reçu">Salaire non reçu</option>
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
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des salaires</h2>
          <div className="mb-4 space-y-2">
            <div>
              <label className="block text-sm font-bold text-black">Filtrer par mois</label>
              <input
                type="month"
                name="mois"
                value={filters.mois}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black">Filtrer par statut</label>
              <select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Tous</option>
                <option value="En attente">En attente</option>
                <option value="Paye">Payé</option>
                <option value="Salaire non reçu">Salaire non reçu</option>
              </select>
            </div>
          </div>
          <ul className="space-y-2">
            {filteredSalaires.map((salaire) => (
              <li key={salaire.id} className="p-2 bg-gray-100 rounded text-black">
                {employes.find((e) => e.id === salaire.employeId)?.prenom || 'Inconnu'} {employes.find((e) => e.id === salaire.employeId)?.nom || ''} - 
                Mois: {salaire.mois.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                Salaire de base: {salaire.salaireBase.toFixed(2)}€ - 
                Primes: {salaire.primes.toFixed(2)}€ - 
                Déductions: {salaire.deductions.toFixed(2)}€ - 
                Total: {(salaire.salaireBase + salaire.primes - salaire.deductions).toFixed(2)}€ - 
                Statut: {salaire.statut} - 
                Paiement: {salaire.datePaiement?.toLocaleDateString('fr-FR') || 'N/A'}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}