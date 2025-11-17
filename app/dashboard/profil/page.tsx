// app/dashboard/profil/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

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
  departement: { nomDepartement: string } | null;
  utilisateurId: number;
}

interface Summary {
  presencesCount: number;
  salairesCount: number;
  congesCount: number;
  permissionsCount: number;
}

export default function ProfilPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [employe, setEmploye] = useState<EmployeData | null>(null);
  const [summary, setSummary] = useState<Summary>({
    presencesCount: 0,
    salairesCount: 0,
    congesCount: 0,
    permissionsCount: 0,
  });
  const [form, setForm] = useState({
    telephone: '',
    dateEmbauche: '',
    dateDepart: '',
    competences: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading || !token || !user) return;

    const fetchProfil = async () => {
      setLoading(true);
      try {
        // 1. Profil employé
        const empRes = await fetch('/api/employes/profil', {
          headers: { authorization: `Bearer ${token}` },
        });
        const empData = await empRes.json();

        if (empRes.ok && empData.employe) {
          setEmploye(empData.employe);
          setForm({
            telephone: empData.employe.telephone || '',
            dateEmbauche: empData.employe.dateEmbauche?.split('T')[0] || '',
            dateDepart: empData.employe.dateDepart?.split('T')[0] || '',
            competences: empData.employe.competences || '',
          });
        } else {
          setMessage('Profil non trouvé.');
          setLoading(false);
          return;
        }

        // 2. Résumé : CORRIGÉ
        const [presRes, salRes, congeRes, permRes] = await Promise.all([
          fetch('/api/presences', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/salaires', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/conges', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/permissions', { headers: { authorization: `Bearer ${token}` } }),
        ]);

        const presData = await presRes.json();
        const salData = await salRes.json();
        const congeData = await congeRes.json();
        const permData = await permRes.json();

        setSummary({
          presencesCount: Array.isArray(presData.presences) ? presData.presences.length : 0,
          salairesCount: Array.isArray(salData.salaires) ? salData.salaires.length : 0,
          congesCount: Array.isArray(congeData.conges) ? congeData.conges.length : 0,
          permissionsCount: Array.isArray(permData.permissions) ? permData.permissions.length : 0,
        });
      } catch (error) {
        console.error('Erreur fetch:', error);
        setMessage('Erreur de chargement du profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [token, authLoading, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employe) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/employes/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telephone: form.telephone,
          dateEmbauche: form.dateEmbauche || null,
          dateDepart: form.dateDepart || null,
          competences: form.competences,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur mise à jour');

      setMessage('Profil mis à jour avec succès !');
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setMessage('Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-black mt-4">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!employe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <p className="text-red-600">Aucun profil employé trouvé.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold text-center text-blue-800">Mon Profil</h1>

        {message && (
          <div
            className={`p-4 rounded-lg text-center font-medium border transition-all ${
              message.includes('succès') ? 'text-green-700 bg-green-100 border-green-300' : 'text-red-700 bg-red-100 border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-black mb-4">Informations Personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
            <p><strong>Matricule :</strong> {employe.matricule}</p>
            <p><strong>Prénom :</strong> {employe.prenom}</p>
            <p><strong>Nom :</strong> {employe.nom}</p>
            <p><strong>Email :</strong> {employe.email}</p>
            <p><strong>Département :</strong> {employe.departement?.nomDepartement || 'Aucun'}</p>
            <p><strong>Statut :</strong> <span className={employe.actif ? 'text-green-600' : 'text-red-600'}>{employe.actif ? 'Actif' : 'Inactif'}</span></p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-black mb-4">Compléter mon profil</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                placeholder="ex: +225 01 02 03 04"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Date d&apos;embauche</label>
                <input
                  type="date"
                  value={form.dateEmbauche}
                  onChange={(e) => setForm({ ...form, dateEmbauche: e.target.value })}
                  className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Date de départ (facultatif)</label>
                <input
                  type="date"
                  value={form.dateDepart}
                  onChange={(e) => setForm({ ...form, dateDepart: e.target.value })}
                  className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Compétences</label>
              <textarea
                value={form.competences}
                onChange={(e) => setForm({ ...form, competences: e.target.value })}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ex: JavaScript, React, Gestion de projet..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Mettre à jour le profil'
              )}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-black mb-4">Résumé de mes activités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-700">{summary.presencesCount}</p>
              <p className="text-sm text-gray-600">Présences enregistrées</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">{summary.salairesCount}</p>
              <p className="text-sm text-gray-600">Salaires versés</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-700">{summary.congesCount}</p>
              <p className="text-sm text-gray-600">Congés pris</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-700">{summary.permissionsCount}</p>
              <p className="text-sm text-gray-600">Permissions demandées</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}