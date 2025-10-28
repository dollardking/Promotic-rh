'use client';

import { useAuth } from '../../../lib/useAuth';
import { useState, useEffect } from 'react';

export default function ProfilPage() {
  const { user, token, loading } = useAuth();
  const [profileData, setProfileData] = useState({ prenom: '', nom: '', email: '', role: '' });
  const [summary, setSummary] = useState({ presencesCount: 0, salairesCount: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (loading || !token) {
        console.log('Chargement en cours ou token absent, attente...', { loading, token });
        return;
      }
      try {
        // Récupérer les informations de l'utilisateur
        const userResponse = await fetch(`/api/users/${user?.id}`, {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setProfileData({
            prenom: userData.user.prenom || '',
            nom: userData.user.nom || '',
            email: userData.user.email || '',
            role: userData.user.role || '',
          });
        } else {
          console.error('Erreur API utilisateur:', userData.error);
        }

        // Récupérer le nombre de présences
        const presencesResponse = await fetch('/api/presences', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const presencesData = await presencesResponse.json();
        if (presencesResponse.ok) {
          setSummary((prev) => ({ ...prev, presencesCount: presencesData.presences.length }));
        } else {
          console.error('Erreur API présences:', presencesData.error);
        }

        // Récupérer le nombre de salaires
        const salairesResponse = await fetch('/api/salaires', {
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
        const salairesData = await salairesResponse.json();
        if (salairesResponse.ok) {
          setSummary((prev) => ({ ...prev, salairesCount: salairesData.salaires.length }));
        } else {
          console.error('Erreur API salaires:', salairesData.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };
    fetchProfileData();
  }, [token, loading, user?.id]);

  useEffect(() => {
    document.querySelector('.profil-message')?.classList.add('animate-fadeIn');
  }, [message]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Profil</h1>
        {message && (
          <div className="profil-message text-green-600 text-center p-2 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Informations Personnelles</h2>
          <div className="space-y-2">
            <p><strong>Prénom :</strong> {profileData.prenom}</p>
            <p><strong>Nom :</strong> {profileData.nom}</p>
            <p><strong>Email :</strong> {profileData.email}</p>
            <p><strong>Rôle :</strong> {profileData.role}</p>
          </div>
        </section>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Résumé des Activités</h2>
          <div className="space-y-2">
            <p><strong>Nombre de présences enregistrées :</strong> {summary.presencesCount}</p>
            <p><strong>Nombre de salaires enregistrés :</strong> {summary.salairesCount}</p>
            {/* Ajouter nombre de congés si API disponible */}
            {/* <p><strong>Nombre de congés pris :</strong> {summary.congesCount}</p> */}
          </div>
        </section>
      </div>
    </div>
  );
}