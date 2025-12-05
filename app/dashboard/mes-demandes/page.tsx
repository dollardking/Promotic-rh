'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Conge {
  id: number;
  startDate: string;
  endDate: string;
  type: 'conge' | 'permission';
  reason: string;
  status: 'En attente' | 'Approuvé' | 'Rejeté';
  createdAt: string;
}

export default function MesDemandesPage() {
  const { token, loading } = useAuth();
  const [conges, setConges] = useState<Conge[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!token || loading) return;
    const fetchConges = async () => {
      try {
        const res = await fetch('/api/conges', {
          headers: { authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setConges(data.conges || []);
      } catch (error) {
        console.error('Erreur chargement congés:', error);
      }
    };
    fetchConges();
  }, [token, loading]);

  const handleDelete = async (id: number) => {
    if (!confirm('Annuler cette demande ?')) return;
    try {
      const res = await fetch(`/api/conges/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConges(prev => prev.filter(c => c.id !== id));
        setMessage('Demande annulée avec succès');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND NOIR + SOLEIL DISCRET */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-5xl mx-auto text-white">
        {/* TITRE + LIEN BIEN VISIBLE AU HOVER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-2xl">
            Mes demandes de congé
          </h1>
          <Link 
            href="/dashboard/conges" 
            className="inline-block mt-8 text-2xl font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-200"
          >
            ← Faire une nouvelle demande
          </Link>
        </div>

        {/* MESSAGE SUCCÈS/ERREUR – COMME ADMIN : FOND BLANC, TEXTE COLORÉ */}
        {message && (
  <div className={`max-w-2xl mx-auto mb-10 p-6 rounded-2xl text-center font-bold text-lg shadow-2xl border-2 transition-all
    ${message.toLowerCase().includes('succès') || message.includes('annulée')
      ? 'bg-green-600/10 border-green-500 text-indigo-900'
      : 'bg-red-600/10 border-red-500 text-indigo-900'
    }`}>
    {message}
  </div>
)}

        {/* LISTE DES DEMANDES */}
        <div className="space-y-6">
          {conges.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl text-black/60">Aucune demande enregistrée pour le moment</p>
            </div>
          ) : (
            conges.map((conge) => (
              <div 
                key={conge.id} 
                className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/40 hover:bg-zinc-900/90 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-yellow-400">
                      {conge.type === 'conge' ? 'Congé annuel' : 'Permission'}
                    </h3>
                    <p className="text-lg text-gray-300 mt-2">
                      Du {new Date(conge.startDate).toLocaleDateString('fr-FR')} au {new Date(conge.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-400 mt-3 italic text-lg">
                      {conge.reason ? <>&ldquo;{conge.reason}&rdquo;</> : 'Aucun motif indiqué'}
                    </p>
                  </div>

                  <div className="text-center lg:text-right space-y-4">
                    <span className={`inline-block px-8 py-3 rounded-full font-bold text-lg shadow-lg ${
                      conge.status === 'En attente' ? 'bg-orange-600 text-white' :
                      conge.status === 'Approuvé' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {conge.status}
                    </span>

                    {conge.status === 'En attente' && (
                      <div className="flex gap-4 justify-center lg:justify-end mt-4">
                        <button
                          onClick={() => router.push(`/dashboard/modifier-demande/${conge.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(conge.id)}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-20 text-gray-500 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}