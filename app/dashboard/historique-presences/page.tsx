'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Presence {
  id: number;
  dateCreation: string;
  statut: string;
  heureArrivee: string | null;
  heureDepart: string | null;
}

const statutColors: Record<string, string> = {
  Present: 'bg-green-600 text-white',
  Conge: 'bg-blue-600 text-white',
  Maladie: 'bg-yellow-600 text-white',
  Retard: 'bg-orange-600 text-white',
  Absent: 'bg-red-600 text-white',
  AbsentSansJustification: 'bg-red-700 text-white font-bold',
};

export default function HistoriquePresences() {
  const { token, loading } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [filtered, setFiltered] = useState<Presence[]>([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', statut: '' });

  useEffect(() => {
    if (!token || loading) return;
    fetch('/api/presences', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.presences) {
          const sorted = d.presences.sort((a: any, b: any) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
          setPresences(sorted);
          setFiltered(sorted);
        }
      });
  }, [token, loading]);

  useEffect(() => {
    let list = [...presences];
    if (filters.startDate) list = list.filter(p => new Date(p.dateCreation) >= new Date(filters.startDate));
    if (filters.endDate) list = list.filter(p => new Date(p.dateCreation) <= new Date(filters.endDate));
    if (filters.statut) list = list.filter(p => p.statut === filters.statut);
    setFiltered(list);
  }, [filters, presences]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-6xl mx-auto text-white">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-2xl">
            Historique des présences
          </h1>
          <Link href="/dashboard/presences" className="inline-block mt-6 text-2xl text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 transform hover:scale-105">
            ← Pointer maintenant
          </Link>
        </div>

        {/* FILTRES */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 transition"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 transition"
            />
            <select
              value={filters.statut}
              onChange={e => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="px-8 py-5 bg-black/5 border border-white/20 rounded-xl text-black text-lg font-medium focus:border-yellow-400 transition"
            >
              <option value="">Tous les statuts</option>
              <option value="Present">Présent</option>
              <option value="Absent">Absent</option>
              <option value="Conge">En congé</option>
              <option value="Maladie">Maladie</option>
              <option value="Retard">Retard</option>
              <option value="AbsentSansJustification">Absent sans justification</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl text-black/60">Aucune présence enregistrée</p>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      {new Date(p.dateCreation).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    {p.heureArrivee && (
                      <p className="text-lg text-gray-300 mt-2">
                        Arrivée : <span className="font-bold text-green-400">{p.heureArrivee}</span>
                        {p.heureDepart && <> → Départ : <span className="font-bold text-purple-400">{p.heureDepart}</span></>}
                      </p>
                    )}
                  </div>
                  <span className={`px-8 py-4 rounded-full font-bold text-xl ${statutColors[p.statut] || 'bg-gray-600'}`}>
                    {p.statut === 'Present' ? 'Présent' :
                     p.statut === 'Conge' ? 'En congé' :
                     p.statut === 'Maladie' ? 'Maladie' :
                     p.statut === 'Retard' ? 'Retard' :
                     p.statut === 'Absent' ? 'Absent' : 'Absent sans justification'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}