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

  const links = [
    { href: '/rh-dashboard', label: 'Tableau de bord', icon: '🏠' },
    { href: '/rh-dashboard/departements', label: 'Départment/Rap', icon: '🏢' },
    { href: '/rh-dashboard/conges', label: 'G.Congés', icon: '📅' },
    { href: '/rh-dashboard/presences', label: 'G.Présences', icon: '📊' },
    { href: '/rh-dashboard/salaires', label: 'G.Salaires', icon: '💰' },
    { href: '/rh-dashboard/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/rh-dashboard/parametres', label: 'Paramètres', icon: '⚙️' },
  ];



  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleLogoutClick = () => setIsModalOpen(true);
  const confirmLogout = () => { logout(); setIsModalOpen(false); };
  const cancelLogout = () => setIsModalOpen(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-indigo-800 text-white p-6 flex flex-col shadow-2xl overflow-y-auto">
      {/* LOGO IDENTIQUE À L'ADMIN – RIEN TOUCHÉ, JUSTE AJOUTÉ */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition mb-12">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
          RH
        </div>
        <span className="text-white text-2xl font-bold tracking-wider">promotic_RH</span>
      </Link>

      {/* NAVIGATION – ESPACE AU-DESSUS, LIENS SERRÉS */}
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === link.href
                ? 'bg-white text-blue-700 shadow-md'
                : 'hover:bg-blue-700/70 hover:translate-x-1'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* USER INFO + LOGOUT */}
      <div className="border-t border-blue-700 pt-4 mt-4 px-2">
        <div className="text-center mb-3">
          <p className="font-semibold text-sm truncate">
            {user?.prenom || user?.email || 'Inconnu'}
          </p>
          <p className="text-yellow-300 text-xs font-bold">RH</p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>

      {/* MODAL CONFIRMATION */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={cancelLogout}
        shouldCloseOnOverlayClick={true}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Confirmer la déconnexion</h2>
        <p className="text-gray-700 text-center mb-8">
          Êtes-vous sûr de vouloir vous déconnecter ?
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