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
    if (!lien) return;

    // PROTECTION ABSOLUE contre notFound()
    const validLinks = [
      '/rh-dashboard/presences',
      '/rh-dashboard/conges',
      '/rh-dashboard/salaires',
    ];

    if (validLinks.includes(lien)) {
      router.push(lien);
    } else {
      console.warn('Lien invalide bloqué :', lien);
      // Optionnel : tu peux rediriger vers la page principale
      // router.push('/rh-dashboard');
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
              <li className="text-center text-gray-500 py-8 text-xl">
                Aucune notification
              </li>
            ) : (
              notifications.map(notif => (
                <li
                  key={notif.id}
                  className={`p-6 rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                    notif.lu ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-300'
                  }`}
                  onClick={() => handleClick(notif.lien)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-black">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.dateCreation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {notif.lien && (
                      <span className="ml-4 text-blue-600 font-bold text-sm whitespace-nowrap">
                        Voir →
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}