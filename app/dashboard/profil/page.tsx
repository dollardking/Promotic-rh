'use client';
import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';

interface EmployeData {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  dateEmbauche: string | null;
  dateDepart: string | null;
  competences: string | null;
  actif: boolean;
  photoUrl?: string;
  departement: { nomDepartement: string } | null;
}

export default function ProfilPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [employe, setEmploye] = useState<EmployeData | null>(null);
  const [form, setForm] = useState({
    telephone: '', dateEmbauche: '', dateDepart: '', competences: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading || !token || !user) return;

    const fetchProfil = async () => {
      try {
        const res = await fetch('/api/employes/profil', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.employe) {
          setEmploye(data.employe);
          setPreviewUrl(data.employe.photoUrl || '');
          setForm({
            telephone: data.employe.telephone || '',
            dateEmbauche: data.employe.dateEmbauche?.split('T')[0] || '',
            dateDepart: data.employe.dateDepart?.split('T')[0] || '',
            competences: data.employe.competences || '',
          });
        }
      } catch (err) {
        setMessage({ text: 'Erreur de chargement', type: 'error' });
      }
    };
    fetchProfil();
  }, [token, authLoading, user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification taille (max 3Mo) et type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Seules les images sont autorisées', type: 'error' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ text: 'Image trop lourde (max 3 Mo)', type: 'error' });
      return;
    }

    // Preview instantanée
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await fetch('/api/employes/upload-avatar', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setEmploye(prev => prev ? { ...prev, photoUrl: data.photoUrl } : null);
        setMessage({ text: 'Photo mise à jour !', type: 'success' });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Échec upload', type: 'error' });
      setPreviewUrl(employe?.photoUrl || '');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employe) return;

    setSaving(true);
    try {
      const res = await fetch('/api/employes/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ text: 'Profil mis à jour !', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Échec de la sauvegarde', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (authLoading || !employe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-2xl">Chargement du profil...</div>
      </div>
    );
  }

  const avatarUrl = previewUrl || employe.photoUrl || '/default-avatar.png';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 p-6 max-w-5xl mx-auto">

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-center font-bold border-2 transition-all ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-400 text-green-300' 
              : 'bg-red-500/20 border-red-400 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">

          {/* COLONNE AVATAR */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mx-auto mb-6">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <svg className="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-lg hover:scale-110 transition"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <h2 className="text-3xl font-black text-white mb-2">
                {employe.prenom} {employe.nom}
              </h2>
              <p className="text-white/70 text-lg">{employe.matricule}</p>
              <p className="text-purple-300 text-sm mt-2">
                {employe.departement?.nomDepartement || 'Aucun département'}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* COLONNE INFO + FORM */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-6 text-white/80">
                <div><strong>Email :</strong> {employe.email}</div>
                <div><strong>Téléphone :</strong> {employe.telephone || 'Non renseigné'}</div>
                <div><strong>Date embauche :</strong> {form.dateEmbauche || 'Non renseignée'}</div>
                <div><strong>Statut :</strong> <span className={employe.actif ? 'text-green-400' : 'text-red-400'}>
                  {employe.actif ? 'Actif' : 'Inactif'}
                </span></div>
              </div>
            </div>

            <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Mettre à jour mon profil</h3>
              <div className="space-y-6">
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition"
                />
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="date"
                    value={form.dateEmbauche}
                    onChange={(e) => setForm({ ...form, dateEmbauche: e.target.value })}
                    className="px-6 py-4 rounded-xl bg-white/10 border border-white/30 text-white focus:border-purple-400 focus:outline-none transition"
                  />
                  <input
                    type="date"
                    placeholder="Date de départ"
                    value={form.dateDepart}
                    onChange={(e) => setForm({ ...form, dateDepart: e.target.value })}
                    className="px-6 py-4 rounded-xl bg-white/10 border border-white/30 text-white focus:border-purple-400 focus:outline-none transition"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Compétences (React, Node.js, Gestion de projet...)"
                  value={form.competences}
                  onChange={(e) => setForm({ ...form, competences: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition resize-none"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition disabled:opacity-60"
                >
                  {saving ? 'Enregistrement...' : 'Mettre à jour le profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}