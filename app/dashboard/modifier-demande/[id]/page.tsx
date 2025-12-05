'use client';
import { useAuth } from '../../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  startDate: string;
  endDate: string;
  type: 'conge' | 'permission';
  reason: string;
}

export default function ModifierDemandePage() {
  const { token, loading } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    startDate: '',
    endDate: '',
    type: 'conge',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || loading || !id) return;
    const fetchConge = async () => {
      try {
        const res = await fetch(`/api/conges/${id}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.conge) {
          setFormData({
            startDate: data.conge.startDate.split('T')[0],
            endDate: data.conge.endDate.split('T')[0],
            type: data.conge.type,
            reason: data.conge.reason
          });
        } else {
          setMessage('Demande non trouvée');
        }
      } catch {
        setMessage('Erreur de chargement');
      }
    };
    fetchConge();
  }, [id, token, loading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/conges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage('Modifiée avec succès ! Redirection...');
        setTimeout(() => router.push('/dashboard/mes-demandes'), 2000);
      } else {
        const error = await res.json();
        setMessage(error.error || 'Erreur');
      }
    } catch {
      setMessage('Erreur réseau');
    } finally {
      setIsSubmitting(false);
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
      {/* MÊME FOND */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-2xl mx-auto text-white">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-2xl">
            Modifier ma demande
          </h1>
          <Link href="/dashboard/mes-demandes" className="inline-block mt-6 text-xl text-indigo-300 hover:text-indigo-100 transition underline">
            ← Retour à mes demandes
          </Link>
        </div>

        {message && (
  <div className={`max-w-xl mx-auto mb-10 p-6 rounded-2xl text-center font-bold text-lg shadow-2xl border-2 transition-all
    ${message.toLowerCase().includes('succès') || message.includes('modifiée')
      ? 'bg-green-600/10 border-green-500 text-indigo-900'
      : 'bg-red-600/10 border-red-500 text-indigo-900'
    }`}>
    {message}
  </div>
)}

        <form onSubmit={handleSubmit} className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-black focus:border-yellow-400 focus:outline-none transition"
            >
              <option value="conge">Congé annuel</option>
              <option value="permission">Permission</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Motif</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={5}
              required
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition disabled:opacity-70"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <Link href="/dashboard/mes-demandes" className="px-8 py-5 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-xl transition text-center">
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}