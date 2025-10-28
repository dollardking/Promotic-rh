// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DecodedToken } from '../lib/useAuth';
import Modal from 'react-modal';
import { useState } from 'react';

interface SidebarProps {
  logout: () => void;
  user: DecodedToken | null;
  role: 'employe' | 'rh';
}

export default function Sidebar({ logout, user, role }: SidebarProps) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const basePath = role === 'rh' ? '/rh-dashboard' : '/dashboard';

  const links = role === 'rh'
    ? [
        { href: `${basePath}`, label: 'Tableau de bord RH', icon: 'Home' },
        { href: `${basePath}/employes`, label: 'Gestion des employés', icon: 'People' },
        { href: `${basePath}/conges`, label: 'Gestion des congés', icon: 'Calendar' },
        { href: `${basePath}/presences`, label: 'Gestion des présences', icon: 'Chart' },
        { href: `${basePath}/salaires`, label: 'Gestion des salaires', icon: 'Money' },
        { href: `${basePath}/notifications`, label: 'Notifications RH', icon: 'Bell' },
        { href: `${basePath}/parametres`, label: 'Paramètres RH', icon: 'Settings' },
      ]
    : [
        { href: `${basePath}`, label: 'Dashboard', icon: 'Home' },
        { href: `${basePath}/conges`, label: 'Congés / Permissions', icon: 'Calendar' },
        { href: `${basePath}/presences`, label: 'Présences / Absences', icon: 'Chart' },
        { href: `${basePath}/salaires`, label: 'Paie / Salaires', icon: 'Money' },
        { href: `${basePath}/notifications`, label: 'Notifications', icon: 'Bell' },
        { href: `${basePath}/parametres`, label: 'Paramètres', icon: 'Settings' },
        { href: `${basePath}/profil`, label: 'Profil', icon: 'User' },
      ];

  const handleLogoutClick = () => setIsModalOpen(true);
  const confirmLogout = () => { logout(); setIsModalOpen(false); };
  const cancelLogout = () => setIsModalOpen(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-indigo-800 text-white p-6 flex flex-col justify-between shadow-xl">
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
        <p className="text-sm mb-4">
          Connecté comme: {user?.prenom || user?.email || 'Inconnu'}
        </p>
        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Exit</span>
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
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#000',
            maxWidth: '400px',
            width: '90%',
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        }}
        contentLabel="Confirmation de déconnexion"
      >
        <h2 className="text-xl font-bold mb-4">Confirmer la déconnexion</h2>
        <p className="mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelLogout}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Annuler
          </button>
          <button
            onClick={confirmLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>
      </Modal>
    </aside>
  );
}