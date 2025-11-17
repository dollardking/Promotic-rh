'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function SalairesPage() {
  const { user, token, loading } = useAuth();
  const [salaires, setSalaires] = useState<any[]>([]);
  const [filteredSalaires, setFilteredSalaires] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ year: '', month: '' });

  // === CONFIRMATION DE RÉCEPTION ===
  const handleConfirmReceipt = async (id: number) => {
    try {
      const response = await fetch(`/api/salaire/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: 'Reçu' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur confirmation');

      setSalaires((prev) => prev.map((s) => (s.id === id ? data.salaire : s)));
      setFilteredSalaires((prev) => prev.map((s) => (s.id === id ? data.salaire : s)));
      setMessage(data.message || 'Paiement confirmé !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la confirmation');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchSalaires = async () => {
      if (loading || !token) return;
      try {
        const response = await fetch('/api/salaire', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setSalaires(data.salaires || []);
          setFilteredSalaires(data.salaires || []);
        }
      } catch (error) {
        console.error('Erreur chargement salaires:', error);
      }
    };
    fetchSalaires();
  }, [token, loading]);

  useEffect(() => {
    let updated = [...salaires];
    if (filters.year) {
      updated = updated.filter((s) => new Date(s.mois).getFullYear().toString() === filters.year);
    }
    if (filters.month) {
      updated = updated.filter((s) => (new Date(s.mois).getMonth() + 1).toString().padStart(2, '0') === filters.month);
    }
    setFilteredSalaires(updated);
  }, [filters, salaires]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Mes Salaires</h1>

        {message && (
          <div className="text-green-600 text-center p-2 bg-green-100 rounded-lg animate-fadeIn">
            {message}
          </div>
        )}

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

          <ul className="space-y-3">
            {filteredSalaires.length === 0 ? (
              <li className="text-center text-gray-500 py-8">Aucun salaire trouvé.</li>
            ) : (
              filteredSalaires.map((salaire) => (
                <li
                  key={salaire.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-black">
                      {new Date(salaire.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-700">
                      Base: {salaire.salaireBase}€ | Primes: {salaire.primes.toFixed(2)}€ | Déductions: {salaire.deductions}€
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      Statut: {salaire.statut}
                      {salaire.datePaiement && ` - Payé le ${new Date(salaire.datePaiement).toLocaleDateString()}`}
                    </p>
                  </div>

                  {/* Bouton "J'ai reçu" */}
                  {salaire.statut === 'Payé' && (
                    <button
                      onClick={() => handleConfirmReceipt(salaire.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition"
                    >
                      J'ai reçu
                    </button>
                  )}

                  {salaire.statut === 'Reçu' && (
                    <span className="text-green-600 font-medium text-sm">Reçu confirmé</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}