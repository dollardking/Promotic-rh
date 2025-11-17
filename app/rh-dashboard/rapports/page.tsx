// app/rh-dashboard/rapports/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Rapport {
  id: number;
  type: string;
  dateGeneration: string;
}

export default function RapportsPage() {
  const { token, loading: authLoading } = useAuth();
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [formType, setFormType] = useState<'PDF' | 'Excel'>('PDF');

  useEffect(() => {
    if (authLoading || !token) return;

    const fetchRapports = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/rapports', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        setRapports(data.rapports || []);
      } catch (err) {
        setMessage('Impossible de charger les rapports.');
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
  }, [token, authLoading]);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/rapports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: formType }),
      });

      if (!res.ok) throw new Error('Échec génération');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${formType.toLowerCase()}-${Date.now()}.${formType === 'PDF' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage(`Rapport ${formType} généré et téléchargé !`);
      setTimeout(() => setMessage(''), 4000);

      // Rafraîchir la liste
      const updated = await fetch('/api/rapports', { headers: { authorization: `Bearer ${token}` } });
      const data = await updated.json();
      setRapports(data.rapports || []);
    } catch (err: any) {
      setMessage(err.message || 'Erreur inconnue');
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) return <p className="text-center mt-20 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-800">Historique des Rapports</h1>
          <p className="text-gray-600 mt-2">Générez et téléchargez vos rapports RH</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center font-medium border transition-all ${
              message.includes('généré') || message.includes('téléchargé')
                ? 'text-green-700 bg-green-100 border-green-300'
                : 'text-red-700 bg-red-100 border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* Générateur de rapport */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-black mb-6">Générer un nouveau rapport</h2>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'PDF' | 'Excel')}
              className="w-full sm:w-auto p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
            >
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`
                w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2
                transition-all disabled:opacity-60
                ${formType === 'PDF' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération...
                </>
              ) : (
                `Générer ${formType}`
              )}
            </button>
          </div>
        </section>

        {/* Liste des rapports */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">Rapports générés</h2>
            <Link href="/rh-dashboard/departements" className="text-blue-600 hover:underline text-sm">
              ← Retour départements
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 mt-3">Chargement des rapports...</p>
            </div>
          ) : rapports.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucun rapport généré pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {rapports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <span className={`font-bold text-lg ${r.type === 'PDF' ? 'text-red-600' : 'text-green-600'}`}>
                      {r.type}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Généré le {new Date(r.dateGeneration).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">ID: {r.id}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}