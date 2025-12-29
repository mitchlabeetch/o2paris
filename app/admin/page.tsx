'use client';

import React, { useState, useEffect } from 'react';
import { AdminTileGrid } from '@/components/admin/AdminTileGrid';
import { TileForm } from '@/components/admin/TileForm';
import LoginForm from '@/components/admin/LoginForm';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tiles, setTiles] = useState<any[]>([]);
  const [editingTile, setEditingTile] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check session (persisted in session storage for this demo)
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession === 'active') {
        setIsAuthenticated(true);
        loadTiles();
    }
  }, []);

  const loadTiles = () => {
    fetch('/api/tiles')
      .then(res => res.json())
      .then(setTiles)
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

  if (!isAuthenticated) {
    return (
        <LoginForm
            onLogin={handleLogin}
            loading={loading}
            error={error}
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif">Administration Eau de Paris</h1>
            <button onClick={() => { sessionStorage.removeItem('admin_session'); setIsAuthenticated(false); }} className="text-red-500">
                Déconnexion
            </button>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Grille des Tuiles</h2>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  + Ajouter une tuile
                </button>
            </div>

            <AdminTileGrid
                tiles={tiles}
                setTiles={setTiles}
                onEdit={setEditingTile}
                onDelete={handleDelete}
            />
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
