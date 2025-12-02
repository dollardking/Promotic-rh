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
          authorization: `Bearer ${token}`,
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
      setMessage(data.message || 'Paiement validé !');
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
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ mois: moisCourant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');
      setMessage('Salaires du mois calculés avec succès !');
      setTimeout(() => setMessage(''), 3000);
      fetchSalaires();
    } catch (error: any) {
      setMessage(error.message);
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
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeId: formData.employeId, mois: formData.mois }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur calcul');

      setFormData(prev => ({
        ...prev,
        salaireBase: data.salaireBase,
        primes: data.primes,
        deductions: data.deductions,
      }));

      setMessage('Salaire calculé pour l\'employé !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSalaires = async () => {
    try {
      const response = await fetch('/api/salaire', {
        headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      setSalaires(data.salaires || []);
      setFilteredSalaires(data.salaires || []);
    } catch (error: any) {
      setMessage(error.message || 'Impossible de charger les salaires.');
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await fetch('/api/employes', { headers: { authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok) setEmployes(data.employes as Employe[]);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (!loading && token) {
      fetchSalaires();
      fetchEmployes();
    }
  }, [token, loading]);

  useEffect(() => {
    let updated = [...salaires];
    if (filters.mois) updated = updated.filter(s => new Date(s.mois).toISOString().slice(0, 7) === filters.mois);
    if (filters.statut) updated = updated.filter(s => s.statut === filters.statut);
    setFilteredSalaires(updated);
  }, [filters, salaires]);

  const formatFCFA = (montant: number) => montant.toLocaleString('fr-FR') + ' FCFA';

  if (loading) return <p className="text-center mt-20 text-white text-4xl font-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <h1 className="text-6xl font-black text-white text-center mb-10 drop-shadow-2xl">
          Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Salaires</span>
        </h1>

        {message && (
          <div className="text-center mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/30">
              <p className="text-2xl font-bold text-green-300">{message}</p>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
        <section className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 mb-10">
          <h2 className="text-3xl font-bold text-white mb-6">Enregistrer ou modifier un salaire</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TOUS LES DROPDOWNS AVEC FOND BLANC & TEXTE NOIR = 100% LISIBLES */}
            <div>
              <label className="block text-xl font-bold text-white mb-2">Employé</label>
              <select
                name="employeId"
                value={formData.employeId}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white text-black font-medium border border-gray-300 focus:ring-4 focus:ring-purple-500"
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
              <label className="block text-xl font-bold text-white mb-2">Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white text-black font-medium border border-gray-300 focus:ring-4 focus:ring-purple-500"
                required
              >
                <option value="En attente de validation">En attente de validation</option>
                <option value="En attente d'acceptation employe">En attente d'acceptation employé</option>
                <option value="Payé">Payé</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>

            {/* Les autres champs restent en violet mais lisibles */}
            <div>
              <label className="block text-xl font-bold text-white mb-2">Salaire de base</label>
              <input type="number" name="salaireBase" value={formData.salaireBase} onChange={handleChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30 placeholder-white/60" required />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-2">Primes</label>
              <input type="number" name="primes" value={formData.primes} onChange={handleChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30 placeholder-white/60" />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-2">Déductions</label>
              <input type="number" name="deductions" value={formData.deductions} onChange={handleChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30 placeholder-white/60" />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-2">Mois</label>
              <input type="month" name="mois" value={formData.mois} onChange={handleChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30" required />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-2">Date de paiement</label>
              <input type="date" name="datePaiement" value={formData.datePaiement} onChange={handleChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl py-5 rounded-2xl hover:scale-105 transition">
                {isSubmitting ? 'Enregistrement...' : selectedSalaire ? 'Modifier' : 'Enregistrer'}
              </button>
              <button type="button" onClick={handleGenerateMonthly} disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xl py-5 rounded-2xl hover:scale-105 transition">
                Calculer tous les salaires
              </button>
              <button type="button" onClick={handleGenerateForEmploye} disabled={isSubmitting || !formData.employeId} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl py-5 rounded-2xl hover:scale-105 transition">
                Calculer pour cet employé
              </button>
            </div>
          </form>
        </section>

        {/* FILTRES & LISTE */}
        <section className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">Liste des salaires</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xl font-bold text-white mb-2">Filtrer par mois</label>
              <input type="month" name="mois" value={filters.mois} onChange={handleFilterChange} className="w-full p-4 rounded-xl bg-white/20 text-white border border-white/30" />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-2">Filtrer par statut</label>
              <select name="statut" value={filters.statut} onChange={handleFilterChange} className="w-full p-4 rounded-xl bg-white text-black font-medium border border-gray-300 focus:ring-4 focus:ring-purple-500">
                <option value="">Tous</option>
                <option value="En attente de validation">En attente de validation</option>
                <option value="En attente d'acceptation employe">En attente d'acceptation employé</option>
                <option value="Payé">Payé</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredSalaires.map((salaire) => (
              <div key={salaire.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex flex-wrap justify-between items-center gap-4 text-white">
                  <div>
                    <p className="text-2xl font-black">
                      {employes.find(e => e.id === salaire.employeId)?.prenom || 'Inconnu'} {employes.find(e => e.id === salaire.employeId)?.nom || ''}
                    </p>
                    <p className="text-lg opacity-80">
                      Mois: {new Date(salaire.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl">Base: {formatFCFA(salaire.salaireBase)}</p>
                    <p className="text-green-400">+ Primes: {formatFCFA(salaire.primes)}</p>
                    <p className="text-red-400">- Déductions: {formatFCFA(salaire.deductions)}</p>
                    <p className="text-3xl font-black text-cyan-400 mt-2">
                      Net: {formatFCFA(salaire.salaireBase + salaire.primes - salaire.deductions)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold mb-2">{salaire.statut}</p>
                    {salaire.datePaiement && <p className="text-sm opacity-70">Payé le {new Date(salaire.datePaiement).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <div className="space-x-3">
                    <button onClick={() => handleEdit(salaire)} className="bg-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition">
                      Modifier
                    </button>
                    {salaire.statut === 'En attente de validation' && (
                      <button
                        onClick={() => handleValidatePayment(salaire.id)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-xl font-black hover:scale-110 transition disabled:opacity-50"
                      >
                        Valider Paiement
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}