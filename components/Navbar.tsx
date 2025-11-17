// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { User, LogIn, UserPlus, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = false; // À connecter plus tard

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Liens à gauche */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
              RH
            </div>
            <span className="text-white text-2xl font-bold tracking-wider">promotic_RH</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-white/80 hover:text-white font-medium transition relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all group-hover:w-full" />
            </Link>
            <Link href="/help" className="text-white/80 hover:text-white font-medium transition relative group">
              Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all group-hover:w-full" />
            </Link>
          </div>
        </div>

        {/* Dropdown Compte */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 text-white hover:bg-white/10 px-5 py-3 rounded-full transition backdrop-blur-md border border-white/20"
          >
            <User className="w-6 h-6" />
            <span className="hidden sm:block font-medium">Compte</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <div className="py-3">
                {!isLoggedIn ? (
                  <>
                    <Link href="/inscription" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition" onClick={() => setDropdownOpen(false)}>
                      <UserPlus className="w-5 h-5" /> S'inscrire
                    </Link>
                    <Link href="/connexion" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition border-t border-white/10" onClick={() => setDropdownOpen(false)}>
                      <LogIn className="w-5 h-5" /> Se connecter
                    </Link>
                  </>
                ) : (
                  <button className="flex items-center gap-3 px-6 py-4 text-white hover:bg-red-500/20 transition w-full text-left border-t border-white/10">
                    <LogOut className="w-5 h-5" /> Déconnexion
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Mobile */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
          <Menu className="w-8 h-8" />
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/70 backdrop-blur-lg border-t border-white/10">
          <Link href="/about" className="block px-8 py-4 text-white hover:bg-white/10 transition" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/help" className="block px-8 py-4 text-white hover:bg-white/10 transition" onClick={() => setMobileMenuOpen(false)}>Help</Link>
        </div>
      )}
    </nav>
  );
}