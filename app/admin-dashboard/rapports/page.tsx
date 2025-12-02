'use client';
import { useAuth } from '../../../lib/useAuth';
import { useEffect, useState } from 'react';

interface Rapport {
  id: number;
  type: string;
  nomFichier: string;
  dateGeneration: string;
  rh: { prenom: string; nom: string };
}

export default function RapportsAdmin() {
  const { token } = useAuth();
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    const fetchRapports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/rapport', {
          headers: { authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Erreur de chargement');
        }

        const data = await res.json();
        setRapports(data.rapports || []);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger les rapports');
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
    const interval = setInterval(fetchRapports, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const download = async (id: number) => {
    try {
      const res = await fetch('/api/rapport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Erreur téléchargement');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = rapports.find(r => r.id === id)?.nomFichier || 'rapport';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Téléchargement échoué: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
        <div className="bg-red-900/40 backdrop-blur-sm rounded-2xl p-10 border border-red-500/50">
          <p className="text-2xl font-bold text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MÊME FOND QUE TOUTES LES PAGES ADMIN – NOIR + SOLEIL SCINTILLANT */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto text-white">
        {/* TITRE */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-yellow-400 drop-shadow-2xl">
          Rapports RH reçus
        </h1>

        {/* LISTE DES RAPPORTS */}
        <div className="space-y-6">
          {rapports.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl font-bold text-white/40">Aucun rapport reçu pour le moment</p>
              <p className="text-xl text-white/30 mt-4">Les rapports apparaîtront ici dès leur envoi</p>
            </div>
          ) : (
            rapports.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">{r.nomFichier}</h3>
                    <p className="text-gray-300 mt-2">
                      Envoyé par <span className="font-semibold text-purple-300">{r.rh.prenom} {r.rh.nom}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(r.dateGeneration).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => download(r.id)}
                    className={`px-10 py-4 rounded-xl font-bold text-lg transition hover:scale-105 shadow-lg ${
                      r.type === 'PDF'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                    } text-white`}
                  >
                    Télécharger {r.type}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}