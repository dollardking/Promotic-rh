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
          method: 'GET',
          headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Gestion détaillée des erreurs HTTP
        if (res.status === 403) {
          throw new Error('Accès refusé. Vous n’êtes pas autorisé à voir ces rapports.');
        }
        if (res.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        if (res.status === 500) {
          throw new Error('Erreur interne du serveur. Réessayez plus tard.');
        }
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erreur ${res.status}: ${errText || 'Inconnue'}`);
        }

        const text = await res.text();
        if (!text.trim()) throw new Error('Réponse vide du serveur');

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('JSON invalide:', text);
          throw new Error('Données corrompues reçues du serveur');
        }

        setRapports(data.rapports || []);
      } catch (err: any) {
        console.error('Erreur fetch rapports:', err);
        setError(err.message || 'Impossible de charger les rapports');
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
    const interval = setInterval(fetchRapports, 15000); // Toutes les 15s
    return () => clearInterval(interval);
  }, [token]);

  const download = async (id: number) => {
    try {
      const res = await fetch('/api/rapport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Erreur téléchargement');
      }

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

  // UI
  if (loading) return <p className="text-center mt-20 text-purple-600">Chargement des rapports...</p>;
  if (error) return <p className="text-center mt-20 text-red-600 font-medium">{error}</p>;

  return (
    <div className="p-8 min-h-screen bg-purple-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-purple-700 mb-10 text-center">Rapports RH Reçus</h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {rapports.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-12">
              Aucun rapport reçu pour le moment.
            </p>
          ) : (
            <div className="space-y-6">
              {rapports.map(r => (
                <div
                  key={r.id}
                  className="border-2 border-purple-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl transition"
                >
                  <div>
                    <p className="text-xl font-bold text-purple-800">{r.nomFichier}</p>
                    <p className="text-sm text-gray-600">
                      Envoyé par <strong>{r.rh.prenom} {r.rh.nom}</strong> • {new Date(r.dateGeneration).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => download(r.id)}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition transform hover:scale-105 ${
                      r.type === 'PDF' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Télécharger {r.type}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}