// app/rh-dashboard/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../lib/useAuth';
import { redirect } from 'next/navigation';

// SUPPRIME CETTE LIGNE : import Modal from 'react-modal';

export default function RhDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'rh')) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user || user.role !== 'rh') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-sky-100">
      <Sidebar logout={logout} user={user} />
      <main className="flex-1 p-6 ml-64">
        {children}
      </main>
    </div>
  );
}