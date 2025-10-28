// app/rh-dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DecodedToken } from '../../lib/useAuth';
import Modal from 'react-modal';
import { useState } from 'react';

interface SidebarProps {
  logout: () => void;
  user: DecodedToken | null;
}

export default function Sidebar({ logout, user }: SidebarProps) {
  const pathname = usePathname();

  // ICÔNES EMOJI COMME DEMANDÉ
  const links = [
    { href: '/rh-dashboard', label: 'Tableau de bord RH', icon: '🏠' },
    { href: '/rh-dashboard/employes', label: 'Gestion des employés', icon: '👥' },
    { href: '/rh-dashboard/conges', label: 'Gestion des congés', icon: '📅' },
    { href: '/rh-dashboard/presences', label: 'Gestion des présences', icon: '📊' },
    { href: '/rh-dashboard/salaires', label: 'Gestion des salaires', icon: '💰' },
    { href: '/rh-dashboard/notifications', label: 'Notifications RH', icon: '🔔' },
    { href: '/rh-dashboard/parametres', label: 'Paramètres RH', icon: '⚙️' },
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
        <h2 className="text-2xl font-bold mb-8 text-center animate-pulse">Promotic RH</h2>
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

      {/* MODAL DE DÉCONNEXION */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={cancelLogout}
        shouldCloseOnOverlayClick={true}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '24px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            color: '#000',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
          },
        }}
        contentLabel="Confirmation de déconnexion"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Confirmer la déconnexion</h2>
        <p className="mb-6 text-center text-gray-700">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={cancelLogout}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Annuler
          </button>
          <button
            onClick={confirmLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Déconnexion
          </button>
        </div>
      </Modal>
    </aside>
  );
}