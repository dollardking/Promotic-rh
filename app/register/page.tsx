'use client';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', prenom: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<typeof formData & { submit?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const newErrors: typeof errors = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Ne correspond pas';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Ne correspond pas';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription");

      alert('Inscription réussie ! Redirection...');
      setTimeout(() => router.push('/login'), 1000);
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg">
        <h1 className="text-4xl font-black text-white text-center mb-8">Inscription promotic_RH</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text" name="nom" value={formData.nom} onChange={handleChange}
                placeholder="Nom"
                className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all ${
                  errors.nom ? 'border-red-500' : formData.nom ? 'border-green-500' : 'border-white/30'
                } focus:outline-none focus:border-white/60`}
              />
              {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom}</p>}
            </div>
            <div>
              <input
                type="text" name="prenom" value={formData.prenom} onChange={handleChange}
                placeholder="Prénom"
                className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all ${
                  errors.prenom ? 'border-red-500' : formData.prenom ? 'border-green-500' : 'border-white/30'
                } focus:outline-none focus:border-white/60`}
              />
              {errors.prenom && <p className="text-red-400 text-xs mt-1">{errors.prenom}</p>}
            </div>
          </div>

          <div>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all ${
                errors.email ? 'border-red-500' : formData.email && !errors.email ? 'border-green-500' : 'border-white/30'
              } focus:outline-none focus:border-white/60`}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Mot de passe"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all ${
                errors.password ? 'border-red-500' : formData.password.length >= 6 ? 'border-green-500' : 'border-white/30'
              } focus:outline-none focus:border-white/60`}
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <input
              type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirmer le mot de passe"
              className={`w-full px-5 py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 transition-all ${
                errors.confirmPassword ? 'border-red-500' : formData.confirmPassword && !errors.confirmPassword ? 'border-green-500' : 'border-white/30'
              } focus:outline-none focus:border-white/60`}
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-center">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Création du compte...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-white/70">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-purple-300 hover:text-white font-bold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}