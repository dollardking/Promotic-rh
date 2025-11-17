// app/admin-dashboard/users/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: string;
}

export default function GestionRolesPage() {
  const { user, token, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token || loading) return;

    const fetchUsers = async () => {
      const res = await fetch('/api/admin/users', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else setMessage('Erreur: ' + data.error);
    };
    fetchUsers();
  }, [token, loading]);

  const changeRole = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    setMessage('');

    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, newRole }),
    });

    const data = await res.json();
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage('Rôle mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Erreur: ' + data.error);
    }
    setUpdatingId(null);
  };

  if (loading) return <p className="text-center mt-20 text-black text-xl">Chargement...</p>;
  if (!user || user.role !== 'admin') return <p className="text-center mt-20 text-red-600 text-xl">Accès refusé</p>;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* TITRE EN VIOLET */}
        <h1 className="text-5xl font-bold text-purple-700 mb-10 text-center tracking-wide">
          Gestion des rôles utilisateurs
        </h1>

        {/* MESSAGE */}
        {message && (
          <div className={`text-center p-5 rounded-2xl mb-8 text-lg font-bold shadow-md ${
            message.includes('succès') 
              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
              : 'bg-red-100 text-red-800 border-2 border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* TABLEAU REDESIGNÉ */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
                <tr>
                  <th className="p-6 text-left text-lg font-bold">Email</th>
                  <th className="p-6 text-left text-lg font-bold">Prénom</th>
                  <th className="p-6 text-left text-lg font-bold">Nom</th>
                  <th className="p-6 text-center text-lg font-bold">Rôle actuel</th>
                  <th className="p-6 text-center text-lg font-bold">Changer le rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr 
                    key={u.id} 
                    className={`border-b-2 border-gray-200 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-purple-50 hover:shadow-md`}
                  >
                    <td className="p-6 font-semibold text-black text-base">{u.email}</td>
                    <td className="p-6 font-medium text-black text-base">{u.prenom}</td>
                    <td className="p-6 font-medium text-black text-base">{u.nom}</td>
                    <td className="p-6 text-center">
                      <span className={`px-5 py-2 rounded-full text-white font-bold text-sm tracking-wider shadow-md ${
                        u.role === 'admin' ? 'bg-red-600' :
                        u.role === 'rh' ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => changeRole(u.id, 'employe')}
                          disabled={updatingId === u.id || u.role === 'employe'}
                          className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md ${
                            u.role === 'employe' 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                          }`}
                        >
                          Employé
                        </button>
                        <button
                          onClick={() => changeRole(u.id, 'rh')}
                          disabled={updatingId === u.id || u.role === 'rh'}
                          className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md ${
                            u.role === 'rh' 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                          }`}
                        >
                          RH
                        </button>
                        <button
                          onClick={() => changeRole(u.id, 'admin')}
                          disabled={updatingId === u.id || u.role === 'admin'}
                          className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md ${
                            u.role === 'admin' 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700 hover:scale-105'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AUCUN UTILISATEUR */}
          {users.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-gray-400">
                Aucun utilisateur trouvé
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}