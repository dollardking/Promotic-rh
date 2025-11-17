'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

interface Salaire {
  id: number;
  employeId: number;
  salaireBase: number;
  primes: number;
  deductions: number;
  mois: string;
  datePaiement: string | null;
  statut: string;
  dateCreation: string;
  motifRejet?: string | null;
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
  const [selectedSalaire, setSelectedSalaire] = useState<Salaire | null>(null);
  const [formData, setFormData] = useState({
    employeId: 0,
    salaireBase: 0,
    primes: 0,
    deductions: 0,
    mois: new Date().toISOString().slice(0, 7),
    datePaiement: '',
    statut: 'En attente de validation',
  });
  const [filters, setFilters] = useState({ mois: '', statut: '' });
  const [moisCourant, setMoisCourant] = useState(new Date().toISOString().slice(0, 7));

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
  setIsSubmitting(true);
  try {
    const endpoint = selectedSalaire ? `/api/salaire/${selectedSalaire.id}` : '/api/salaire';
    const method = selectedSalaire ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        employeId: Number(formData.employeId),
        salaireBase: Number(formData.salaireBase),
        primes: Number(formData.primes),
        deductions: Number(formData.deductions),
        mois: formData.mois,
        datePaiement: formData.datePaiement || null,
        statut: formData.statut,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Erreur');

    if (selectedSalaire) {
      setSalaires((prev) => prev.map((s) => (s.id === selectedSalaire.id ? data.salaire : s)));
      setFilteredSalaires((prev) => prev.map((s) => (s.id === selectedSalaire.id ? data.salaire : s)));
    } else {
      setSalaires((prev) => [data.salaire, ...prev]);
      setFilteredSalaires((prev) => [data.salaire, ...prev]);
    }

    setMessage(data.message || 'Opération réussie !');
    resetForm();
    setTimeout(() => setMessage(''), 3000);
  } catch (error: any) {
    setMessage(error.message || 'Erreur');
  } finally {
    setIsSubmitting(false);
  }
};

  const resetForm = () => {
    setFormData({
      employeId: 0,
      salaireBase: 0,
      primes: 0,
      deductions: 0,
      mois: new Date().toISOString().slice(0, 7),
      datePaiement: '',
      statut: 'En attente de validation',
    });
    setSelectedSalaire(null);
  };

  const handleEdit = (salaire: Salaire) => {
    setFormData({
      employeId: salaire.employeId,
      salaireBase: salaire.salaireBase,
      primes: salaire.primes,
      deductions: salaire.deductions,
      mois: new Date(salaire.mois).toISOString().slice(0, 7),
      datePaiement: salaire.datePaiement ? new Date(salaire.datePaiement).toISOString().slice(0, 10) : '',
      statut: salaire.statut,
    });
    setSelectedSalaire(salaire);
  };

  const handleValidatePayment = async (id: number) => {
  setIsSubmitting(true);
  try {
    const res = await fetch(`/api/salaire/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statut: 'Payé' }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');

    setSalaires(prev => prev.map(s => s.id === id ? data.salaire : s));
    setFilteredSalaires(prev => prev.map(s => s.id === id ? data.salaire : s));
    setMessage(data.message);
    setTimeout(() => setMessage(''), 4000);
  } catch (error: any) {
    setMessage(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleGenerateMonthly = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/salaire/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mois: moisCourant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');

      setMessage('Salaires du mois calculés avec succès !');
      setTimeout(() => setMessage(''), 3000);
      fetchSalaires();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateForEmploye = async () => {
    if (!formData.employeId || !formData.mois) {
      setMessage('Employé et mois requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/salaire/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ employeId: formData.employeId, mois: formData.mois }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur calcul');

      setFormData((prev) => ({
        ...prev,
        salaireBase: data.salaireBase,
        primes: data.primes,
        deductions: data.deductions,
      }));

      setMessage('Salaire calculé pour l\'employé !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dans useEffect
const fetchSalaires = async () => {
  try {
    const response = await fetch('/api/salaire', {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let errorMessage = 'Erreur inconnue';

    if (!response.ok) {
      try {
        const err = await response.json();
        errorMessage = err.error || `Erreur HTTP ${response.status}`;
      } catch {
        errorMessage = `Erreur HTTP ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setSalaires(data.salaires || []);
    setFilteredSalaires(data.salaires || []);
  } catch (error: any) {
    console.error('Erreur chargement salaires:', error);
    setMessage(error.message || 'Impossible de charger les salaires.');
  }
};

  const fetchEmployes = async () => {
    try {
      const response = await fetch('/api/employes', {
        headers: { 'authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployes(data.employes as Employe[]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  useEffect(() => {
    if (loading || !token) return;
    fetchSalaires();
    fetchEmployes();
  }, [token, loading]);

  useEffect(() => {
    let updatedSalaires = [...salaires];
    if (filters.mois) {
      updatedSalaires = updatedSalaires.filter((s) => new Date(s.mois).toISOString().slice(0, 7) === filters.mois);
    }
    if (filters.statut) {
      updatedSalaires = updatedSalaires.filter((s) => s.statut === filters.statut);
    }
    setFilteredSalaires(updatedSalaires);
  }, [filters, salaires]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Gestion des salaires</h1>
        {message && (
          <div className="text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Enregistrer ou modifier un salaire</h2>
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
                <option value="En attente de validation">En attente de validation</option>
                <option value="En attente d'acceptation employe">En attente d'acceptation employé</option>
                <option value="Paye">Payé</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : selectedSalaire ? 'Modifier' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={handleGenerateMonthly}
              className={`w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors mt-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Calcul...' : 'Calculer salaires du mois pour tous'}
            </button>
            <button
              type="button"
              onClick={handleGenerateForEmploye}
              className={`w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition-colors mt-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || !formData.employeId || !formData.mois}
            >
              {isSubmitting ? 'Calcul...' : 'Calculer pour cet employé'}
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
                <option value="En attente de validation">En attente de validation</option>
                <option value="En attente d'acceptation employe">En attente d'acceptation employé</option>
                <option value="Paye">Payé</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>
          </div>
          <ul className="space-y-2">
            {filteredSalaires.map((salaire) => (
              <li key={salaire.id} className="p-2 bg-gray-100 rounded text-black flex justify-between items-center">
                {employes.find((e) => e.id === salaire.employeId)?.prenom || 'Inconnu'} {employes.find((e) => e.id === salaire.employeId)?.nom || ''} - 
                Mois: {new Date(salaire.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} - 
                Salaire de base: {salaire.salaireBase.toFixed(2)}€ - 
                Primes: {salaire.primes.toFixed(2)}€ - 
                Déductions: {salaire.deductions.toFixed(2)}€ - 
                Total: {(salaire.salaireBase + salaire.primes - salaire.deductions).toFixed(2)}€ - 
                Statut: {salaire.statut} - 
                Paiement: {salaire.datePaiement ? new Date(salaire.datePaiement).toLocaleDateString('fr-FR') : 'N/A'}
                <div className="ml-4 space-x-2">
                  <button
                    onClick={() => handleEdit(salaire)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Modifier
                  </button>
                  {/* Dans le tableau */}
                    {salaire.statut === 'En attente de validation' && (
                      <button
                        onClick={() => handleValidatePayment(salaire.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        disabled={isSubmitting}
                      >
                        Valider Paiement
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}