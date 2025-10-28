// app/rh-dashboard/conges/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Conge {
  id: number;
  utilisateurId: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string;
}

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export default function CongesPage() {
  const { token, loading } = useAuth();
  const [conges, setConges] = useState<Conge[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCongeId, setSelectedCongeId] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');

  useEffect(() => {
    if (loading || !token) return;

    const fetchAll = async () => {
      try {
        // CHARGER UNIQUEMENT LES DEMANDES "En attente"
        const cRes = await fetch('/api/conge', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!cRes.ok) throw new Error('Erreur chargement');
        const cData = await cRes.json();
        setConges(cData.conges ?? []);

        const eRes = await fetch('/api/employes', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!eRes.ok) throw new Error('Erreur employés');
        const eData = await eRes.json();
        setEmployes(eData.employes ?? []);
      } catch (err) {
        setMessage((err as Error).message);
        setTimeout(() => setMessage(''), 5000);
      }
    };

    fetchAll();
  }, [token, loading]);

  useEffect(() => {
    if (!urlId) return;
    const id = Number(urlId);
    if (!isNaN(id) && conges.some(c => c.id === id)) {
      setSelectedCongeId(id);
    } else {
      // Si l'ID n'existe plus → fermer
      setSelectedCongeId(null);
      router.replace('/rh-dashboard/conges');
    }
  }, [urlId, conges, router]);

  const handleStatus = async (id: number, status: 'Approuvé' | 'Rejeté') => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/conge/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Échec');
      }

      const data = await res.json();
      const conge = data.conge;
      const employe = employes.find(e => e.id === conge.utilisateurId);

      setMessage(`Vous avez répondu à ${employe?.prenom || 'Inconnu'} ${employe?.nom || 'Inconnu'} (${status.toLowerCase()}).`);
      setConges(prev => prev.filter(c => c.id !== id));
      setSelectedCongeId(null);
      router.replace('/rh-dashboard/conges'); // Nettoie l'URL

      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage((err as Error).message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-medium text-black">Chargement…</p>
      </div>
    );
  }

  const selected = selectedCongeId ? conges.find(c => c.id === selectedCongeId) : null;
  const employe = selected ? employes.find(e => e.id === selected.utilisateurId) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold text-center text-black">Gestion des congés</h1>

        {message && (
          <div className={`p-4 rounded-lg text-center font-medium text-black border ${
            message.includes('répondu') ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
          }`}>
            {message}
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-black">Demandes en attente</h2>

          {conges.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">
              Aucune demande en attente.
            </p>
          ) : (
            <ul className="space-y-4">
              {conges.map(c => {
                const emp = employes.find(e => e.id === c.utilisateurId);
                const nomComplet = emp ? `${emp.prenom} ${emp.nom}` : 'Utilisateur inconnu';

                return (
                  <li
                    key={c.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div className="text-black">
                      <p className="font-bold text-lg">{nomComplet}</p>
                      <p className="text-sm">
                        <span className="font-medium">Du :</span>{' '}
                        {new Date(c.startDate).toLocaleDateString('fr-FR')} →{' '}
                        <span className="font-medium">Au :</span>{' '}
                        {new Date(c.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Type :</span> {c.type}
                        {c.reason && ` – ${c.reason}`}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/rh-dashboard/conges?id=${c.id}`)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Traiter
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {selected && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-black">Traiter la demande</h2>

            <div className="space-y-3 text-black text-lg">
              <p><strong className="font-bold">Employé :</strong> {employe?.prenom} {employe?.nom}</p>
              <p><strong className="font-bold">Du :</strong> {new Date(selected.startDate).toLocaleDateString('fr-FR')}</p>
              <p><strong className="font-bold">Au :</strong> {new Date(selected.endDate).toLocaleDateString('fr-FR')}</p>
              <p><strong className="font-bold">Type :</strong> {selected.type}</p>
              <p><strong className="font-bold">Motif :</strong> {selected.reason || '—'}</p>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => handleStatus(selected.id, 'Approuvé')}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-60 transition text-lg"
              >
                Accepter
              </button>
              <button
                onClick={() => handleStatus(selected.id, 'Rejeté')}
                disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-60 transition text-lg"
              >
                Rejeter
              </button>
              <button
                onClick={() => {
                  setSelectedCongeId(null);
                  router.replace('/rh-dashboard/conges');
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition text-lg"
              >
                Annuler
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}