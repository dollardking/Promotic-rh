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
        setForm(prev => ({
          ...prev,
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
        }));
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

      setMessage({ type: 'success', text: data.message || 'Modifications sauvegardées !' });
      setForm(prev => ({ ...prev, motDePasse: '', confirmerMotDePasse: '' }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* MÊME FOND QUE TOUTES LES PAGES ADMIN – NOIR + SOLEIL SCINTILLANT */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-4xl mx-auto text-white">
        {/* TITRE */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 text-yellow-400 drop-shadow-2xl">
          Paramètres Administrateur
        </h1>

        {/* MESSAGE */}
        {message && (
          <div className={`text-center p-5 rounded-2xl mb-10 text-lg font-bold backdrop-blur-sm border ${
            message.type === 'success'
              ? 'bg-green-600/30 border-green-500 text-green-300'
              : 'bg-red-600/30 border-red-500 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-yellow-400 font-semibold mb-3">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none transition"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Nouveau mot de passe</label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                placeholder="Laissez vide pour conserver l'actuel"
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none transition placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Confirmer mot de passe</label>
              <input
                type="password"
                value={form.confirmerMotDePasse}
                onChange={(e) => setForm({ ...form, confirmerMotDePasse: e.target.value })}
                placeholder="Répétez le nouveau mot de passe"
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none transition placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-xl rounded-xl shadow-lg hover:from-yellow-400 hover:to-amber-500 hover:scale-105 transition disabled:opacity-70"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-4">
                <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                SAUVEGARDE EN COURS...
              </span>
            ) : (
              'SAUVEGARDER LES MODIFICATIONS'
            )}
          </button>
        </form>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}