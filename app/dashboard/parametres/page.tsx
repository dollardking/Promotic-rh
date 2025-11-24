'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function ParametresPage() {
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les infos actuelles
  useEffect(() => {
    if (!token || !user) return;

    const fetchProfil = async () => {
      try {
        const res = await fetch('/api/employes/profil', {
          headers: { authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.employe) {
          setFormData(prev => ({
            ...prev,
            prenom: data.employe.prenom || '',
            nom: data.employe.nom || '',
            email: data.employe.email || user.email || ''
          }));
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      }
    };
    fetchProfil();
  }, [token, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.motDePasse && formData.motDePasse !== formData.confirmMotDePasse) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/employes/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur mise à jour');

      setMessage('Profil mis à jour avec succès !');
      setFormData(prev => ({ ...prev, motDePasse: '', confirmMotDePasse: '' }));
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.message || 'Erreur serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-4xl font-black">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-6 max-w-3xl mx-auto">
        <h1 className="text-7xl font-black text-white text-center mb-16 drop-shadow-2xl">
          Mes Paramètres
        </h1>

        {message && (
          <div className={`mb-10 p-6 rounded-3xl text-center font-bold text-2xl transition-all ${
            message.includes('succès')
              ? 'bg-green-500/20 border-4 border-green-400 text-green-300 animate-bounce'
              : 'bg-red-500/20 border-4 border-red-400 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl space-y-10">
          {/* Avatar */}
          <div className="text-center">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl font-black text-white shadow-2xl">
              {formData.prenom[0]}{formData.nom[0]}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-white/90 text-xl font-bold">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              />
            </div>
            <div>
              <label className="text-white/90 text-xl font-bold">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-white/90 text-xl font-bold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-white/90 text-xl font-bold">Nouveau mot de passe</label>
              <input
                type="password"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="Laissez vide pour ne pas changer"
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              />
            </div>
            <div>
              <label className="text-white/90 text-xl font-bold">Confirmer mot de passe</label>
              <input
                type="password"
                name="confirmMotDePasse"
                value={formData.confirmMotDePasse}
                onChange={handleChange}
                placeholder="Répéter le mot de passe"
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-3xl rounded-2xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Sauvegarde...' : 'Mettre à jour mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
}