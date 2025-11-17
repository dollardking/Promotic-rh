// app/rh-dashboard/departements/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Departement {
  id: number;
  nomDepartement: string;
  description: string | null;
  employes?: { id: number; prenom: string; nom: string; email: string }[];
}

interface Rapport {
  id: number;
  type: string;
  dateGeneration: string;
}

interface Employe {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

export default function DepartementsPage() {
  const { token, loading } = useAuth();
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formDept, setFormDept] = useState({ nom: '', description: '' });
  const [formRapport, setFormRapport] = useState({ type: 'PDF' });
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);

  useEffect(() => {
    if (loading || !token) return;

    const fetchAll = async () => {
      try {
        const [deptRes, rapportRes, empRes] = await Promise.all([
          fetch('/api/departements', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/rapports', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/employes', { headers: { authorization: `Bearer ${token}` } }),
        ]);

        const [deptData, rapportData, empData] = await Promise.all([
          deptRes.json(),
          rapportRes.json(),
          empRes.json(),
        ]);

        const safeDepartements = (deptData.departements || []).map((d: any) => ({
          ...d,
          employes: Array.isArray(d.employes) ? d.employes : [],
        }));

        setDepartements(safeDepartements);
        setRapports(rapportData.rapports || []);
        setEmployes(empData.employes || []);
      } catch (err) {
        setMessage('Erreur de chargement des données.');
      }
    };

    fetchAll();
  }, [token, loading]);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDept.nom) return setMessage('Le nom est requis.');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomDepartement: formDept.nom,
          description: formDept.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création');

      setDepartements(prev => [...prev, { ...data.departement, employes: [] }]);
      setFormDept({ nom: '', description: '' });
      setMessage('Département ajouté avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmployeToDept = async () => {
    if (!selectedDept || !selectedEmployeId) {
      setMessage('Sélectionnez un département et un employé.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departements/employe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departementId: selectedDept, employeId: selectedEmployeId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur ajout');

      const employeToAdd = employes.find(e => e.id === selectedEmployeId)!;

      setDepartements(prev =>
        prev.map(d =>
          d.id === selectedDept
            ? { ...d, employes: [...(d.employes || []), employeToAdd] }
            : d
        )
      );

      setMessage('Employé affecté au département !');
      setSelectedEmployeId(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRapport = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rapports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: formRapport.type }),
      });

      if (!res.ok) throw new Error('Erreur génération');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-departements-${Date.now()}.${formRapport.type === 'PDF' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage(`Rapport ${formRapport.type} téléchargé !`);
      setTimeout(() => setMessage(''), 3000);

      // Rafraîchir la liste
      const updated = await fetch('/api/rapports', { headers: { authorization: `Bearer ${token}` } });
      const data = await updated.json();
      setRapports(data.rapports || []);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToAdmin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rapports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: formRapport.type }),
      });

      if (!res.ok) throw new Error('Erreur envoi');

      setMessage(`Rapport ${formRapport.type} envoyé à l'admin !`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold text-center text-blue-800">Gestion des Départements & Rapports</h1>

        {message && (
          <div
            className={`p-4 rounded-lg text-center font-medium border transition-all ${
              message.includes('succès') || message.includes('téléchargé') || message.includes('envoyé')
                ? 'text-green-700 bg-green-100 border-green-300'
                : 'text-red-700 bg-red-100 border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* === DÉPARTEMENTS === */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-black">Départements</h2>

          <form onSubmit={handleAddDept} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nom du département</label>
                <input
                  type="text"
                  value={formDept.nom}
                  onChange={e => setFormDept(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Informatique"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Description</label>
                <input
                  type="text"
                  value={formDept.description}
                  onChange={e => setFormDept(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>

          <div className="space-y-4">
            {departements.map(dept => (
              <div key={dept.id} className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-bold text-orange-600 text-lg">{dept.nomDepartement}</h3>
                {dept.description && <p className="text-sm text-gray-600 mt-1">{dept.description}</p>}
                <p className="text-sm font-medium text-black mt-3">
                  Employés ({dept.employes?.length || 0}) :
                </p>
                <ul className="ml-4 mt-1 text-sm text-gray-700">
                  {(dept.employes?.length || 0) === 0 ? (
                    <li className="italic">Aucun</li>
                  ) : (
                    dept.employes!.map(emp => (
                      <li key={emp.id}>{emp.prenom} {emp.nom} ({emp.email})</li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* === AFFECTER EMPLOYÉ === */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-black">Affecter un employé</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedDept || ''}
              onChange={e => setSelectedDept(e.target.value ? parseInt(e.target.value) : null)}
              className="p-3 border rounded-lg text-black"
            >
              <option value="">Département</option>
              {departements.map(d => (
                <option key={d.id} value={d.id}>{d.nomDepartement}</option>
              ))}
            </select>
            <select
              value={selectedEmployeId || ''}
              onChange={e => setSelectedEmployeId(e.target.value ? parseInt(e.target.value) : null)}
              className="p-3 border rounded-lg text-black"
            >
              <option value="">Employé</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
            <button
              onClick={handleAddEmployeToDept}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-60"
            >
              Affecter
            </button>
          </div>
        </section>

        {/* === RAPPORTS === */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">Rapports générés</h2>
            <Link href="/rh-dashboard/rapports" className="text-blue-600 hover:underline text-sm">
              Voir tous
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={formRapport.type}
              onChange={e => setFormRapport({ type: e.target.value })}
              className="p-3 border rounded-lg text-black"
            >
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
            </select>
            <button
              onClick={handleGenerateRapport}
              disabled={isSubmitting}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-60"
            >
              Générer & Télécharger
            </button>
            <button
              onClick={handleSendToAdmin}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-60"
            >
              Envoyer à Admin
            </button>
          </div>

          <div className="space-y-2">
            {rapports.slice(0, 5).map(r => (
              <div key={r.id} className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center text-sm">
                <span className="text-black">
                  <strong className={r.type === 'PDF' ? 'text-red-600' : 'text-green-600'}>
                    {r.type}
                  </strong>{' '}
                  - {new Date(r.dateGeneration).toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-gray-500">ID: {r.id}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}