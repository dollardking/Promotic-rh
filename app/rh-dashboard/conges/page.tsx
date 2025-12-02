'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export default function CongesRHPage() {
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
        const cRes = await fetch('/api/conge', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!cRes.ok) throw new Error('Erreur chargement des congés');
        const cData = await cRes.json();
        setConges(cData.conges?.filter((c: Conge) => c.status === 'En attente') ?? []);

        const eRes = await fetch('/api/employes', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!eRes.ok) throw new Error('Erreur employés');
        const eData = await eRes.json();
        setEmployes(eData.employes ?? []);
      } catch (err) {
        setMessage('Erreur de chargement');
        setTimeout(() => setMessage(''), 5000);
      }
    };
    fetchAll();
  }, [token, loading]);

  useEffect(() => {
    if (!urlId) {
      setSelectedCongeId(null);
      return;
    }
    const id = Number(urlId);
    if (!isNaN(id) && conges.some(c => c.id === id)) {
      setSelectedCongeId(id);
    } else {
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

      setMessage(`Demande de ${employe?.prenom || ''} ${employe?.nom || ''} → ${status} !`);
      setConges(prev => prev.filter(c => c.id !== id));
      setSelectedCongeId(null);
      router.replace('/rh-dashboard/conges');
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selected = selectedCongeId ? conges.find(c => c.id === selectedCongeId) : null;
  const employe = selected ? employes.find(e => e.id === selected.utilisateurId) : null;

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
            Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Congés</span>
          </h1>
          <p className="text-3xl text-white/80 mt-4">Validation • Transparence • RH Pro</p>
        </div>

        {message && (
          <div className="text-center mb-10">
            <div className={`inline-block backdrop-blur-xl rounded-3xl px-12 py-6 border ${message.includes('Approuvé') || message.includes('accepté') ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'}`}>
              <p className="text-3xl font-black text-white">{message}</p>
            </div>
          </div>
        )}

        {/* LISTE DES DEMANDES EN ATTENTE */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-black text-white text-center mb-10">
            Demandes en attente ({conges.length})
          </h2>

          {conges.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl font-bold text-white/60">Aucune demande en attente</p>
              <p className="text-2xl text-white/70 mt-4">Tout est à jour !</p>
            </div>
          ) : (
            <div className="space-y-8">
              {conges.map(c => {
                const emp = employes.find(e => e.id === c.utilisateurId);
                const nomComplet = emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu';

                return (
                  <div
                    key={c.id}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-[1.02] hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                      {/* EMPLOYÉ & TYPE */}
                      <div>
                        <h3 className="text-4xl font-black text-white">{nomComplet}</h3>
                        <p className="text-2xl text-purple-300 mt-3">{c.type}</p>
                        {c.reason && <p className="text-xl text-white/80 mt-2 italic">"{c.reason}"</p>}
                      </div>

                      {/* DATES */}
                      <div className="text-center">
                        <p className="text-lg text-white/70">Du</p>
                        <p className="text-4xl font-black text-cyan-400">
                          {format(new Date(c.startDate), 'dd MMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-5xl text-white/50 my-2">→</p>
                        <p className="text-lg text-white/70">Au</p>
                        <p className="text-4xl font-black text-pink-400">
                          {format(new Date(c.endDate), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>

                      {/* BOUTON TRAITER */}
                      <div className="text-center lg:text-right">
                        <button
                          onClick={() => router.push(`/rh-dashboard/conges?id=${c.id}`)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl font-black text-2xl hover:scale-110 transition shadow-xl"
                        >
                          Traiter la demande
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MODALE DE TRAITEMENT */}
        {selected && employe && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/30 shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-500">
              <h2 className="text-5xl font-black text-white text-center mb-10">
                Traiter la demande de congé
              </h2>

              <div className="space-y-6 text-white text-2xl">
                <p><span className="font-black text-purple-300">Employé :</span> {employe.prenom} {employe.nom}</p>
                <p><span className="font-black text-cyan-300">Du :</span> {format(new Date(selected.startDate), 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                <p><span className="font-black text-pink-300">Au :</span> {format(new Date(selected.endDate), 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                <p><span className="font-black text-yellow-300">Type :</span> {selected.type}</p>
                {selected.reason && <p className="italic text-white/90">"{selected.reason}"</p>}
              </div>

              <div className="flex justify-center gap-8 mt-12">
                <button
                  onClick={() => handleStatus(selected.id, 'Approuvé')}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-2xl font-black text-3xl hover:scale-110 transition shadow-2xl disabled:opacity-60"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleStatus(selected.id, 'Rejeté')}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-12 py-6 rounded-2xl font-black text-3xl hover:scale-110 transition shadow-2xl disabled:opacity-60"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => {
                    setSelectedCongeId(null);
                    router.replace('/rh-dashboard/conges');
                  }}
                  className="bg-gray-600 text-white px-12 py-6 rounded-2xl font-black text-3xl hover:bg-gray-700 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}