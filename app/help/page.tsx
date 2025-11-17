// app/help/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { MessageCircle, Mail, Phone, HelpCircle, BookOpen, Video } from 'lucide-react';

export default function Help() {
  return (
    <>
      <Navbar />

      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/rh-background.mp4" type="video/mp4" />
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-16 tracking-tight">
            Besoin d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">aide ?</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Guide</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition mt-4">
                Voir le guide
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition">
              <Video className="w-16 h-16 text-pink-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Vidéos</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition mt-4">
                Voir les vidéos
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition">
              <HelpCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">FAQ</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition mt-4">
                Consulter
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8">Contactez-nous</h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <a href="mailto:emmastareme130504@gmail.com" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 px-8 py-6 rounded-2xl border border-white/30 transition">
                <Mail className="w-10 h-10 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-bold">Email</p>
                  <p className="text-white/70">emmastareme130504@gmail.com</p>
                </div>
              </a>
              <a href="https://wa.me/22890123456" className="flex items-center gap-4 bg-green-500/20 hover:bg-green-500/30 px-8 py-6 rounded-2xl border border-green-400/50 transition">
                <MessageCircle className="w-10 h-10 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-bold">WhatsApp</p>
                  <p className="text-white/70">+228 97 77 34 30</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}