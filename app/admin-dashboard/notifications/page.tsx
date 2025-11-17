// app/admin-dashboard/notifications/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Notif {
  id: number;
  message: string;
  lu: boolean;
  dateCreation: string;
  lien: string | null;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!token) return;
    const res = await fetch('/api/notify', {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifs(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 8000); // toutes les 8s
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) return <p className="text-center mt-20 text-2xl">Chargement des notifications...</p>;

  return (
    <div className="p-8 min-h-screen bg-purple-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-bold text-purple-700 mb-12 text-center animate-pulse">
          Notifications
        </h1>

        {notifs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-400 font-bold">Aucune notification</p>
            <p className="text-gray-600 mt-4">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
                  notif.lu ? 'bg-gray-100 border-2 border-gray-300' : 'bg-yellow-100 border-4 border-yellow-500 scale-105'
                }`}
              >
                <p className="text-xl font-bold text-black">
                  {notif.lien ? (
                    <Link href={notif.lien} className="text-purple-700 underline hover:text-purple-900">
                      {notif.message}
                    </Link>
                  ) : (
                    notif.message
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  {new Date(notif.dateCreation).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {!notif.lu && (
                  <div className="mt-4 inline-block">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      NOUVEAU
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}