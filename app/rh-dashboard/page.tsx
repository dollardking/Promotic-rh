'use client';

import { useAuth } from '../../lib/useAuth';
import { useEffect, useState } from 'react';

export default function RhDashboardPage() {
  const { user, loading } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      setWelcomeMessage(`Bienvenue, ${user.prenom} (${user.role})`);
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 ml-64 bg-sky-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">{welcomeMessage}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section 1 : Nombre total d'employés */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Employés totaux</h2>
          <p className="text-3xl font-bold text-black">50</p> {/* Placeholder, à remplacer par une API */}
        </div>
        {/* Section 2 : Demandes de congés en attente */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Congés en attente</h2>
          <p className="text-3xl font-bold text-black">3</p> {/* Placeholder, à remplacer par une API */}
        </div>
        {/* Section 3 : Présences non validées */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Présences en attente</h2>
          <p className="text-3xl font-bold text-black">5</p> {/* Placeholder, à remplacer par une API */}
        </div>
      </div>
    </div>
  );
}