// app/dashboard/historique-presences/page.tsx
'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

interface Presence {
  id: number;
  dateCreation: string;
  statut: string;
  heureArrivee: string | null;
  heureDepart: string | null;
}

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'Present', label: 'Présent', color: 'text-green-400' },
  { value: 'Absent', label: 'Absent', color: 'text-red-400' },
  { value: 'Conge', label: 'En congé', color: 'text-blue-400' },
  { value: 'Maladie', label: 'Maladie', color: 'text-yellow-400' },
  { value: 'Retard', label: 'Retard', color: 'text-orange-400' },
  { value: 'AbsentSansJustification', label: 'Absent sans justification', color: 'text-red-500 font-bold' },
];

const statutColors: Record<string, string> = {
  Present: 'bg-green-500/30 text-green-300 border-green-400',
  Conge: 'bg-blue-500/30 text-blue-300 border-blue-400',
  Maladie: 'bg-yellow-500/30 text-yellow-300 border-yellow-400',
  Retard: 'bg-orange-500/30 text-orange-300 border-orange-400',
  Absent: 'bg-red-500/30 text-red-300 border-red-400',
  AbsentSansJustification: 'bg-red-600/40 text-red-200 border-red-500',
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
          setPresences(d.presences);
          setFiltered(d.presences);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-3xl font-bold">Chargement de l&apos;historique...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <h1 className="text-6xl font-black text-white text-center mb-12 drop-shadow-2xl">
          Historique des Présences
        </h1>

        {/* FILTRES */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-6 py-4 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              placeholder="Du"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-6 py-4 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              placeholder="Au"
            />

            {/* DROPDOWN ULTRA LISIBLE & BEAU */}
            <select
              value={filters.statut}
              onChange={e => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="px-8 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white text-lg font-medium focus:border-purple-400 focus:outline-none transition appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%23ffffff%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
            >
              {statutOptions.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-gray-900 text-white py-4 text-base"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE DES PRÉSENCES */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <p className="text-white/70 text-center text-2xl py-20">Aucune présence enregistrée</p>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition transform hover:scale-[1.01]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-white">
                      {new Date(p.dateCreation).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </h3>
                    {p.heureArrivee && (
                      <p className="text-xl text-white/80 mt-3">
                        Arrivée : <span className="font-bold text-green-400">{p.heureArrivee}</span>
                        {p.heureDepart && (
                          <> → Départ : <span className="font-bold text-purple-400">{p.heureDepart}</span></>
                        )}
                      </p>
                    )}
                  </div>

                  <span className={`px-10 py-5 rounded-full text-2xl font-black border-4 ${statutColors[p.statut] || 'bg-gray-500/30 text-gray-300'}`}>
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
    </div>
  );
}