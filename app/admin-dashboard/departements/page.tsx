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
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauDesc, setNouveauDesc] = useState('');
  const [ajoutLoading, setAjoutLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDepartements = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/departement', { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setDepartements(data.departements || []);
      else setMessage(data.error || 'Erreur de chargement');
    } catch (err) {
      setMessage('Erreur réseau');
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
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ nomDepartement: nouveauNom, description: nouveauDesc || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepartements(prev => [data.departement, ...prev]);
        setNouveauNom(''); setNouveauDesc('');
        setMessage('Département ajouté !');
        setTimeout(() => setMessage(''), 4000);
      } else setMessage(data.error || 'Erreur ajout');
    } catch (err) { setMessage('Erreur réseau'); }
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
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, nomDepartement: formData.nom, description: formData.description }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepartements(prev => prev.map(d => d.id === id ? { ...d, nomDepartement: formData.nom, description: formData.description } : d));
        setEditingId(null);
        setMessage('Département modifié !');
        setTimeout(() => setMessage(''), 4000);
      } else setMessage(data.error || 'Erreur modification');
    } catch (err) { setMessage('Erreur réseau'); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: '', description: '' });
  };

  const deleteDept = async (id: number) => {
    if (!confirm('Supprimer ce département ?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/departement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDepartements(prev => prev.filter(d => d.id !== id));
        setMessage('Département supprimé !');
        setTimeout(() => setMessage(''), 4000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Erreur suppression');
      }
    } catch (err) { setMessage('Erreur réseau'); }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND IDENTIQUE */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto text-white">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-yellow-400 drop-shadow-2xl">
          Gestion des départements
        </h1>

        {/* MESSAGE ULTRA VISIBLE */}
        {message && (
          <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border-2 shadow-lg
            ${message.includes('ajouté') || message.includes('modifié') || message.includes('supprimé')
              ? 'bg-green-600/10 border-green-500 text-indigo-900'
              : 'bg-red-600/10 border-red-500 text-indigo-900'
            }`}>
            <span className="drop-shadow-md">{message}</span>
          </div>
        )}

        {/* Formulaire ajout */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500/20 rounded-3xl p-10 mb-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-8">Créer un nouveau département</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Nom du département"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Description (facultatif)"
              value={nouveauDesc}
              onChange={(e) => setNouveauDesc(e.target.value)}
              className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none transition"
            />
            <button
              onClick={ajouterDepartement}
              disabled={ajoutLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-4 rounded-xl hover:from-green-500 hover:to-emerald-600 hover:scale-105 transition shadow-lg"
            >
              {ajoutLoading ? 'Création...' : 'AJOUTER'}
            </button>
          </div>
        </div>

        {/* Liste départements – CLIC DIRECT POUR ÉDITER */}
        <div className="space-y-6">
          {departements.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl font-bold text-white/40">Aucun département créé</p>
            </div>
          ) : (
            departements.map((dept) => (
              <div key={dept.id} className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* NOM – CLIC POUR ÉDITER */}
                  <div className="lg:col-span-3">
                    {editingId === dept.id ? (
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 rounded-lg border-2 border-yellow-500 text-yellow-300 font-bold text-xl focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3
                        onClick={() => startEdit(dept)}
                        className="text-2xl font-bold text-yellow-400 cursor-pointer hover:text-yellow-300 transition"
                      >
                        {dept.nomDepartement}
                      </h3>
                    )}
                  </div>

                  {/* DESCRIPTION – CLIC POUR ÉDITER */}
                  <div className="lg:col-span-6">
                    {editingId === dept.id ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                        rows={3}
                      />
                    ) : (
                      <div onClick={() => startEdit(dept)} className="cursor-pointer">
                        <p className="text-gray-300 leading-relaxed">
                          {dept.description || <span className="text-gray-500 italic">Aucune description – cliquez pour ajouter</span>}
                        </p>
                        <p className="text-sm text-gray-500 mt-3">
                          Créé le {new Date(dept.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BOUTONS VERTICAUX – MODIFIER / SUPPRIMER */}
                  <div className="lg:col-span-3 flex lg:flex-col gap-3 justify-center lg:justify-start">
                    {editingId === dept.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(dept.id)}
                          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition whitespace-nowrap"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(dept)}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteDept(dept.id)}
                          disabled={deletingId === dept.id}
                          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === dept.id ? '...' : 'Supprimer'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}