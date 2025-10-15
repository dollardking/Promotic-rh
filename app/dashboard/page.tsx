'use client';

import { useAuth } from '../../lib/useAuth';
import { useEffect } from 'react';

export default function DashboardHome() {
  const { user } = useAuth();

  // Animation d'entrée
  useEffect(() => {
    document.querySelector('.welcome')?.classList.add('animate-fadeIn');
  }, []);

  return (
    <div className="space-y-8">
      {/* Bienvenue avec animation gradient (non modifié) */}
      <header className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="welcome text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent animate-gradient">
          Bienvenue, {user?.prenom || 'Employé'} ({user?.role})
        </h1>
        <p className="text-center text-gray-600 mt-2">Gérez vos tâches RH en toute simplicité !</p>
      </header>

      {/* Sections fonctionnalités */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Mon Profil</h2>
          <p className="text-black">Email: {user?.email}</p>
          <p className="text-black">Rôle: {user?.role}</p>
          <button className="mt-4 text-blue-600 hover:underline">Modifier</button>
        </div>

        {/* Demandes de congé */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Mes Demandes</h2>
          <form className="space-y-4">
            <input type="date" placeholder="Date de début" className="w-full p-2 border rounded text-black" />
            <input type="date" placeholder="Date de fin" className="w-full p-2 border rounded text-black" />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Envoyer Demande</button>
          </form>
          <ul className="mt-4 space-y-2">
            <li className="p-2 bg-gray-100 rounded text-black">Demande du 10/10 - Approuvée</li>
          </ul>
        </div>

        {/* Horaires */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Horaires</h2>
          <p className="text-black">Lundi - Vendredi: 9h-17h</p>
          <p className="text-black">Prochain shift: Demain à 9h</p>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <ul className="space-y-2">
            <li className="p-2 bg-yellow-100 rounded text-black">Nouvelle paie disponible</li>
            <li className="p-2 bg-green-100 rounded text-black">Demande approuvée</li>
          </ul>
        </div>
      </section>
    </div>
  );
}