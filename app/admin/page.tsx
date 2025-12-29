'use client';

import React, { useState, useEffect } from 'react';
import { AdminTileGrid } from '@/components/admin/AdminTileGrid';
import { TileForm } from '@/components/admin/TileForm';
import LoginForm from '@/components/admin/LoginForm';
import ConfigForm from '@/components/admin/ConfigForm';

type TabType = 'tiles' | 'config';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tiles');
  const [tiles, setTiles] = useState<any[]>([]);
  const [editingTile, setEditingTile] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    // Check session (persisted in session storage for this demo)
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession === 'active') {
        setIsAuthenticated(true);
        loadTiles();
        loadConfig();
    }
  }, []);

  const loadTiles = () => {
    fetch('/api/tiles')
      .then(res => res.json())
      .then(setTiles)
      .catch(console.error);
  };

  const loadConfig = () => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  };

  const handleLogin = async (password: string) => {
    setLoading(true);
    setError('');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
             sessionStorage.setItem('admin_session', 'active');
             setIsAuthenticated(true);
             loadTiles();
        } else {
            setError('Mot de passe incorrect');
        }
    } catch (e) {
        setError('Erreur de connexion');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette tuile ?')) return;
    await fetch(`/api/tiles/${id}`, { method: 'DELETE' });
    loadTiles();
  };

  const handleSave = async (data: any) => {
    try {
        if (editingTile) {
            await fetch(`/api/tiles/${editingTile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch('/api/tiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        setEditingTile(null);
        setIsAdding(false);
        loadTiles();
    } catch (e) {
        console.error("Save failed", e);
        alert("Erreur lors de l'enregistrement");
    }
  };

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

  if (!isAuthenticated) {
    return (
        <LoginForm
            onLogin={handleLogin}
            loading={loading}
            error={error}
        />
    );
  }

  const tabs = [
    { id: 'tiles' as TabType, label: '🖼️ Tuiles', description: 'Gérer les tuiles visuelles' },
    { id: 'config' as TabType, label: '⚙️ Configuration', description: 'Personnalisation globale' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
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

        {/* Tabs Navigation */}
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

        {/* Tab Content */}
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

        {/* Modal/Overlay for Form */}
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
