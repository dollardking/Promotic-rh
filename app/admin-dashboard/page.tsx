// app/admin-dashboard/page.tsx
'use client';
import { useAuth } from '../../lib/useAuth';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      setWelcomeMessage(`Bienvenue, ${user.prenom} (${user.role.toUpperCase()})`);
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-purple-700 text-center animate-pulse">
          {welcomeMessage}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-xl text-center hover:scale-105 transition">
            <p className="text-6xl mb-4">👥</p>
            <h2 className="text-2xl font-bold text-purple-700">Utilisateurs</h2>
            <p className="text-gray-600 mt-2">248 actifs</p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl text-center hover:scale-105 transition">
            <p className="text-6xl mb-4">📊</p>
            <h2 className="text-2xl font-bold text-indigo-700">Rapports</h2>
            <p className="text-gray-600 mt-2">89 générés</p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl text-center hover:scale-105 transition">
            <p className="text-6xl mb-4">⚙️</p>
            <h2 className="text-2xl font-bold text-pink-700">Système</h2>
            <p className="text-gray-600 mt-2">100% opérationnel</p>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 p-10 rounded-2xl shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Panneau Administrateur</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center justify-center gap-3"><span className="text-2xl">✅</span> Gestion complète des rôles</li>
            <li className="flex items-center justify-center gap-3"><span className="text-2xl">✅</span> Export PDF / Excel</li>
            <li className="flex items-center justify-center gap-3"><span className="text-2xl">✅</span> Logs système en temps réel</li>
            <li className="flex items-center justify-center gap-3"><span className="text-2xl">✅</span> Sauvegarde automatique</li>
          </ul>
        </div>
      </div>
    </div>
  );
}