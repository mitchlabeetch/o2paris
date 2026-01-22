/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/admin/page.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le tableau de bord d'administration ("Les Coulisses").
 * Il permet d'ajouter/modifier/supprimer des tuiles et de changer la configuration
 * globale du site (couleurs, titres).
 *
 * FONCTIONNEMENT :
 * 1. Vérifie si l'utilisateur est connecté (variable d'état 'isAuthenticated').
 * 2. Si NON : Affiche le formulaire de connexion (LoginForm).
 * 3. Si OUI : Affiche l'interface de gestion avec deux onglets (Tuiles / Config).
 *
 * REPÈRES :
 * - Lignes 37-47 : Gestion des états (State) pour l'interface.
 * - Lignes 49-57 : Vérification de la session au démarrage.
 * - Lignes 72-95 : Gestion de la connexion (Login).
 * - Lignes 146+  : Rendu conditionnel (Login OU Dashboard).
 * -----------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AdminTileGrid } from '@/components/admin/AdminTileGrid';
import { TileForm } from '@/components/admin/TileForm';
import LoginForm from '@/components/admin/LoginForm';
import ConfigForm from '@/components/admin/ConfigForm';

type TabType = 'tiles' | 'config';

export default function AdminPage() {
  // ---------------------------------------------------------------------------
  // ÉTATS (STATE)
  // ---------------------------------------------------------------------------
  // Est-ce que l'utilisateur a rentré le bon mot de passe ?
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Quel onglet est actif ? ('tiles' ou 'config')
  const [activeTab, setActiveTab] = useState<TabType>('tiles');
  
  // Données
  const [tiles, setTiles] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  
  // États pour le formulaire d'édition (Modal)
  const [editingTile, setEditingTile] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // États pour le formulaire de connexion
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // EFFET : VÉRIFICATION DE SESSION
  // ---------------------------------------------------------------------------
  // Au chargement de la page, on regarde si une session est déjà ouverte
  // dans le navigateur (sessionStorage) pour ne pas redemander le mot de passe.
  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession === 'active') {
        setIsAuthenticated(true);
        loadTiles();
        loadConfig();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // CHARGEMENT DES DONNÉES
  // ---------------------------------------------------------------------------
  const loadTiles = () => {
    fetch('/api/tiles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTiles(data);
        } else {
          setTiles([]);
        }
      })
      .catch(console.error);
  };

  const loadConfig = () => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS (HANDLERS)
  // ---------------------------------------------------------------------------
  
  // Tentative de connexion
  const handleLogin = async (password: string) => {
    setLoading(true);
    setError('');

    try {
        // On envoie le mot de passe au serveur pour vérification
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
             // Si c'est bon, on sauvegarde la session et on charge les données
             sessionStorage.setItem('admin_session', 'active');
             setIsAuthenticated(true);
             loadTiles();
             loadConfig();
        } else {
            setError('Mot de passe incorrect');
        }
    } catch (e) {
        setError('Erreur de connexion');
    } finally {
        setLoading(false);
    }
  };

  // Suppression d'une tuile
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette tuile ?')) return;
    await fetch(`/api/tiles/${id}`, { method: 'DELETE' });
    loadTiles(); // On recharge la liste pour voir la suppression
  };

  // Sauvegarde (Création ou Modification) d'une tuile
  const handleSave = async (data: any) => {
    try {
        if (editingTile) {
            // Modification (PUT)
            await fetch(`/api/tiles/${editingTile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Création (POST)
            await fetch('/api/tiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        // Fermeture du formulaire et rechargement
        setEditingTile(null);
        setIsAdding(false);
        loadTiles();
    } catch (e) {
        console.error("Save failed", e);
        alert("Erreur lors de l'enregistrement");
    }
  };

  // Sauvegarde de la configuration globale
  const handleSaveConfig = async (newConfig: any) => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      setConfig(newConfig);
      alert('Configuration sauvegardée avec succès !');
      loadConfig();
    } catch (e) {
      console.error('Config save failed', e);
      alert('Erreur lors de la sauvegarde de la configuration');
    }
  };

  // ---------------------------------------------------------------------------
  // RENDU CONDITIONNEL : LOGIN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
        <LoginForm
            onLogin={handleLogin}
            loading={loading}
            error={error}
        />
    );
  }

  // Configuration des onglets pour l'affichage
  const tabs = [
    { id: 'tiles' as TabType, label: '🖼️ Tuiles', description: 'Gérer les tuiles visuelles' },
    { id: 'config' as TabType, label: '⚙️ Configuration', description: 'Personnalisation globale' },
  ];

  // ---------------------------------------------------------------------------
  // RENDU PRINCIPAL : DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton de déconnexion */}
        <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif">Administration Eau de Paris</h1>
              <p className="text-sm text-gray-500 mt-1">Gérer tous les aspects de votre application</p>
            </div>
            <button 
              onClick={() => { 
                sessionStorage.removeItem('admin_session'); 
                setIsAuthenticated(false); 
              }} 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              🚪 Déconnexion
            </button>
        </header>

        {/* Navigation par Onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-6 py-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-water-main text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold">{tab.label}</div>
                <div className="text-xs opacity-80 mt-1">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {activeTab === 'tiles' && (
            <>
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Grille des Tuiles</h2>
                    <p className="text-sm text-gray-500 mt-1">Gérer les tuiles visuelles de la page d&apos;accueil</p>
                  </div>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    ➕ Ajouter une tuile
                  </button>
              </div>

              <AdminTileGrid
                  tiles={tiles}
                  setTiles={setTiles}
                  onEdit={setEditingTile}
                  onDelete={handleDelete}
              />
            </>
          )}

          {activeTab === 'config' && (
            <ConfigForm config={config} onSave={handleSaveConfig} />
          )}
        </div>

        {/* Modale d'édition (Superposée par dessus tout) */}
        {(isAdding || editingTile) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-2xl">
                    <TileForm
                        initialData={editingTile}
                        onSubmit={handleSave}
                        onCancel={() => { setIsAdding(false); setEditingTile(null); }}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}