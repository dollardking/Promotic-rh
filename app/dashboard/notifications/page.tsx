'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { token, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent:', { loading, token });
        return;
      }
      try {
        const response = await fetch('/api/notifications', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications || []);
        } else {
          setMessage('Erreur lors de la récupération des notifications.');
          console.error('Erreur API:', data.error);
        }
      } catch (error) {
        setMessage('Erreur lors de la récupération des notifications.');
        console.error('Erreur fetch:', error);
      }
    };

    fetchNotifications();
  }, [token, loading]);

  useEffect(() => {
    document.querySelector('.notification-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Notifications</h1>
        {message && (
          <div className="notification-message text-red-600 text-center p-2 bg-red-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Liste des Notifications</h2>
          <ul className="space-y-2">
            {notifications.length === 0 ? (
              <li className="p-2 text-center text-gray-500">Aucune notification pour le moment.</li>
            ) : (
              notifications.map((notification: any) => (
                <li key={notification.id} className="p-2 bg-gray-100 rounded text-black flex justify-between items-center">
                  <span>{notification.message} - {new Date(notification.dateCreation).toLocaleString()}</span>
                  <Link href="/dashboard/mes-demandes" className="text-blue-600 hover:underline ml-4">
                    Voir détails
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}