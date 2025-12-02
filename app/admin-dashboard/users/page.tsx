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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-red-500 text-4xl font-bold">Accès refusé</p>
      </div>
    );
  }

  return (
    <>
      {/* MÊME FOND QUE LE DASHBOARD – NOIR ABSOLU + SOLEIL SCINTILLANT */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        {/* Soleil doré en haut à gauche */}
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />

        {/* Rayons subtils */}
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto text-white">
        {/* TITRE */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-yellow-400 drop-shadow-2xl">
          Gestion des rôles utilisateurs
        </h1>

        {/* MESSAGE */}
            {message && (
      <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border-2 shadow-lg
        ${message.includes('succès') || message.includes('ajouté') || message.includes('modifié')
          ? 'bg-green-600/10 border-green-500 text-indigo-900'
          : 'bg-red-600/10 border-red-500 text-indigo-900'
        }`}>
        <span className="drop-shadow-md">{message}</span>
      </div>
    )}

        {/* TABLEAU – SOBRE ET PUISSANT */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-900 to-pink-900">
                <tr>
                  <th className="p-6 text-left text-sm font-bold text-white/90 uppercase tracking-wider">Email</th>
                  <th className="p-6 text-left text-sm font-bold text-white/90 uppercase tracking-wider">Prénom</th>
                  <th className="p-6 text-left text-sm font-bold text-white/90 uppercase tracking-wider">Nom</th>
                  <th className="p-6 text-center text-sm font-bold text-white/90 uppercase tracking-wider">Rôle</th>
                  <th className="p-6 text-center text-sm font-bold text-white/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-white/50 text-xl">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="p-6 text-white/90">{u.email}</td>
                      <td className="p-6 text-white/80">{u.prenom}</td>
                      <td className="p-6 text-white/80">{u.nom}</td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-600' :
                          u.role === 'rh' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => changeRole(u.id, 'employe')}
                            disabled={updatingId === u.id || u.role === 'employe'}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                              u.role === 'employe'
                                ? 'bg-gray-700 opacity-60 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-500 hover:scale-105'
                            } text-white`}
                          >
                            Employé
                          </button>
                          <button
                            onClick={() => changeRole(u.id, 'rh')}
                            disabled={updatingId === u.id || u.role === 'rh'}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                              u.role === 'rh'
                                ? 'bg-gray-700 opacity-60 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                            } text-white`}
                          >
                            RH
                          </button>
                          <button
                            onClick={() => changeRole(u.id, 'admin')}
                            disabled={updatingId === u.id || u.role === 'admin'}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                              u.role === 'admin'
                                ? 'bg-gray-700 opacity-60 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 hover:scale-105'
                            } text-white`}
                          >
                            Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO © 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}