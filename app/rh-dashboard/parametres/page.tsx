'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ParametresPage() {
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (loading || !token || !user?.id) return;
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            prenom: data.user.prenom || '',
            nom: data.user.nom || '',
            email: data.user.email || '',
            motDePasse: '',
          });
        }
      } catch (error) {
        console.error('Erreur chargement profil RH:', error);
      }
    };
    fetchUserData();
  }, [token, loading, user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur mise à jour');
      setMessage('Profil RH mis à jour avec succès !');
      setTimeout(() => setMessage(''), 4000);
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-black">
      <div className="text-6xl font-black text-white animate-pulse">Chargement RH...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black relative overflow-hidden">
      {/* Fond animé avec particules */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          {/* Titre RH de malade */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black text-center mb-12 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl"
          >
            PARAMÈTRES 
          </motion.h1>

          {/* Message de succès */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center p-4 rounded-2xl text-2xl font-bold mb-8 ${
                message.includes('succès')
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                  : 'bg-red-500/20 border-2 border-red-500 text-red-300'
              } backdrop-blur-xl`}
            >
              {message}
            </motion.div>
          )}

          {/* Formulaire de luxe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-10 text-center bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Modifier votre profil 
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <label className="block text-xl font-bold text-yellow-300 mb-3">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/50 text-xl focus:outline-none focus:border-yellow-400 transition-all duration-300"
                    required
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <label className="block text-xl font-bold text-yellow-300 mb-3">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/50 text-xl focus:outline-none focus:border-yellow-400 transition-all duration-300"
                    required
                  />
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <label className="block text-xl font-bold text-yellow-300 mb-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/50 text-xl focus:outline-none focus:border-pink-400 transition-all duration-300"
                  required
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <label className="block text-xl font-bold text-yellow-300 mb-3">
                  Nouveau mot de passe (laisser vide pour conserver)
                </label>
                <input
                  type="password"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  placeholder="••••••••••••••"
                  className="w-full px-6 py-5 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/40 text-xl focus:outline-none focus:border-purple-400 transition-all duration-300"
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-6 mt-10 text-3xl font-black rounded-3xl transition-all duration-500 transform ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-10 w-10 mr-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mise à jour en cours...
                  </span>
                ) : (
                  'SAUVEGARDER LES CHANGEMENTS'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}