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
    { href: '/dashboard/conges', label: 'Congés & Permi', icon: '📅' },
    { href: '/dashboard/presences', label: 'Pres & Abs', icon: '📊' },
    { href: '/dashboard/salaires', label: 'Paie & Salaires', icon: '💰' },
    { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/dashboard/profil', label: 'Profil', icon: '👤' },
    { href: '/dashboard/parametres', label: 'Paramètres', icon: '⚙️' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoutClick = () => setIsModalOpen(true);
  const confirmLogout = () => { logout(); setIsModalOpen(false); };
  const cancelLogout = () => setIsModalOpen(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-700 to-purple-900 text-white p-6 flex flex-col shadow-2xl overflow-y-auto">
      
      {/* MÊME LOGO QUE ADMIN & RH – IDENTIQUE À 100% */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition mb-12">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
          RH
        </div>
        <span className="text-white text-2xl font-bold tracking-wider">promotic_RH</span>
      </Link>

      {/* NAVIGATION – ESPACE AU-DESSUS, LIENS SERRÉS, STYLE MODERNE */}
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === link.href
                ? 'bg-white text-purple-700 shadow-md'
                : 'hover:bg-white/10 hover:translate-x-1'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* INFOS USER + DÉCONNEXION */}
      <div className="border-t border-purple-700 pt-4 mt-4 px-2">
        <div className="text-center mb-3">
          <p className="font-semibold text-sm truncate">
            {user?.prenom || user?.email || 'Inconnu'}
          </p>
          <p className="text-yellow-300 text-xs font-bold">EMPLOYÉ</p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>

      {/* MODAL DE DÉCONNEXION – STYLE LUXE PURPLE */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={cancelLogout}
        shouldCloseOnOverlayClick={true}
        className="bg-gradient-to-br from-purple-900 to-indigo-900 p-10 rounded-2xl shadow-2xl max-w-md mx-auto border-2 border-purple-500"
        overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <h2 className="text-3xl font-black mb-6 text-yellow-400 text-center drop-shadow-lg">
          Confirmer la déconnexion ?
        </h2>
        <p className="mb-10 text-white/90 text-center text-lg">
          Êtes-vous sûr de vouloir quitter Promotic RH ?
        </p>
        <div className="flex justify-center gap-6">
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