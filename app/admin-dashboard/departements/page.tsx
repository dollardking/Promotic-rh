// app/admin-dashboard/departements/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useEffect, useState, useCallback } from 'react';

interface Departement {
  id: number;
  nomDepartement: string;
  description: string | null;
  createdAt: string;
}

export default function GestionDepartementsPage() {
  const { token, loading } = useAuth();
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // AJOUT
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauDesc, setNouveauDesc] = useState('');
  const [ajoutLoading, setAjoutLoading] = useState(false);

  const fetchDepartements = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/departement', {
        headers: { authorization: `Bearer ${token}` },
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Erreur parsing JSON:', jsonError);
        setMessage('Réponse invalide du serveur');
        return;
      }

      if (res.ok) {
        setDepartements(data.departements || []);
      } else {
        setMessage(data.error || 'Erreur de chargement');
      }
    } catch (err) {
      setMessage('Erreur réseau');
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!loading && token) {
      fetchDepartements();
      const interval = setInterval(fetchDepartements, 5000);
      return () => clearInterval(interval);
    }
  }, [token, loading, fetchDepartements]);

  const ajouterDepartement = async () => {
    if (!nouveauNom.trim()) return setMessage('Nom requis');
    setAjoutLoading(true);

    try {
      const res = await fetch('/api/departement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nomDepartement: nouveauNom, description: nouveauDesc || null }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        setDepartements(prev => [data.departement, ...prev]);
        setNouveauNom('');
        setNouveauDesc('');
        setMessage('Département ajouté ! RH notifié');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage(data.error || 'Erreur ajout');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
    setAjoutLoading(false);
  };

  const startEdit = (dept: Departement) => {
    setEditingId(dept.id);
    setFormData({ nom: dept.nomDepartement, description: dept.description || '' });
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch('/api/departement', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, nomDepartement: formData.nom, description: formData.description }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        setDepartements(prev => prev.map(d => d.id === id ? { ...d, nomDepartement: formData.nom, description: formData.description } : d));
        setEditingId(null);
        setMessage('Département modifié ! RH notifié');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage(data.error || 'Erreur modification');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
  };

  const deleteDept = async (id: number) => {
    setDeletingId(id);

    try {
      const res = await fetch('/api/departement', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setDepartements(prev => prev.filter(d => d.id !== id));
        setMessage('Département supprimé ! RH notifié');
        setTimeout(() => setMessage(''), 4000);
      } else {
        let data = {};
        try { data = await res.json(); } catch {}
        setMessage(data.error || 'Erreur suppression');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
    setDeletingId(null);
  };

  if (loading) return <p className="text-center mt-20 text-black text-3xl font-bold">Chargement...</p>;

  return (
    <div className="p-10 min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-7xl font-extrabold text-purple-700 mb-16 text-center tracking-tight animate-pulse drop-shadow-2xl">
          Gestion des départements
        </h1>

        {message && (
          <div className={`text-center p-8 rounded-3xl mb-12 text-2xl font-bold shadow-2xl transition-all ${
            message.includes('notifié') 
              ? 'bg-green-100 text-green-800 border-8 border-green-500' 
              : 'bg-red-100 text-red-800 border-8 border-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* FORM AJOUT */}
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 p-12 rounded-3xl shadow-3xl mb-16 text-white">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Ajouter un département</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <input
              type="text"
              placeholder="Nom du département"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              className="px-8 py-6 rounded-2xl text-black text-xl font-bold shadow-lg"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={nouveauDesc}
              onChange={(e) => setNouveauDesc(e.target.value)}
              className="px-8 py-6 rounded-2xl text-black text-xl"
            />
            <button
              onClick={ajouterDepartement}
              disabled={ajoutLoading}
              className="bg-green-600 hover:bg-green-700 font-extrabold text-2xl py-6 rounded-2xl transition-all shadow-2xl transform hover:scale-105"
            >
              {ajoutLoading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-3xl shadow-3xl overflow-hidden border-8 border-purple-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-800 to-purple-950 text-white">
                <tr>
                  <th className="p-10 text-left text-2xl font-extrabold">Nom</th>
                  <th className="p-10 text-left text-2xl font-extrabold">Description</th>
                  <th className="p-10 text-left text-2xl font-extrabold">Créé le</th>
                  <th className="p-10 text-center text-2xl font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departements.map((dept, i) => (
                  <tr key={dept.id} className={`border-b-8 border-purple-200 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-100 transition-all duration-500`}>
                    <td className="p-10 font-extrabold text-black text-xl">
                      {editingId === dept.id ? (
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="border-4 border-purple-600 rounded-2xl px-6 py-4 w-full font-extrabold text-xl"
                        />
                      ) : (
                        dept.nomDepartement
                      )}
                    </td>
                    <td className="p-10 text-black text-xl">
                      {editingId === dept.id ? (
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="border-4 border-purple-600 rounded-2xl px-6 py-4 w-full"
                          rows={4}
                        />
                      ) : (
                        dept.description || <span className="text-gray-500 italic font-medium">Aucune description</span>
                      )}
                    </td>
                    <td className="p-10 text-black text-xl font-medium">
                      {new Date(dept.createdAt).toLocaleDateString('fr-FR', { 
                        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
                      })}
                    </td>
                    <td className="p-10 text-center">
                      <div className="flex justify-center items-center gap-20">
                        {editingId === dept.id ? (
                          <button
                            onClick={() => saveEdit(dept.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-2xl px-16 py-6 rounded-3xl shadow-3xl transition-all transform hover:scale-110"
                          >
                            Sauvegarder
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(dept)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-2xl px-16 py-6 rounded-3xl shadow-3xl transition-all transform hover:scale-110"
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          onClick={() => deleteDept(dept.id)}
                          disabled={deletingId === dept.id}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-2xl px-16 py-6 rounded-3xl shadow-3xl transition-all transform hover:scale-110 disabled:opacity-60"
                        >
                          {deletingId === dept.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {departements.length === 0 && (
            <div className="text-center py-40">
              <p className="text-6xl font-extrabold text-gray-400">
                Aucun département
              </p>
              <p className="text-3xl text-gray-600 mt-8">
                Ajoutez-en un en haut ↑
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}