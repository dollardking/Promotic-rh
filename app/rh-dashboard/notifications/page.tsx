'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Définition des interfaces
interface Notification {
  id: number;
  utilisateurId: number;
  message: string;
  lu: boolean;
  dateCreation: Date;
  lien: string | null;
}

export default function NotificationsPage() {
  const { token, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    // Extraire l'ID de la demande à partir du message (exemple : parsing simple)
    const match = notification.message.match(/de (\d+)/);
    const congeId = match ? parseInt(match[1]) : null;
    if (congeId) {
      router.push(`/rh-dashboard/conges?id=${congeId}`);
    } else {
      router.push('/rh-dashboard/conges'); // Redirection par défaut si ID non trouvé
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        const notificationsResponse = await fetch('/api/notifications', {
          headers: { 'authorization': `Bearer ${token}` },
        });
        const notificationsData = await notificationsResponse.json();
        if (notificationsResponse.ok) {
          setNotifications(notificationsData.notifications as Notification[]);
        } else {
          throw new Error('Échec de la récupération des notifications');
        }
      } catch (error) {
        setMessage(`Erreur : ${(error as Error).message}`);
      }
    };
    fetchData();
  }, [token, loading]);

  useEffect(() => {
    document.querySelector('.notification-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Gestion des notifications</h1>
        {message && (
          <div className="notification-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des notifications</h2>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-2 bg-gray-100 rounded text-black">
                <span
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer', color: 'blue' }}
                >
                  {notification.message} - Créée le: {notification.dateCreation.toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'GMT',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}