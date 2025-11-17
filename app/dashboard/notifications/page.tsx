// app/dashboard/notifications/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  message: string;
  dateCreation: string;
  lu: boolean;
  lien?: string | null;
}

export default function NotificationsPage() {
  const { token, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loading || !token) return;

      try {
        const response = await fetch('/api/notifications', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications || []);
        } else {
          setMessage('Erreur lors de la récupération des notifications.');
        }
      } catch (error) {
        setMessage('Erreur de connexion.');
        console.error(error);
      }
    };

    fetchNotifications();
  }, [token, loading]);

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-800">Mes Notifications</h1>

        {message && (
          <div className="p-4 rounded-lg text-center font-medium text-red-700 bg-red-100 border border-red-300">
            {message}
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-black">Liste des notifications</h2>

          <ul className="space-y-3">
            {notifications.length === 0 ? (
              <li className="text-center text-gray-500 py-8">Aucune notification pour le moment.</li>
            ) : (
              notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`p-4 rounded-lg border ${
                    notif.lu ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-300'
                  } flex justify-between items-center`}
                >
                  <div>
                    <p className="text-black font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.dateCreation).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  {/* "Voir détail" UNIQUEMENT SI lien EXISTE */}
                  {notif.lien ? (
                    <Link
                      href={notif.lien}
                      className="text-blue-600 font-medium hover:underline text-sm"
                    >
                      Voir détail
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}