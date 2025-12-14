'use client';

import { useState, useEffect } from 'react';
import type { Pinpoint, MapConfig } from '@/lib/db';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [config, setConfig] = useState<Partial<MapConfig>>({});
  const [activeTab, setActiveTab] = useState<'pinpoints' | 'sounds' | 'config'>('pinpoints');
  
  const [editingPinpoint, setEditingPinpoint] = useState<Partial<Pinpoint> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = document.cookie.includes('admin_token');
      setIsAuthenticated(hasToken);
      
      if (hasToken) {
        loadData();
      }
    };
    
    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      const [pinpointsRes, configRes] = await Promise.all([
        fetch('/api/pinpoints'),
        fetch('/api/config'),
      ]);
      
      const pinpointsData = await pinpointsRes.json();
      const configData = await configRes.json();
      
      setPinpoints(pinpointsData);
      setConfig(configData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
        loadData();
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const handleSavePinpoint = async () => {
    if (!editingPinpoint) return;

    try {
      const method = editingPinpoint.id ? 'PUT' : 'POST';
      const response = await fetch('/api/pinpoints', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPinpoint),
      });

      if (response.ok) {
        await loadData();
        setEditingPinpoint(null);
      }
    } catch (err) {
      console.error('Error saving pinpoint:', err);
    }
  };

  const handleDeletePinpoint = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point ?')) return;

    try {
      await fetch(`/api/pinpoints?id=${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Error deleting pinpoint:', err);
    }
  };

  const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/sounds', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Fichier téléchargé ! URL: /api/sounds?id=${data.id}`);
      }
    } catch (err) {
      console.error('Error uploading sound:', err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      alert('Configuration sauvegardée !');
      await loadData();
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-water-light to-water-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-water-dark mb-6 text-center">
            Administration O2Paris
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="water-input w-full"
                placeholder="Entrez votre mot de passe"
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="water-button w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            Mot de passe par défaut: admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-water-dark">Administration O2Paris</h1>
          <div className="flex gap-4">
            <a href="/" className="text-water-dark hover:text-water-deep">
              Voir la carte
            </a>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pinpoints')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'pinpoints'
                  ? 'text-water-dark border-b-2 border-water-dark'
                  : 'text-gray-500'
              }`}
            >
              Points sur la carte
            </button>
            <button
              onClick={() => setActiveTab('sounds')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'sounds'
                  ? 'text-water-dark border-b-2 border-water-dark'
                  : 'text-gray-500'
              }`}
            >
              Sons
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'config'
                  ? 'text-water-dark border-b-2 border-water-dark'
                  : 'text-gray-500'
              }`}
            >
              Configuration
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pinpoints' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Gérer les points</h2>
                  <button
                    onClick={() => setEditingPinpoint({
                      latitude: 48.8566,
                      longitude: 2.3522,
                      title: '',
                      description: '',
                      sound_url: '',
                    })}
                    className="water-button"
                  >
                    + Nouveau point
                  </button>
                </div>

                {editingPinpoint && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-bold text-gray-800">
                      {editingPinpoint.id ? 'Modifier' : 'Nouveau'} point
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        value={editingPinpoint.latitude || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          latitude: parseFloat(e.target.value),
                        })}
                        className="water-input"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        value={editingPinpoint.longitude || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          longitude: parseFloat(e.target.value),
                        })}
                        className="water-input"
                      />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Titre"
                      value={editingPinpoint.title || ''}
                      onChange={(e) => setEditingPinpoint({
                        ...editingPinpoint,
                        title: e.target.value,
                      })}
                      className="water-input w-full"
                    />
                    
                    <textarea
                      placeholder="Description"
                      value={editingPinpoint.description || ''}
                      onChange={(e) => setEditingPinpoint({
                        ...editingPinpoint,
                        description: e.target.value,
                      })}
                      className="water-input w-full"
                      rows={3}
                    />
                    
                    <input
                      type="text"
                      placeholder="URL du son (ex: /api/sounds?id=1)"
                      value={editingPinpoint.sound_url || ''}
                      onChange={(e) => setEditingPinpoint({
                        ...editingPinpoint,
                        sound_url: e.target.value,
                      })}
                      className="water-input w-full"
                    />
                    
                    <div className="flex gap-2">
                      <button onClick={handleSavePinpoint} className="water-button">
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingPinpoint(null)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {pinpoints.map((pinpoint) => (
                    <div
                      key={pinpoint.id}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <h4 className="font-bold text-gray-800">{pinpoint.title}</h4>
                        <p className="text-sm text-gray-600">{pinpoint.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {pinpoint.latitude}, {pinpoint.longitude}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPinpoint(pinpoint)}
                          className="text-water-dark hover:text-water-deep"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeletePinpoint(pinpoint.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sounds' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Gérer les sons</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Télécharger un nouveau son
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUploadSound}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-water-main file:text-white
                      hover:file:bg-water-dark
                      cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formats acceptés: MP3, WAV, OGG, etc.
                  </p>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Téléchargez un fichier audio ci-dessus</li>
                    <li>Notez l&apos;ID retourné dans l&apos;alerte</li>
                    <li>Utilisez /api/sounds?id=ID dans le champ &quot;URL du son&quot; d&apos;un point</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Configuration de la carte</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL des tuiles de carte
                    </label>
                    <input
                      type="text"
                      value={config.tile_layer_url || ''}
                      onChange={(e) => setConfig({ ...config, tile_layer_url: e.target.value })}
                      className="water-input w-full"
                      placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude du centre
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={config.center_lat || ''}
                        onChange={(e) => setConfig({ ...config, center_lat: parseFloat(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude du centre
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={config.center_lng || ''}
                        onChange={(e) => setConfig({ ...config, center_lng: parseFloat(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoom initial
                      </label>
                      <input
                        type="number"
                        value={config.zoom_level || ''}
                        onChange={(e) => setConfig({ ...config, zoom_level: parseInt(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoom min
                      </label>
                      <input
                        type="number"
                        value={config.min_zoom || ''}
                        onChange={(e) => setConfig({ ...config, min_zoom: parseInt(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoom max
                      </label>
                      <input
                        type="number"
                        value={config.max_zoom || ''}
                        onChange={(e) => setConfig({ ...config, max_zoom: parseInt(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attribution
                    </label>
                    <input
                      type="text"
                      value={config.attribution || ''}
                      onChange={(e) => setConfig({ ...config, attribution: e.target.value })}
                      className="water-input w-full"
                    />
                  </div>

                  <button onClick={handleSaveConfig} className="water-button">
                    Sauvegarder la configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
