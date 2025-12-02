'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState } from 'react';

export default function SauvegardePage() {
  const { token } = useAuth(); // CORRIGÉ ICI – PROPRE ET CLAIR
  const [etat, setEtat] = useState<'idle' | 'enCours' | 'succes' | 'erreur'>('idle');
  const [message, setMessage] = useState('');

  const lancerSauvegarde = async () => {
    setEtat('enCours');
    setMessage('');

    try {
      const res = await fetch('/api/admin/sauvegarde', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Échec de la sauvegarde');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promotic-togo-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);

      setEtat('succes');
      setMessage('Sauvegarde téléchargée avec succès !');
    } catch (err) {
      setEtat('erreur');
      setMessage('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  return (
    <>
      {/* FOND IDENTIQUE À TOUTES LES PAGES ADMIN */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-4xl mx-auto text-white text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 drop-shadow-2xl mb-16">
          Sauvegarde de la base de données
        </h1>

        <div className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl">
          <div className="text-7xl mb-8">Database</div>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Téléchargez instantanément une copie complète et sécurisée de toute la base de données PROMOTIC TOGO
          </p>

          <button
            onClick={lancerSauvegarde}
            disabled={etat === 'enCours'}
            className={`px-16 py-6 rounded-xl font-bold text-xl shadow-lg transition-all hover:scale-105 ${
              etat === 'enCours'
                ? 'bg-gray-700 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600'
            } text-white`}
          >
            {etat === 'enCours' ? (
              <span className="flex items-center justify-center gap-4">
                <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Génération en cours...
              </span>
            ) : (
              'TÉLÉCHARGER LA SAUVEGARDE'
            )}
          </button>

          {/* Messages de succès / erreur */}
          {etat === 'succes' && (
            <p className="mt-8 text-2xl font-bold text-green-400 animate-pulse">
              {message}
            </p>
          )}
          {etat === 'erreur' && (
            <p className="mt-8 text-2xl font-bold text-red-400">
              {message}
            </p>
          )}
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}