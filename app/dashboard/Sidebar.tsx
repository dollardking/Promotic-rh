'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DecodedToken, useAuth } from '../../lib/useAuth';
import Modal from 'react-modal';
import { useState } from 'react';

interface SidebarProps {
  logout: () => void;
  user: DecodedToken | null;
}

export default function Sidebar({ logout, user }: SidebarProps) {
  const pathname = usePathname();
  const { token, loading } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/conges', label: 'Congés / Permissions', icon: '📅' },
    { href: '/dashboard/presences', label: 'Présences / Absences', icon: '📊' },
    { href: '/dashboard/salaires', label: 'Paie / Salaires', icon: '💰' },
    { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/dashboard/profil', label: 'Profil', icon: '👤' },
    { href: '/dashboard/parametres', label: 'Paramètres', icon: '⚙️' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsModalOpen(false);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-indigo-800 text-white p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center animate-pulse">promotic_RH</h2>
        <nav className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                pathname === link.href ? 'bg-white text-blue-600 shadow-md' : 'hover:bg-blue-700'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-blue-700 pt-4">
        <p className="text-sm mb-4">Connecté comme: {user?.prenom || user?.email || 'Inconnu'}</p>
        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>

        <Modal
    isOpen={isModalOpen}
    onRequestClose={cancelLogout}
    style={{
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '30px',
        borderRadius: '16px',
        backgroundColor: '#1e1b4b',
        color: '#fff',
        border: '2px solid #a78bfa',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        zIndex: 9999, // LE PLUS IMPORTANT
      },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9998, // Encore plus haut que tout
      },
    }}
    contentLabel="Confirmation de déconnexion"
  >
    <h2 className="text-2xl font-black mb-6 text-purple-400 text-center">
      Confirmer la déconnexion ?
    </h2>
    <p className="mb-8 text-white/90 text-center">
      Êtes-vous sûr de vouloir quitter Promotic RH ?
    </p>
    <div className="flex justify-center space-x-6">
      <button
        onClick={cancelLogout}
        className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-bold"
      >
        Annuler
      </button>
      <button
        onClick={confirmLogout}
        className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-red-500/50 transition font-black transform hover:scale-105"
      >
        Oui, déconnexion
      </button>
    </div>
  </Modal>
    </aside>
  );
}