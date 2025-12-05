'use client';
import { useAuth } from '../../lib/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardData {
  employe: {
    prenom: string;
    nom: string;
    email: string;
    photoUrl?: string;
    departement?: { nomDepartement: string };
  };
  stats: {
    congesEnAttente: number;
    permissionsEnAttente: number;
    congesApprouves: number;
    presencesCeMois: number;
    absencesCeMois: number;
    salairesDerniers6Mois: { mois: string; montant: number }[];
  };
}

export default function DashboardHome() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          headers: { authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok) {
          const salaires = result.stats?.salairesDerniers6Mois || [];
          const salairesSafe = salaires.length > 0 ? salaires : [];

          setData({
            employe: result.employe || {},
            stats: {
              congesEnAttente: result.stats?.congesEnAttente || 0,
              permissionsEnAttente: result.stats?.permissionsEnAttente || 0,
              congesApprouves: result.stats?.congesApprouves || 0,
              presencesCeMois: result.stats?.presencesCeMois || 0,
              absencesCeMois: result.stats?.absencesCeMois || 0,
              salairesDerniers6Mois: salairesSafe
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-400 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  const { employe, stats } = data;
  const totalEnAttente = stats.congesEnAttente + stats.permissionsEnAttente;
  const hasSalary = stats.salairesDerniers6Mois.length > 0;

  const chartData = {
    labels: hasSalary ? stats.salairesDerniers6Mois.map(s => s.mois) : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Salaire net',
      data: hasSalary ? stats.salairesDerniers6Mois.map(s => s.montant) : [0, 0, 0, 0, 0, 0],
      backgroundColor: hasSalary ? 'rgba(99, 102, 241, 0.7)' : 'rgba(100, 100, 100, 0.3)',
      borderColor: hasSalary ? '#6366f1' : '#666',
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 35,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 }, // Peu d'animation
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: hasSalary ? 'Évolution de votre salaire' : 'Aucun salaire enregistré',
        color: hasSalary ? '#e0e7ff' : '#666',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: { enabled: hasSalary }
    },
    scales: {
      y: { 
        ticks: { color: '#c7d2fe' }, 
        grid: { color: 'rgba(255,255,255,0.08)' },
        beginAtZero: true
      },
      x: { ticks: { color: '#c7d2fe' }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  };

  return (
    <>
      {/* FOND NOIR + SOLEIL DISCRET – IDENTIQUE AUX AUTRES */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto text-white">

        {/* BIENVENUE + RÔLE EMPLOYÉ */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-yellow-400 drop-shadow-2xl">
            Bonjour, {employe.prenom}
          </h1>
          <p className="text-3xl text-gray-300 mt-4">Employé Promotic Togo</p>
        </div>

        {/* PROFIL + STATUT EN LIGNE */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 mb-12 shadow-2xl relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-44 h-44 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-7xl font-black text-white shadow-2xl border-4 border-white/20 overflow-hidden">
                {employe.photoUrl ? (
                  <img src={employe.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <>{employe.prenom[0]}{employe.nom[0]}</>
                )}
              </div>
              {/* STATUT EN LIGNE */}
              <div className="absolute bottom-2 right-2 bg-green-500 w-14 h-14 rounded-full border-4 border-black flex items-center justify-center shadow-2xl">
                <span className="text-3xl">Online</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-4xl font-bold">{employe.prenom} {employe.nom}</h2>
              <p className="text-xl text-gray-300 mt-2">{employe.email}</p>
              {employe.departement && (
                <p className="text-2xl text-yellow-400 mt-4 font-bold">
                  {employe.departement.nomDepartement}
                </p>
              )}
            </div>

            <Link href="/dashboard/profil" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg">
              Mon profil
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-8">Congés & Permissions</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-5xl font-black text-orange-400">{totalEnAttente}</p>
                <p className="text-xl text-gray-300 mt-3">En attente</p>
              </div>
              <div>
                <p className="text-5xl font-black text-green-400">{stats.congesApprouves}</p>
                <p className="text-xl text-gray-300 mt-3">Approuvés</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-8">Présences ce mois</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-5xl font-black text-green-400">{stats.presencesCeMois}</p>
                <p className="text-xl text-gray-300 mt-3">Présent</p>
              </div>
              <div>
                <p className="text-5xl font-black text-red-400">{stats.absencesCeMois}</p>
                <p className="text-xl text-gray-300 mt-3">Absent</p>
              </div>
            </div>
          </div>
        </div>

        {/* DIAGRAMME – CORRIGÉ À 100% */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-10 mb-12">
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* RACCOURCIS – LISIBLES, CLAIRS, COULEUR UNIFORME */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/dashboard/presences" className="block group">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-center hover:scale-105 transition-all shadow-2xl border border-white/10">
              <div className="text-7xl mb-4">Finger Print</div>
              <p className="text-2xl font-black">Pointer maintenant</p>
            </div>
          </Link>

          <Link href="/dashboard/conges" className="block group">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-12 text-center hover:scale-105 transition-all shadow-2xl border border-white/10">
              <div className="text-7xl mb-4">Calendar</div>
              <p className="text-2xl font-black">Demander congé</p>
            </div>
          </Link>

          <Link href="/dashboard/salaires" className="block group">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-12 text-center hover:scale-105 transition-all shadow-2xl border border-white/10">
              <div className="text-7xl mb-4">Money</div>
              <p className="text-2xl font-black">Ma paie</p>
            </div>
          </Link>
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}