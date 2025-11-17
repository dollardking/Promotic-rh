// app/dashboard/historique-presences/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

interface Presence {
  id: number;
  dateCreation: string;
  statut: string;
  heureArrivee: string;
  heureDepart: string | null;
}

export default function HistoriquePresences() {
  const { token, loading } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [filteredPresences, setFilteredPresences] = useState<Presence[]>([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', statut: '' });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (loading || !token) return;

    const fetchPresences = async () => {
      try {
        const res = await fetch('/api/presences', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPresences(data.presences);
          setFilteredPresences(data.presences);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPresences();
  }, [token, loading]);

  useEffect(() => {
    let filtered = [...presences];
    if (filters.startDate) {
      filtered = filtered.filter((p) => new Date(p.dateCreation) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter((p) => new Date(p.dateCreation) <= new Date(filters.endDate));
    }
    if (filters.statut) {
      filtered = filtered.filter((p) => p.statut === filters.statut);
    }
    setFilteredPresences(filtered);
  }, [filters, presences]);

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold text-center text-blue-800">Historique des présences</h1>

        {/* FILTRES */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Du</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border rounded text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Au</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border rounded text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Statut</label>
              <select name="statut" value={filters.statut} onChange={handleFilterChange} className="w-full p-2 border rounded text-black">
                <option value="">Tous</option>
                <option value="Present">Présent</option>
                <option value="Absent">Absent</option>
                <option value="Conge">Congé</option>
                <option value="Maladie">Maladie</option>
                <option value="Retard">Retard</option>
                <option value="AbsentSansJustification">Absent sans justification</option>
              </select>
            </div>
          </div>
        </section>

        {/* LISTE */}
        <section className="space-y-4">
          {filteredPresences.length === 0 ? (
            <p className="text-center text-black py-8 font-medium">Aucune présence enregistrée.</p>
          ) : (
            filteredPresences.map((p) => (
              <div key={p.id} className="p-5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <p className="text-lg font-bold text-black mb-2">
                  {new Date(p.dateCreation).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>

                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-black">Statut :</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    p.statut === 'Present' ? 'bg-green-600' :
                    p.statut === 'Conge' ? 'bg-blue-600' :
                    p.statut === 'Maladie' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}>
                    {p.statut === 'Present' ? 'Présent' :
                     p.statut === 'Absent' ? 'Absent' :
                     p.statut === 'Conge' ? 'Congé' :
                     p.statut === 'Maladie' ? 'Maladie' :
                     p.statut === 'Retard' ? 'Retard' :
                     'Absent sans justification'}
                  </span>
                </div>

                <div className="text-sm text-black space-y-1 mt-2">
                  <p>
                    <span className="font-medium">Arrivée :</span>{' '}
                    {new Date(p.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {p.heureDepart && (
                    <p>
                      <span className="font-medium">Départ :</span>{' '}
                      {new Date(p.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}