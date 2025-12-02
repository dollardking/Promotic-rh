'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

interface Salaire {
  id: number;
  mois: string;
  salaireBase: number;
  primes: number;
  deductions: number;
  statut: 'En attente' | 'Payé' | 'Reçu';
  datePaiement?: string | null;
}

export default function SalairesPage() {
  const { token, loading } = useAuth();
  const [salaires, setSalaires] = useState<Salaire[]>([]);
  const [filtered, setFiltered] = useState<Salaire[]>([]);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ year: '', month: '' });

  const confirmReceipt = async (id: number) => {
    try {
      const res = await fetch(`/api/salaire/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statut: 'Reçu' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSalaires(prev => prev.map(s => s.id === id ? data.salaire : s));
      setFiltered(prev => prev.map(s => s.id === id ? data.salaire : s));
      setMessage('Paiement confirmé ! Merci');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
    }
  };

  useEffect(() => {
    if (!token || loading) return;
    fetch('/api/salaire', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.salaires) {
          setSalaires(d.salaires);
          setFiltered(d.salaires);
        }
      });
  }, [token, loading]);

  useEffect(() => {
    let list = [...salaires];
    if (filters.year) {
      list = list.filter(s => new Date(s.mois).getFullYear().toString() === filters.year);
    }
    if (filters.month) {
      list = list.filter(s => (new Date(s.mois).getMonth() + 1).toString().padStart(2, '0') === filters.month);
    }
    setFiltered(list);
  }, [filters, salaires]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-4xl font-black">Chargement de vos salaires...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        <h1 className="text-7xl font-black text-white text-center mb-12 drop-shadow-2xl">
          Mes Salaires
        </h1>

        {message && (
          <div className="mb-10 p-6 rounded-3xl text-center font-bold text-2xl bg-green-500/20 border-4 border-green-400 text-green-300 animate-pulse">
            {message}
          </div>
        )}

        {/* FILTRES */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select
              value={filters.year}
              onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-8 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white text-xl focus:border-purple-400 transition"
            >
              <option value="">Toutes les années</option>
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y} className="bg-gray-800">{y}</option>
              ))}
            </select>

            <select
              value={filters.month}
              onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
              className="px-8 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white text-xl focus:border-purple-400 transition"
            >
              <option value="">Tous les mois</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')} className="bg-gray-800">
                  {new Date(0, i).toLocaleString('fr', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE SALAIRES */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <p className="text-white/70 text-center text-3xl py-20">Aucun salaire trouvé pour cette période</p>
          ) : (
            filtered.map(s => (
              <div key={s.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/20 transition transform hover:scale-[1.02]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-4xl font-black text-white">
                      {new Date(s.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div className="mt-6 space-y-3 text-xl">
                      <p className="text-white/90">Salaire de base : <span className="font-bold text-2xl text-yellow-300">{s.salaireBase.toFixed(2)} fcfa</span></p>
                      <p className="text-green-300">+ Primes : <span className="font-bold">{s.primes.toFixed(2)} fcfa</span></p>
                      <p className="text-red-300">- Déductions : <span className="font-bold">{s.deductions.toFixed(2)} fcfa</span></p>
                      <p className="text-3xl font-black text-pink-300 mt-4">
                        Net à payer : <span className="text-4xl">{(s.salaireBase + s.primes - s.deductions).toFixed(2)} fcfa</span>
                      </p>
                      {s.datePaiement && (
                        <p className="text-white/70 text-lg mt-3">
                          Payé le {new Date(s.datePaiement).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-block px-10 py-5 rounded-full text-2xl font-black border-4 mb-6
                      ${s.statut === 'Reçu' ? 'bg-green-500/40 text-green-300 border-green-400' :
                        s.statut === 'Payé' ? 'bg-yellow-500/40 text-yellow-300 border-yellow-400' :
                        'bg-gray-500/40 text-gray-300 border-gray-400'}`}
                    >
                      {s.statut}
                    </div>

                    {s.statut === 'Payé' && (
                      <button
                        onClick={() => confirmReceipt(s.id)}
                        className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-110 transition"
                      >
                        J'AI REÇU
                      </button>
                    )}
                    {s.statut === 'Reçu' && (
                      <div className="text-green-400 text-3xl font-bold animate-pulse">
                        Confirmé
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}