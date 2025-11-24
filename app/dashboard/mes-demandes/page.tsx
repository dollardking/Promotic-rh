'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        console.error('Erreur lors du chargement des congés:', error);
      }
    };
    fetchConges();
  }, [token, loading]);

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment annuler cette demande ?')) return;

    try {
      const res = await fetch(`/api/conges/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setConges(prev => prev.filter(c => c.id !== id));
        setMessage('Demande annulée avec succès');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-2xl">Chargement de vos demandes...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-white text-center mb-12 drop-shadow-2xl">
          Mes Demandes
        </h1>

        {message && (
          <div className="mb-8 p-6 rounded-2xl text-center font-bold text-xl bg-green-500/20 border-2 border-green-400 text-green-300">
            {message}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
          {conges.length === 0 ? (
            <p className="text-white/70 text-center text-xl py-20">
              Aucune demande pour le moment
            </p>
          ) : (
            <div className="space-y-6">
              {conges.map((conge) => (
                <div key={conge.id} className="bg-white/10 rounded-2xl p-6 border border-white/20 flex justify-between items-center hover:bg-white/20 transition">
                  <div className="text-white">
                    <p className="text-2xl font-bold">
                      {conge.type === 'conge' ? 'Congé' : 'Permission'}
                    </p>
                    <p className="text-lg opacity-90">
                      Du {new Date(conge.startDate).toLocaleDateString('fr-FR')} 
                      au {new Date(conge.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm opacity-70 mt-2">{conge.reason}</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                      conge.status === 'En attente' ? 'bg-yellow-500/30 text-yellow-300' :
                      conge.status === 'Approuvé' ? 'bg-green-500/30 text-green-300' :
                      'bg-red-500/30 text-red-300'
                    }`}>
                      {conge.status}
                    </span>

                    {conge.status === 'En attente' && (
                      <div className="mt-4 space-x-3">
                        <button
                          onClick={() => router.push(`/dashboard/modifier-demande/${conge.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(conge.id)}
                          className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:scale-105 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}