'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MesDemandesPage() {
  const { token, loading } = useAuth();
  const [conges, setConges] = useState([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchConges = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent:', { loading, token });
        return;
      }
      try {
        const response = await fetch('/api/conges', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setConges(data.conges || []);
        } else {
          setMessage('Erreur lors de la récupération des demandes.');
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        setMessage('Erreur lors de la récupération des demandes.');
        console.error('Erreur fetch:', error);
      }
    };

    fetchConges();
  }, [token, loading]);

  useEffect(() => {
    document.querySelector('.demande-message')?.classList.add('animate-fadeIn');
  }, [message]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/conges/${id}`, {
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setConges(conges.filter((conge: any) => conge.id !== id));
        setMessage(data.message);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Erreur lors de l\'annulation.');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'annulation.');
      console.error('Erreur fetch:', error);
    }
  };

  const handleModify = (id: number) => {
    router.push(`/dashboard/modifier-demande/${id}`);
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Mes Demandes</h1>
        {message && (
          <div className="demande-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des Demandes</h2>
          <ul className="space-y-2">
            {conges.length === 0 ? (
              <li className="p-2 text-center text-gray-500">Aucune demande pour le moment.</li>
            ) : (
              conges.map((conge: any) => (
                <li key={conge.id} className="p-2 bg-gray-100 rounded text-black flex justify-between items-center">
                  <span>
                    {conge.type} - {new Date(conge.startDate).toLocaleDateString()} au {new Date(conge.endDate).toLocaleDateString()} - {conge.status}
                  </span>
                  {conge.status === 'En attente' && (
                    <div>
                      <button
                        onClick={() => handleModify(conge.id)}
                        className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 mr-2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(conge.id)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}