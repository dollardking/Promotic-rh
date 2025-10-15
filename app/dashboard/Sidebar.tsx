'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DecodedToken } from '../../lib/useAuth'; // Import du type

interface SidebarProps {
  logout: () => void;
  user: DecodedToken;
}

export default function Sidebar({ logout, user }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashbaord', icon: '🏠' },
    { href: '/dashboard/profil', label: 'Mon Profil', icon: '👤' },
    { href: '/dashboard/demandes', label: 'Mes Demandes', icon: '📄' },
    { href: '/dashboard/horaires', label: 'Horaires', icon: '🕒' },
    { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-indigo-800 text-white p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center animate-pulse">Promotic_RH</h2>
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
        <p className="text-sm mb-4">Connecté comme: {user.prenom || user.email}</p>
        <button
          onClick={logout}
          className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}