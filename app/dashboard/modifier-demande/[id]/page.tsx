'use client';
import { useAuth } from '../../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
          setMessage('Demande non trouvée ou déjà traitée');
        }
      } catch (err) {
        setMessage('Erreur de chargement de la demande');
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
        setMessage('Demande modifiée avec succès ! Redirection...');
        setTimeout(() => router.push('/dashboard/mes-demandes'), 2000);
      } else {
        const error = await res.json();
        setMessage(error.error || 'Erreur lors de la modification');
      }
    } catch {
      setMessage('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-2xl">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-white text-center mb-12 drop-shadow-2xl">
          Modifier ma demande
        </h1>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl text-center font-bold text-xl transition-all ${
            message.includes('succès') 
              ? 'bg-green-500/20 border-2 border-green-400 text-green-300' 
              : 'bg-red-500/20 border-2 border-red-400 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-white/80 text-lg font-medium">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-white/80 text-lg font-medium">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-white/80 text-lg font-medium">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white focus:border-purple-400 focus:outline-none transition"
            >
              <option value="conge" className="bg-gray-800">Congé annuel</option>
              <option value="permission" className="bg-gray-800">Permission</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-lg font-medium">Raison / Motif</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={6}
              required
              className="w-full mt-3 px-6 py-5 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/mes-demandes')}
              className="px-8 py-6 bg-white/20 text-white font-bold text-xl rounded-xl hover:bg-white/30 transition"
            >
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}