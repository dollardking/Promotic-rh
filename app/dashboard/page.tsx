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
          const safeData = {
            employe: result.employe || {},
            stats: {
              congesEnAttente: result.stats?.congesEnAttente || 0,
              permissionsEnAttente: result.stats?.permissionsEnAttente || 0,
              congesApprouves: result.stats?.congesApprouves || 0,
              presencesCeMois: result.stats?.presencesCeMois || 0,
              absencesCeMois: result.stats?.absencesCeMois || 0,
              salairesDerniers6Mois: Array.isArray(result.stats?.salairesDerniers6Mois)
                ? result.stats.salairesDerniers6Mois
                : [{ mois: 'Aucun', montant: 0 }]
            }
          };
          setData(safeData);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-5xl font-black animate-pulse">Chargement...</div>
      </div>
    );
  }

  const { employe, stats } = data;
  const totalEnAttente = stats.congesEnAttente + stats.permissionsEnAttente;

  const chartData = {
    labels: stats.salairesDerniers6Mois.map(s => s.mois),
    datasets: [{
      label: 'Salaire net',
      data: stats.salairesDerniers6Mois.map(s => s.montant),
      backgroundColor: 'rgba(167, 139, 250, 0.6)',
      borderColor: '#a78bfa',
      borderWidth: 3,
      borderRadius: 12,
      barThickness: 40,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Évolution de votre paie (6 derniers mois)', color: '#fff', font: { size: 20, weight: 'bold' } }
    },
    scales: {
      y: { ticks: { color: '#e9d5ff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#e9d5ff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* BIENVENUE */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black text-white drop-shadow-2xl">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {employe.prenom} !
            </span>
          </h1>
          <p className="text-3xl text-white/80 mt-4">Votre espace RH personnalisé</p>
        </div>

        {/* PROFIL */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl mb-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-8xl font-black text-white shadow-2xl overflow-hidden">
                {employe.photoUrl ? (
                  <img src={employe.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <>{employe.prenom[0]}{employe.nom[0]}</>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-green-500 w-16 h-16 rounded-full border-4 border-indigo-900 flex items-center justify-center shadow-xl">
                <span className="text-3xl">Online</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-5xl font-black text-white">{employe.prenom} {employe.nom}</h2>
              <p className="text-2xl text-white/80 mt-2">{employe.email}</p>
              {employe.departement && (
                <p className="text-xl text-purple-300 mt-3 font-bold">
                  {employe.departement.nomDepartement}
                </p>
              )}
            </div>

            <Link href="/dashboard/profil" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-xl hover:scale-105 transition shadow-xl">
              Profil
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            <h3 className="text-3xl font-black text-white text-center mb-8">Congés & Permissions</h3>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-5xl font-black text-yellow-400">{totalEnAttente}</p>
                <p className="text-xl text-white/80 mt-2">En attente</p>
                {(stats.congesEnAttente > 0 || stats.permissionsEnAttente > 0) && (
                  <p className="text-sm text-white/60 mt-1">
                    {stats.congesEnAttente > 0 && `${stats.congesEnAttente} congé${stats.congesEnAttente > 1 ? 's' : ''}`}
                    {stats.congesEnAttente > 0 && stats.permissionsEnAttente > 0 && ' · '}
                    {stats.permissionsEnAttente > 0 && `${stats.permissionsEnAttente} perm.${stats.permissionsEnAttente > 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-5xl font-black text-green-400">{stats.congesApprouves}</p>
                <p className="text-xl text-white/80 mt-2">Approuvés</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            <h3 className="text-3xl font-black text-white text-center mb-8">Présences ce mois</h3>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-5xl font-black text-green-400">{stats.presencesCeMois}</p>
                <p className="text-xl text-white/80 mt-2">Présent</p>
              </div>
              <div>
                <p className="text-5xl font-black text-red-400">{stats.absencesCeMois}</p>
                <p className="text-xl text-white/80 mt-2">Absent</p>
              </div>
            </div>
          </div>
        </div>

        {/* DIAGRAMME */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl mb-12">
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* RACCOURCIS – Emoji réduits + alignement parfait */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/presences" className="block group">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-center shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition duration-300 h-full flex flex-col justify-center">
              <div className="text-6xl mb-3">Finger Print</div>
              <p className="text-2xl font-black">Pointer</p>
            </div>
          </Link>

          <Link href="/dashboard/conges" className="block group">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl hover:scale-105 transition duration-300 h-full flex flex-col justify-center">
              <div className="text-6xl mb-3">Calendar</div>
              <p className="text-2xl font-black text-white">Congés</p>
            </div>
          </Link>

          <Link href="/dashboard/salaires" className="block group">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl hover:scale-105 transition duration-300 h-full flex flex-col justify-center">
              <div className="text-6xl mb-3">Money</div>
              <p className="text-2xl font-black text-white">Paie</p>
            </div>
          </Link>

          <Link href="/dashboard/notifications" className="block group">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl hover:scale-105 transition duration-300 h-full flex flex-col justify-center">
              <div className="text-6xl mb-3">Bell</div>
              <p className="text-2xl font-black text-white">Notifs</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}