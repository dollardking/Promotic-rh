// app/help/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { MessageCircle, Mail, BookOpen, Video, HelpCircle, X, ChevronRight, Users, Calendar, Clock, DollarSign, FileText, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Help() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <Navbar />

      {/* Fond vidéo */}
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
            {/* GUIDE – OUVRE LE MODAL */}
            <button
              onClick={() => setGuideOpen(true)}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition group"
            >
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-6 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold text-white mb-4">Guide complet</h3>
              <p className="text-white/70 mb-6">Tout savoir sur l'utilisation de promotic_RH</p>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:scale-105 transition">
                Voir le guide <ChevronRight className="w-5 h-5" />
              </span>
            </button>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition">
              <Video className="w-16 h-16 text-pink-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Vidéos</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition mt-4">
                Bientôt disponible
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition">
              <HelpCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">FAQ</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition mt-4">
                Bientôt disponible
              </button>
            </div>
          </div>

          {/* Contact */}
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
              <a href="https://wa.me/22897773430" className="flex items-center gap-4 bg-green-500/20 hover:bg-green-500/30 px-8 py-6 rounded-2xl border border-green-400/50 transition">
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

      {/* MODAL GUIDE – ANIMÉ */}
      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setGuideOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex justify-between items-center">
                <h2 className="text-4xl font-black text-white">Guide d'utilisation promotic_RH</h2>
                <button onClick={() => setGuideOpen(false)} className="text-white/70 hover:text-white transition">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="p-10 space-y-12">
                {/* SECTION RH */}
                <div>
                  <h3 className="text-3xl font-bold text-purple-400 mb-6 flex items-center gap-4">
                    <Users className="w-10 h-10" /> Responsable RH
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <Calendar className="w-10 h-10 text-purple-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Gestion des présences</h4>
                      <p className="text-white/70">Pointer les arrivées/départs, voir les retards, exporter les rapports mensuels.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <Clock className="w-10 h-10 text-pink-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Congés & Absences</h4>
                      <p className="text-white/70">Valider/refuser les demandes, voir le calendrier des absences.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <DollarSign className="w-10 h-10 text-green-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Paie & Salaires</h4>
                      <p className="text-white/70">Générer les fiches de paie PDF/Excel, gérer les primes et retenues.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <FileText className="w-10 h-10 text-blue-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Rapports</h4>
                      <p className="text-white/70">Envoyer automatiquement les rapports mensuels à l’admin.</p>
                    </div>
                  </div>
                </div>

                {/* SECTION EMPLOYÉ */}
                <div>
                  <h3 className="text-3xl font-bold text-pink-400 mb-6 flex items-center gap-4">
                    <CheckSquare className="w-10 h-10" /> Employé
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <Clock className="w-10 h-10 text-green-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Pointer mon arrivée/départ</h4>
                      <p className="text-white/70">Un seul clic le matin et le soir.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <Calendar className="w-10 h-10 text-purple-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Demander un congé</h4>
                      <p className="text-white/70">Choisir les dates → soumettre → suivre le statut.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <FileText className="w-10 h-10 text-yellow-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Ma fiche de paie</h4>
                      <p className="text-white/70">Télécharger mon bulletin chaque mois.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <Users className="w-10 h-10 text-cyan-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Mon profil</h4>
                      <p className="text-white/70">Voir mes informations, solde de congés, département.</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <p className="text-white/60 text-sm">
                    Une question ? Contactez le RH ou écrivez-nous sur WhatsApp !
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}