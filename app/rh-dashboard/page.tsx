// app/rh-dashboard/page.tsx
'use client';

import { useAuth } from '../../lib/useAuth';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
  totalEmployes: number;
  totalDepartements: number;
  congesEnAttente: number;
  congesApprouves: number;
  congesRejetes: number;
  presentsAujourdHui: number;
  absentsAujourdHui: number;
  rapportsGeneres: number;
  salairesParMois: { mois: string; total: number }[];
}

interface ApiResponse {
  user: { prenom: string; nom: string; role: string };
  stats: Stats;
}

export default function RhDashboardPage() {
  const { token, loading } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    if (!token || loading) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/rh-dashboard', {
          headers: { authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token, loading]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-6xl font-black animate-pulse">Chargement du tableau de bord...</div>
      </div>
    );
  }

  const chartData = data.stats.salairesParMois.length > 0 
    ? data.stats.salairesParMois 
    : [{ mois: 'Aucun paiement', total: 0 }];

  const colors = ['#a855f7', '#ec4899', '#8b5cf6', '#d946ef', '#c084fc', '#e879f9'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* BIENVENUE PARFAIT */}
        <div className="text-center mb-16 mt-10">
          <h1 className="text-8xl font-black text-white drop-shadow-2xl">
            Bienvenue, {data.user.prenom} {data.user.nom}
          </h1>
          <p className="text-5xl text-purple-300 mt-6 font-black tracking-wider">
            {data.user.role}
          </p>
          <p className="text-3xl text-white/80 mt-4">Tableau de bord RH • PROMOTIC TOGO</p>
        </div>

        {/* CARTES STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
          {[
            { label: "Employés", value: data.stats.totalEmployes, color: "text-cyan-400" },
            { label: "Départements", value: data.stats.totalDepartements, color: "text-purple-400" },
            { label: "Congés en attente", value: data.stats.congesEnAttente, color: "text-yellow-400" },
            { label: "Présents aujourd'hui", value: data.stats.presentsAujourdHui, color: "text-green-400" },
            { label: "Absents / Congés", value: data.stats.absentsAujourdHui, color: "text-red-400" },
            { label: "Rapports générés", value: data.stats.rapportsGeneres, color: "text-pink-400" },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:scale-105 transition shadow-2xl">
              <p className="text-xl text-white/80 font-medium">{item.label}</p>
              <p className={`text-5xl font-black ${item.color} mt-4`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* DIAGRAMME SALAIRES – MAINTENANT MAGNIFIQUE */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
          <h2 className="text-5xl font-black text-white text-center mb-10">
            Salaires nets payés par mois
          </h2>
          
          {chartData[0]?.total === 0 && chartData.length === 1 ? (
            <div className="text-center py-20">
              <p className="text-4xl text-white/60">Aucun salaire payé ce mois-ci</p>
              <p className="text-2xl text-white/50 mt-4">Les paiements apparaîtront ici dès qu'ils seront validés</p>
            </div>
          ) : (
            <>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#ffffff15" />
                    <XAxis 
                      dataKey="mois" 
                      stroke="#fff" 
                      fontSize={16}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#fff" 
                      fontSize={14}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e1b4b', border: '2px solid #a855f7', borderRadius: '16px' }}
                      labelStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                      formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                    />
                    <Bar dataKey="total" radius={[20, 20, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center mt-10">
                <p className="text-2xl text-white/80">
                  Total payé sur 12 mois : {' '}
                  <span className="text-4xl font-black text-yellow-400">
                    {data.stats.salairesParMois.reduce((a, b) => a + b.total, 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}