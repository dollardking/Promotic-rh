'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  nomFichier: string;
}

interface Employe {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

export default function DepartementsRHPage() {
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

        setDepartements(deptData.departements || []);
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
    if (!formDept.nom.trim()) return setMessage('Le nom est requis.');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ nomDepartement: formDept.nom, description: formDept.description || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création');
      setDepartements(prev => [...prev, { ...data.departement, employes: [] }]);
      setFormDept({ nom: '', description: '' });
      setMessage('Département créé avec succès !');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmployeToDept = async () => {
    if (!selectedDept || !selectedEmployeId) return setMessage('Sélectionnez département + employé');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departements/employe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ departementId: selectedDept, employeId: selectedEmployeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      const emp = employes.find(e => e.id === selectedEmployeId)!;
      setDepartements(prev => prev.map(d => d.id === selectedDept ? { ...d, employes: [...(d.employes || []), emp] } : d));
      setMessage(`${emp.prenom} ${emp.nom} affecté avec succès !`);
      setSelectedEmployeId(null);
      setTimeout(() => setMessage(''), 4000);
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
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: formRapport.type }),
      });
      if (!res.ok) throw new Error('Erreur génération');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-promotic-${format(new Date(), 'dd-MM-yyyy')}.${formRapport.type === 'PDF' ? 'pdf' : 'xlsx'}`;
      a.click();
      setMessage(`Rapport ${formRapport.type} généré & envoyé à l'Admin !`);
      setTimeout(() => setMessage(''), 5000);
      const updated = await fetch('/api/rapports', { headers: { authorization: `Bearer ${token}` } });
      const data = await updated.json();
      setRapports(data.rapports || []);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-6xl font-black animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* TITRE ÉPIQUE */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black text-white drop-shadow-2xl">
            Départements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Rapports RH</span>
          </h1>
          <p className="text-3xl text-white/80 mt-4">Structure • Organisation • Contrôle Total</p>
        </div>

        {message && (
          <div className="text-center mb-10">
            <div className={`inline-block backdrop-blur-xl rounded-3xl px-12 py-6 border ${message.includes('succès') || message.includes('généré') ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'}`}>
              <p className="text-3xl font-black text-white">{message}</p>
            </div>
          </div>
        )}

        {/* CRÉER DÉPARTEMENT */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl mb-10">
          <h2 className="text-4xl font-black text-white mb-8 text-center">Créer un nouveau département</h2>
          <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Nom du département (ex: Marketing)"
              value={formDept.nom}
              onChange={e => setFormDept(prev => ({ ...prev, nom: e.target.value }))}
              className="p-6 rounded-2xl bg-white/20 text-white text-xl placeholder-white/60 border border-white/30 focus:ring-4 focus:ring-purple-500"
              required
            />
            <input
              type="text"
              placeholder="Description (facultatif)"
              value={formDept.description}
              onChange={e => setFormDept(prev => ({ ...prev, description: e.target.value }))}
              className="p-6 rounded-2xl bg-white/20 text-white text-xl placeholder-white/60 border border-white/30 focus:ring-4 focus:ring-purple-500"
            />
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-16 py-6 rounded-2xl font-black text-3xl hover:scale-110 transition shadow-2xl"
              >
                {isSubmitting ? 'Création...' : 'Créer le département'}
              </button>
            </div>
          </form>
        </section>

        {/* LISTE DÉPARTEMENTS */}
        <section className="space-y-8 mb-12">
          <h2 className="text-5xl font-black text-white text-center mb-10">Liste des départements</h2>
          {departements.map(dept => (
            <div key={dept.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:scale-[1.02] transition-all duration-300 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-black text-purple-300">{dept.nomDepartement}</h3>
                  {dept.description && <p className="text-xl text-white/80 mt-3 italic">"{dept.description}"</p>}
                  <p className="text-2xl text-cyan-400 mt-6 font-bold">
                    {dept.employes?.length || 0} membre{dept.employes?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <ul className="space-y-2 text-white/90">
                    {dept.employes?.length === 0 ? (
                      <li className="italic text-white/60">Aucun employé</li>
                    ) : (
                      dept.employes!.map(emp => (
                        <li key={emp.id} className="text-lg">
                          {emp.prenom} {emp.nom}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* AFFECTER EMPLOYÉ – DROPDOWNS LISIBLES */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl mb-12">
          <h2 className="text-4xl font-black text-white text-center mb-8">Affecter un employé à un département</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* DROPDOWN DÉPARTEMENT – FOND BLANC + TEXTE NOIR */}
            <select
              value={selectedDept || ''}
              onChange={e => setSelectedDept(e.target.value ? parseInt(e.target.value) : null)}
              className="p-6 rounded-2xl bg-white text-black text-xl font-medium border border-gray-300 focus:ring-4 focus:ring-purple-500 shadow-lg"
            >
              <option value="">Choisir un département</option>
              {departements.map(d => (
                <option key={d.id} value={d.id}>{d.nomDepartement}</option>
              ))}
            </select>

            {/* DROPDOWN EMPLOYÉ – FOND BLANC + TEXTE NOIR */}
            <select
              value={selectedEmployeId || ''}
              onChange={e => setSelectedEmployeId(e.target.value ? parseInt(e.target.value) : null)}
              className="p-6 rounded-2xl bg-white text-black text-xl font-medium border border-gray-300 focus:ring-4 focus:ring-purple-500 shadow-lg"
            >
              <option value="">Choisir un employé</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>

            <button
              onClick={handleAddEmployeToDept}
              disabled={isSubmitting || !selectedDept || !selectedEmployeId}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-6 rounded-2xl font-black text-2xl hover:scale-110 transition shadow-2xl disabled:opacity-50"
            >
              Affecter
            </button>
          </div>
        </section>

        {/* GÉNÉRER RAPPORT – DROPDOWN FORMAT LISIBLES */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
          <h2 className="text-5xl font-black text-white mb-10">
            Générer le Rapport Officiel <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">PROMOTIC RH</span>
          </h2>
          <p className="text-2xl text-white/80 mb-10">
            Inclut : Départements • Congés • Présences • Salaires payés
          </p>
          <div className="flex justify-center gap-8 items-center flex-wrap">
            {/* DROPDOWN FORMAT – FOND BLANC + TEXTE NOIR */}
            <select
              value={formRapport.type}
              onChange={e => setFormRapport({ type: e.target.value })}
              className="p-6 rounded-2xl bg-white text-black text-2xl font-bold border border-gray-300 focus:ring-4 focus:ring-purple-500 shadow-lg"
            >
              <option value="PDF">PDF (Officiel)</option>
              <option value="Excel">Excel (Détaillé)</option>
            </select>

            <button
              onClick={handleGenerateRapport}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-16 py-8 rounded-3xl font-black text-4xl hover:scale-110 transition shadow-2xl"
            >
              {isSubmitting ? 'Génération...' : 'Générer & Envoyer à Admin'}
            </button>
          </div>
        </section>

        {/* DERNIERS RAPPORTS */}
        {rapports.length > 0 && (
          <section className="mt-16">
            <h2 className="text-4xl font-black text-white text-center mb-8">Derniers rapports envoyés</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rapports.slice(0, 6).map(r => (
                <div key={r.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                  <p className="text-3xl font-black text-cyan-400">{r.type}</p>
                  <p className="text-lg text-white/80 mt-2">
                    {format(new Date(r.dateGeneration), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </p>
                  <p className="text-sm text-white/60 mt-3 italic">{r.nomFichier}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}