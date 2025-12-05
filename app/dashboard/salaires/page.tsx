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
      setMessage('Paiement confirmé avec succès ! Merci');
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setMessage(err.message || 'Erreur réseau');
    }
  };

  useEffect(() => {
    if (!token || loading) return;
    fetch('/api/salaire', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.salaires) {
          const sorted = d.salaires.sort((a: any, b: any) => 
            new Date(b.mois).getTime() - new Date(a.mois).getTime()
          );
          setSalaires(sorted);
          setFiltered(sorted);
        }
      })
      .catch(err => console.error('Erreur chargement salaires:', err));
  }, [token, loading]); // FERMETURE CORRIGÉE ICI

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND NOIR + SOLEIL DISCRET */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-5xl mx-auto text-white">
        <h1 className="text-5xl font-bold text-center mb-12 text-yellow-400 drop-shadow-2xl">
          Mes salaires
        </h1>

        {/* MESSAGE FOND BLANC + TEXTE BLEU/ROUGE */}
        {message && (
            <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border-2 shadow-lg transition-all
              ${message.includes('succès') || message.includes('envoyée')
                ? 'bg-green-600/10 border-green-500 text-indigo-900'
                : 'bg-red-600/10 border-red-500 text-indigo-900'
              }`}>
              <span className="drop-shadow-md">{message}</span>
            </div>
          )}

        {/* FILTRES */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              value={filters.year}
              onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-8 py-5 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-medium focus:border-yellow-400 transition"
            >
              <option value="">Toutes les années</option>
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={filters.month}
              onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
              className="px-8 py-5 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-medium focus:border-yellow-400 transition"
            >
              <option value="">Tous les mois</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('fr', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE SALAIRES */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl text-white/60">Aucun salaire trouvé pour cette période</p>
            </div>
          ) : (
            filtered.map(s => (
              <div key={s.id} className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 hover:border-yellow-500/40 transition shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-4xl font-black text-yellow-400 mb-6">
                      {new Date(s.mois).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div className="space-y-4 text-xl">
                      <p>Salaire de base : <span className="font-bold text-2xl text-white">{s.salaireBase.toLocaleString()} FCFA</span></p>
                      <p className="text-green-400">+ Primes : <span className="font-bold">{s.primes.toLocaleString()} FCFA</span></p>
                      <p className="text-red-400">- Déductions : <span className="font-bold">{s.deductions.toLocaleString()} FCFA</span></p>
                      <p className="text-4xl font-black text-pink-400 mt-6">
                        Net : <span className="text-5xl">{(s.salaireBase + s.primes - s.deductions).toLocaleString()} FCFA</span>
                      </p>
                      {s.datePaiement && (
                        <p className="text-gray-300 mt-4">
                          Payé le <span className="font-bold">{new Date(s.datePaiement).toLocaleDateString('fr-FR')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center lg:text-right space-y-6">
                    <span className={`inline-block px-10 py-5 rounded-full text-2xl font-black border-4 ${
                      s.statut === 'Reçu' ? 'bg-green-600 text-white border-green-400' :
                      s.statut === 'Payé' ? 'bg-yellow-600 text-white border-yellow-400' :
                      'bg-gray-600 text-white border-gray-400'
                    }`}>
                      {s.statut}
                    </span>

                    {s.statut === 'Payé' && (
                      <button
                        onClick={() => confirmReceipt(s.id)}
                        className="block w-full px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300"
                      >
                        J'AI REÇU
                      </button>
                    )}

                    {s.statut === 'Reçu' && (
                      <div className="text-4xl font-black text-green-400 animate-pulse">
                        Confirmé
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • VOTRE TRAVAIL COMPTE
        </div>
      </div>
    </>
  );
}