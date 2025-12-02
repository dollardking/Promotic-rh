// app/admin-dashboard/page.tsx
'use client';
import { useAuth } from '../../lib/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUtilisateurs: number;
  totalRh: number;
  totalEmployes: number;
  rapportsRecus: number;
}

export default function AdminDashboardPage() {
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token || loading) return;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Erreur stats stats admin');
      }
    };
    fetchStats();
  }, [token, loading]);

  if (loading || !user || !stats) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-yellow-500 text-5xl font-bold animate-pulse">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <>
      {/* FOND 100% NOIR ABSOLU + SOLEIL SCINTILLANT */}
      <div className="fixed inset-0 bg-black overflow-hidden -z-10">
        {/* Soleil doré qui clignote en haut à gauche */}
        <div className="absolute top-8 left-8 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 left-16 w-56 h-56 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
        <div className="absolute top-28 left-28 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl animate-pulse" />

        {/* Quelques rayons subtils */}
        <div className="absolute top-20 left-44 w-1 h-64 bg-yellow-400/10 rotate-12 animate-pulse" />
        <div className="absolute top-20 left-20 w-1 h-64 bg-yellow-400/10 -rotate-12 animate-pulse delay-300" />
      </div>

      <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto text-white">
        {/* BIENVENUE */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 drop-shadow-2xl">
            Bienvenue, {user.prenom || 'Admin'} {user.nom || ''}
          </h1>
          <p className="text-2xl text-yellow-300 mt-4 font-semibold">Administrateur Suprême</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition">
            <p className="text-5xl mb-3">Utilisateurs</p>
            <p className="text-5xl font-bold text-yellow-400">{stats.totalUtilisateurs}</p>
            <p className="text-gray-400 mt-2">inscrits</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition">
            <p className="text-5xl mb-3">RH</p>
            <p className="text-5xl font-bold text-purple-400">{stats.totalRh}</p>
            <p className="text-gray-400 mt-2">actifs</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition">
            <p className="text-5xl mb-3">Employés</p>
            <p className="text-5xl font-bold text-green-400">{stats.totalEmployes}</p>
            <p className="text-gray-400 mt-2">présents</p>
          </div>
        </div>

        {/* RACCOURCIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { href: '/admin-dashboard/users', icon: 'Utilisateurs', label: 'Gérer les rôles', color: 'from-red-700 to-pink-800' },
            { href: '/admin-dashboard/departements', icon: 'Départements', label: 'Départements', color: 'from-purple-700 to-indigo-800' },
            { href: '/admin-dashboard/rapports', icon: 'Rapports', label: 'Rapports RH', color: 'from-blue-700 to-cyan-800' },
            { href: '/admin-dashboard/parametres', icon: 'Paramètres', label: 'Mon compte', color: 'from-amber-600 to-yellow-700' },
            { href: '/admin-dashboard/sauvegarde', icon: 'Sauvegarde', label: 'Base de données', color: 'from-green-700 to-emerald-800' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`bg-gradient-to-br ${item.color} p-8 rounded-2xl shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-2 transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl mb-3">{item.icon}</p>
                    <h3 className="text-xl font-bold text-white">{item.label}</h3>
                  </div>
                  <span className="text-4xl opacity-60">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-20 text-gray-600 text-sm">
          PROMOTIC TOGO © 2025 • TOUT EST SOUS CONTRÔLE
        </div>
      </div>
    </>
  );
}