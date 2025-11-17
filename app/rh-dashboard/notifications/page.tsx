// app/rh-dashboard/notifications/page.tsx
'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    if (loading || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [token, loading]);

  const handleClick = (lien: string | null) => {
    if (lien) {
      router.push(lien);
    }
  };

  if (loading) return <p className="text-center mt-10 text-black">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-800">Notifications RH</h1>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <ul className="space-y-3">
            {notifications.length === 0 ? (
              <li className="text-center text-gray-500 py-8">Aucune notification.</li>
            ) : (
              notifications.map(notif => (
                <li
                  key={notif.id}
                  className={`p-4 rounded-lg border ${
                    notif.lu ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <p className="text-black font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.dateCreation).toLocaleString('fr-FR')}
                  </p>

                  {notif.lien && (
                    <button
                      onClick={() => handleClick(notif.lien!)}
                      className="mt-2 text-blue-600 font-medium hover:underline text-sm"
                    >
                      Voir détail →
                    </button>
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