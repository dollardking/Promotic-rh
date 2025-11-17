// app/about/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { CheckCircle, Users, Shield, Zap, Heart, Globe } from 'lucide-react';

export default function About() {
  return (
    <>
      <Navbar />

      {/* Vidéo en fond */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/rh-background.mp4" type="video/mp4" />
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">promotic_RH</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-20">
            La solution togolaise moderne pour gérer vos ressources humaines avec élégance et efficacité.
          </p>

          <div className="grid md:grid-cols-3 gap-10 mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Humanité</h3>
              <p className="text-white/70">Chaque employé est au cœur de notre système.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Rapidité</h3>
              <p className="text-white/70">Des outils intuitifs pour gagner du temps.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sécurité</h3>
              <p className="text-white/70">Vos données sont protégées avec les meilleurs standards.</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Made in Togo avec passion</h2>
            <p className="text-xl text-white/80 max-w-4xl mx-auto">
              promotic_RH est né pour simplifier la gestion RH des entreprises togolaises. 
              Un outil simple, puissant et 100% adapté à vos besoins locaux.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}