'use client';

import { useState, useEffect } from 'react';
import type { Pinpoint, MapConfig, Sound } from '@/lib/db';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  
  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [config, setConfig] = useState<Partial<MapConfig>>({});
  const [activeTab, setActiveTab] = useState<'pinpoints' | 'sounds' | 'config'>('pinpoints');
  
  const [editingPinpoint, setEditingPinpoint] = useState<Partial<Pinpoint> | null>(null);
  const [initializingDb, setInitializingDb] = useState(false);

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
      setStatus('');
      const [pinpointsRes, configRes, soundsRes] = await Promise.all([
        fetch('/api/pinpoints'),
        fetch('/api/config'),
        fetch('/api/sounds'),
      ]);

      if (!pinpointsRes.ok || !configRes.ok || !soundsRes.ok) {
        throw new Error('Failed to load data');
      }

      const [pinpointsData, configData, soundsData] = await Promise.all([
        pinpointsRes.json(),
        configRes.json(),
        soundsRes.json(),
      ]);

      setPinpoints(pinpointsData);
      setConfig(configData);
      setSounds(soundsData);
    } catch (err) {
      console.error('Error loading data:', err);
      const message = err instanceof Error ? err.message : 'erreur inconnue';
      setStatus(`Impossible de charger les données. Vérifiez la base de données puis réessayez. (${message})`);
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
        setStatus('Point sauvegardé.');
      } else {
        const data = await response.json();
        setStatus(data?.error || 'Impossible de sauvegarder le point.');
      }
    } catch (err) {
      console.error('Error saving pinpoint:', err);
      setStatus('Erreur lors de la sauvegarde du point.');
    }
  };

  const handleDeletePinpoint = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point ?')) return;

    try {
      await fetch(`/api/pinpoints?id=${id}`, { method: 'DELETE' });
      await loadData();
      setStatus('Point supprimé.');
    } catch (err) {
      console.error('Error deleting pinpoint:', err);
      setStatus('Erreur lors de la suppression du point.');
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
        await loadData();
        setStatus(`Fichier téléchargé ! URL: /api/sounds?id=${data.id}`);
      }
    } catch (err) {
      console.error('Error uploading sound:', err);
      setStatus('Erreur lors du téléversement du son.');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setStatus('Configuration sauvegardée !');
      await loadData();
    } catch (err) {
      console.error('Error saving config:', err);
      setStatus('Erreur lors de la sauvegarde de la configuration.');
    }
  };

  const handleInitDatabase = async () => {
    try {
      setInitializingDb(true);
      setStatus('');
      const response = await fetch('/api/init');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Initialisation échouée');
      }

      setStatus(data?.message || 'Base initialisée avec les données de démonstration.');
      await loadData();
    } catch (err) {
      console.error('Error initializing database:', err);
      setStatus('Impossible d’initialiser la base. Vérifiez DATABASE_URL et réessayez.');
    } finally {
      setInitializingDb(false);
    }
  };

  const copySoundUrl = async (id: number) => {
    try {
      await navigator.clipboard.writeText(`/api/sounds?id=${id}`);
      setStatus('URL copiée dans le presse-papier.');
    } catch (err) {
      console.error('Error copying sound url:', err);
      setStatus('Impossible de copier l’URL du son.');
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
          
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 text-xs text-gray-500 text-center">
              Développement - Mot de passe par défaut: admin123
            </div>
          )}
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
            <button
              onClick={handleInitDatabase}
              disabled={initializingDb}
              className="water-button"
            >
              {initializingDb ? 'Initialisation...' : 'Initialiser + seed'}
            </button>
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
        {status && (
          <div className="mb-4 bg-blue-50 border border-water-main text-water-dark px-4 py-3 rounded-lg">
            {status}
          </div>
        )}
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
                      icon: '💧',
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
                    
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Icône personnalisée (emoji ou caractère)"
                        value={editingPinpoint.icon || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          icon: e.target.value,
                        })}
                        className="water-input w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Exemple : 💧 🌊 🎵 — laisser vide pour utiliser l’icône par défaut.
                      </p>
                    </div>
                    
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
                        <h4 className="font-bold text-gray-800">
                          {pinpoint.icon ? `${pinpoint.icon} ` : ''}{pinpoint.title}
                        </h4>
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
                    <li>Copiez l&apos;URL grâce au bouton associé ou notez l&apos;ID</li>
                    <li>Utilisez /api/sounds?id=ID dans le champ &quot;URL du son&quot; d&apos;un point</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Sons disponibles</h3>
                    <span className="text-xs text-gray-500">{sounds.length} fichier(s)</span>
                  </div>
                  {sounds.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Aucun son pour le moment. Téléversez-en un pour le rendre disponible dans vos points.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sounds.map((sound) => (
                        <div
                          key={sound.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{sound.filename}</p>
                            <p className="text-xs text-gray-500">
                              ID: {sound.id} • {(sound.size / 1024).toFixed(1)} Ko
                            </p>
                          </div>
                          <button onClick={() => copySoundUrl(sound.id)} className="water-button">
                            Copier l&apos;URL
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
