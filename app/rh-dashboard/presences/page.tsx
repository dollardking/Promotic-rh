'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Presence {
  id: number;
  employeId: number;
  dateCreation: string;
  statut: 'Present' | 'Absent' | 'Conge' | 'Maladie' | 'AbsentSansJustification';
  heureArrivee: string;
  heureDepart: string | null;
  employe: {
    id: number;
    prenom: string;
    nom: string;
  };
}

export default function PresencesRHPage() {
  const { token, loading } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [filteredPresences, setFilteredPresences] = useState<Presence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || loading) return;
    const fetchPresences = async () => {
      try {
        const res = await fetch('/api/presences', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPresences(data.presences || []);
        } else {
          setMessage('Erreur de chargement des présences');
        }
      } catch {
        setMessage('Erreur réseau');
      }
    };
    fetchPresences();
  }, [token, loading]);

  useEffect(() => {
    let filtered = [...presences];

    // Filtre par mois
    if (selectedMonth) {
      filtered = filtered.filter(p =>
        format(new Date(p.dateCreation), 'yyyy-MM') === selectedMonth
      );
    }

    // Recherche par nom
    if (searchTerm) {
      filtered = filtered.filter(p =>
        `${p.employe.prenom} ${p.employe.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPresences(filtered);
  }, [presences, selectedMonth, searchTerm]);

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'Present': return 'bg-green-500 text-white shadow-green-500/50';
      case 'Conge': return 'bg-blue-500 text-white shadow-blue-500/50';
      case 'Maladie': return 'bg-yellow-500 text-black shadow-yellow-500/50';
      case 'Absent': case 'AbsentSansJustification': return 'bg-red-500 text-white shadow-red-500/50';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'Present': return 'Présent';
      case 'Conge': return 'En congé';
      case 'Maladie': return 'Malade';
      case 'Absent': return 'Absent justifié';
      case 'AbsentSansJustification': return 'Absent injustifié';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-6xl font-black animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* TITRE ÉPIQUE */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black text-white drop-shadow-2xl">
            Suivi des <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Présences</span>
          </h1>
          <p className="text-3xl text-white/80 mt-4">Contrôle total • Temps réel • RH Pro</p>
        </div>

        {message && (
          <div className="text-center mb-8">
            <div className="inline-block bg-red-500/20 backdrop-blur-xl rounded-2xl px-10 py-5 border border-red-500/50">
              <p className="text-2xl font-bold text-red-300">{message}</p>
            </div>
          </div>
        )}

        {/* FILTRES ULTRA-STYLÉS */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <label className="block text-2xl font-black text-white mb-4">Mois</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-5 rounded-2xl bg-white/20 text-white text-xl border border-white/30 focus:outline-none focus:ring-4 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-2xl font-black text-white mb-4">Rechercher un employé</label>
              <input
                type="text"
                placeholder="Nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-5 rounded-2xl bg-white/20 text-white text-xl placeholder-white/60 border border-white/30 focus:outline-none focus:ring-4 focus:ring-purple-500 transition"
              />
            </div>
          </div>
        </div>

        {/* STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {['Present', 'Conge', 'Maladie', 'AbsentSansJustification'].map((status) => {
            const count = presences.filter(p => p.statut === status && format(new Date(p.dateCreation), 'yyyy-MM') === selectedMonth).length;
            return (
              <div key={status} className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/20 hover:scale-105 transition">
                <p className="text-5xl font-black text-white">{count}</p>
                <p className="text-xl text-white/80 mt-2">
                  {status === 'Present' ? 'Présents' :
                   status === 'Conge' ? 'En congé' :
                   status === 'Maladie' ? 'Malades' : 'Absents'}
                </p>
              </div>
            );
          })}
        </div>

        {/* LISTE DES PRÉSENCES – CARTES DE LUXE */}
        <div className="space-y-6">
          {filteredPresences.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl font-bold text-white/60">Aucune présence ce mois-ci</p>
            </div>
          ) : (
            filteredPresences.map((presence) => (
              <div
                key={presence.id}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:scale-[1.02] hover:shadow-purple-500/50 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                  {/* NOM & DATE */}
                  <div>
                    <h3 className="text-3xl font-black text-white">
                      {presence.employe.prenom} {presence.employe.nom}
                    </h3>
                    <p className="text-2xl text-purple-300 mt-2">
                      {format(new Date(presence.dateCreation), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>

                  {/* STATUT */}
                  <div className="text-center">
                    <span className={`inline-block px-8 py-4 rounded-full text-2xl font-black ${getStatusStyle(presence.statut)} shadow-lg`}>
                      {getStatusLabel(presence.statut)}
                    </span>
                  </div>

                  {/* HEURES */}
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-lg text-white/70">Arrivée</p>
                      <p className="text-4xl font-black text-green-400">
                        {new Date(presence.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {presence.heureDepart && (
                      <div>
                        <p className="text-lg text-white/70">Départ</p>
                        <p className="text-4xl font-black text-red-400">
                          {new Date(presence.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ICÔNE FINGERPRINT */}
                  <div className="text-center">
                    <div className="text-8xl">Fingerprint</div>
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