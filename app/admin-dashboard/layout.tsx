// app/admin-dashboard/layout.tsx
'use client';
import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../lib/useAuth';
import { redirect } from 'next/navigation';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-purple-50 overflow-x-hidden">
      <Sidebar logout={logout} user={user} />
      <main className="flex-1 ml-64 p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}