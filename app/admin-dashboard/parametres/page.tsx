'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function ParametresPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/params', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        setForm(prev => ({ ...prev, ...data }));
      } catch (err) {
        setMessage({ type: 'error', text: 'Impossible de charger les données' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    if (form.motDePasse && form.motDePasse !== form.confirmerMotDePasse) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          motDePasse: form.motDePasse || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setMessage({ type: 'success', text: data.message });
      setForm(prev => ({ ...prev, motDePasse: '', confirmerMotDePasse: '' }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-20 text-purple-600 text-2xl font-medium">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-purple-800 text-center mb-10">Paramètres du compte</h1>

        {message && (
          <div className={`p-4 rounded-xl text-center font-medium mb-6 border ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })}
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-black"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                placeholder="Laissez vide pour ne pas changer"
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-black placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">Confirmer mot de passe</label>
              <input
                type="password"
                value={form.confirmerMotDePasse}
                onChange={e => setForm({ ...form, confirmerMotDePasse: e.target.value })}
                placeholder="Répétez le mot de passe"
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-black placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde...
              </span>
            ) : (
              'Sauvegarder les modifications'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}