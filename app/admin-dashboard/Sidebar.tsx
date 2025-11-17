// app/admin-dashboard/Sidebar.tsx
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

  const links = [
    { href: '/admin-dashboard', label: 'Tableau de bord', icon: '🏠' },
    { href: '/admin-dashboard/users', label: 'Gestion des rôles', icon: '👥' },
    { href: '/admin-dashboard/departements', label: 'Départements', icon: '🏢' },
    { href: '/admin-dashboard/rapports', label: 'Rapports', icon: '📂' },
    { href: '/admin-dashboard/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/admin-dashboard/parametres', label: 'Paramètres', icon: '⚙️' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoutClick = () => setIsModalOpen(true);
  const confirmLogout = () => { logout(); setIsModalOpen(false); };
  const cancelLogout = () => setIsModalOpen(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white p-4 flex flex-col shadow-2xl overflow-y-auto">
      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <h2 className="text-2xl font-bold mb-8 text-center animate-pulse">Promotic_RH</h2>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === link.href
                ? 'bg-white text-purple-700 shadow-md'
                : 'hover:bg-purple-800 hover:translate-x-1'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* USER INFO + LOGOUT */}
      <div className="border-t border-purple-600 pt-4 mt-4 px-2">
        <div className="text-center mb-3">
          <p className="font-semibold text-sm truncate">
            {user?.prenom || user?.email}
          </p>
          <p className="text-yellow-300 text-xs font-bold">ADMINISTRATEUR</p>
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={cancelLogout}
        shouldCloseOnOverlayClick={true}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Confirmation</h2>
        <p className="text-gray-700 text-center mb-8">
          Voulez-vous vraiment vous déconnecter ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={cancelLogout}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={confirmLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
      </Modal>
    </aside>
  );
}