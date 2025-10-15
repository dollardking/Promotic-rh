'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar'; // On créera ce composant
import { useAuth } from '../../lib/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user || user.role !== 'employe') {
    redirect('/login'); // Redirige si pas employé
  }

  return (
    <div className="flex min-h-screen bg-sky-100"> {/* Fond bleu ciel */}
      <Sidebar logout={logout} user={user} />
      <main className="flex-1 p-6 ml-64"> {/* Contenu principal décalé pour sidebar */}
        {children}
      </main>
    </div>
  );
}