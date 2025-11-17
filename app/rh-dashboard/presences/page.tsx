// app/dashboard/presences/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Presence {
  id: number;
  employeId: number;
  dateCreation: string;
  statut: string;
  heureArrivee: string;
  heureDepart: string | null;
  employe: {
    id: number;
    prenom: string;
    nom: string;
  };
}

export default function PresencesPage() {
  const { token, loading } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const employeId = searchParams.get('employeId') ? parseInt(searchParams.get('employeId')!) : null;

  useEffect(() => {
    if (loading || !token) return;

    const fetchPresences = async () => {
      try {
        const res = await fetch('/api/presences', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPresences(data.presences || []);
        } else {
          setMessage('Erreur chargement');
        }
      } catch (err) {
        setMessage('Erreur réseau');
      }
    };

    fetchPresences();
  }, [token, loading]);

  const filteredPresences = employeId
    ? presences.filter(p => p.employeId === employeId)
    : presences;

  const selectedEmploye = employeId
    ? presences.find(p => p.employeId === employeId)?.employe
    : null;

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold text-center text-blue-800">
          {employeId ? `Présences de ${selectedEmploye?.prenom} ${selectedEmploye?.nom}` : 'Toutes les présences'}
        </h1>

        {message && (
          <div className="p-4 rounded-lg text-center text-red-700 bg-red-100 border border-red-300">
            {message}
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {employeId && (
            <div className="mb-4">
              <Link href="/dashboard/presences" className="text-blue-600 hover:underline text-sm">
                ← Voir toutes les présences
              </Link>
            </div>
          )}

          {filteredPresences.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Aucune présence.</p>
          ) : (
            <ul className="space-y-4">
              {filteredPresences.map(p => (
                <li key={p.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-bold text-black">
                    {p.employe.prenom} {p.employe.nom}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Date :</span> {new Date(p.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Statut :</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      p.statut === 'Present' ? 'bg-green-600' :
                      p.statut === 'Conge' ? 'bg-blue-600' :
                      p.statut === 'Maladie' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {p.statut}
                    </span>
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Arrivée :</span> {new Date(p.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {p.heureDepart && (
                    <p className="text-sm text-black">
                      <span className="font-medium">Départ :</span> {new Date(p.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}