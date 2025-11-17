// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogIn, UserPlus, LogOut, Menu } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loop, setLoop] = useState(0);

  const phrases = ['Bienvenue', 'Welcome', 'Woezon'];
  
  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = phrases[loop % phrases.length];
      
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text === currentPhrase) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setLoop(loop + 1);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 80 : 150);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loop]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = false;

  return (
    <>
      {/* Vidéo en fond */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/rh-background.mp4" type="video/mp4" />
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Liens à gauche */}
          <div className="flex items-center gap-12">
            {/* Logo promotic_RH */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
                RH
              </div>
              <span className="text-white text-2xl font-bold tracking-wider">promotic_RH</span>
            </Link>

            {/* Liens About & Help juste à côté */}
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

          {/* Dropdown Compte à droite */}
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
                      <Link href="/register" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition" onClick={() => setDropdownOpen(false)}>
                        <UserPlus className="w-5 h-5" /> S'inscrire
                      </Link>
                      <Link href="/login" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition border-t border-white/10" onClick={() => setDropdownOpen(false)}>
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

      {/* Contenu principal */}
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
            {text}<span className="animate-pulse">|</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Gérez vos ressources humaines avec intelligence, simplicité et élégance.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              href="/register"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl px-12 py-6 rounded-2xl shadow-2xl transform transition hover:scale-110 hover:shadow-purple-500/50"
            >
              <span className="relative z-10">S'inscrire</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            <Link
              href="/login"
              className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-2xl px-12 py-6 rounded-2xl shadow-2xl transform transition hover:scale-110 hover:bg-white/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                <LogIn className="w-8 h-8" />
                Se connecter
              </span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}