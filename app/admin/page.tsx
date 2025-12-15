'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pinpoint, MapConfig, Sound } from '@/lib/db';
import { getCookie } from '@/lib/client-utils';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [config, setConfig] = useState<Partial<MapConfig>>({});
  const [activeTab, setActiveTab] = useState<'pinpoints' | 'sounds' | 'config'>('pinpoints');
  
  const [editingPinpoint, setEditingPinpoint] = useState<Partial<Pinpoint> | null>(null);
  const [initializingDb, setInitializingDb] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'pinpoint' | 'sound' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const loadData = useCallback(async () => {
    try {
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
      showToast(`Impossible de charger les données. (${message})`, 'error');
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('admin_token');
      const hasToken = !!token;
      setIsAuthenticated(hasToken);
      
      if (hasToken) {
        loadData();
      }
    };
    
    checkAuth();
  }, [loadData]);

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
        const data = await response.json();
        setError(data.error || 'Mot de passe incorrect');
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
        showToast('Point sauvegardé.', 'success');
      } else {
        const data = await response.json();
        showToast(data?.error || 'Impossible de sauvegarder le point.', 'error');
      }
    } catch (err) {
      console.error('Error saving pinpoint:', err);
      showToast('Erreur lors de la sauvegarde du point.', 'error');
    }
  };

  const handleDeletePinpoint = (id: number) => {
    setDeleteId(id);
    setDeleteType('pinpoint');
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
        showToast(`Fichier téléchargé ! URL: /api/sounds?id=${data.id}`, 'success');
      }
    } catch (err) {
      console.error('Error uploading sound:', err);
      showToast('Erreur lors du téléversement du son.', 'error');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      showToast('Configuration sauvegardée !', 'success');
      await loadData();
    } catch (err) {
      console.error('Error saving config:', err);
      showToast('Erreur lors de la sauvegarde de la configuration.', 'error');
    }
  };

  const handleInitDatabase = async () => {
    try {
      setInitializingDb(true);
      const response = await fetch('/api/init');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Initialisation échouée');
      }

      showToast(data?.message || 'Base initialisée avec les données de démonstration.', 'success');
      await loadData();
    } catch (err) {
      console.error('Error initializing database:', err);
      showToast("Impossible d'initialiser la base. Vérifiez DATABASE_URL et réessayez.", "error");
    } finally {
      setInitializingDb(false);
    }
  };

  const copySoundUrl = async (id: number) => {
    try {
      await navigator.clipboard.writeText(`/api/sounds?id=${id}`);
      showToast('URL copiée dans le presse-papier.', 'success');
    } catch (err) {
      console.error('Error copying sound url:', err);
      showToast("Impossible de copier l'URL du son.", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-water-light via-white to-water-light flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full border border-water-main/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-water-dark mb-2">
              O2Paris
            </h1>
            <p className="text-gray-500 font-sans uppercase tracking-widest text-xs">Administration</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
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
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="water-button w-full py-3 text-lg"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center font-mono">
              Dev Mode • Default: Admin123
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-water-main flex items-center justify-center text-white font-bold">A</div>
             <h1 className="text-xl font-bold text-water-deep font-serif">O2Paris Admin</h1>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              onClick={handleInitDatabase}
              disabled={initializingDb}
              className="px-4 py-2 text-water-dark bg-water-light/50 hover:bg-water-light rounded-lg transition-colors border border-transparent hover:border-water-main/30"
            >
              {initializingDb ? '...' : 'Reset DB'}
            </button>
            <a href="/" className="px-4 py-2 text-gray-600 hover:text-water-main bg-gray-100 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
              Voir carte
            </a>
            <button onClick={handleLogout} className="px-4 py-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pinpoints')}
              className={`px-8 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'pinpoints'
                  ? 'text-water-main border-b-2 border-water-main bg-water-light/10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📍 Points ({pinpoints.length})
            </button>
            <button
              onClick={() => setActiveTab('sounds')}
              className={`px-8 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'sounds'
                  ? 'text-water-main border-b-2 border-water-main bg-water-light/10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔊 Sons ({sounds.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-8 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'config'
                  ? 'text-water-main border-b-2 border-water-main bg-water-light/10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚙️ Configuration
            </button>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50/50">
            {activeTab === 'pinpoints' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Gestion des Points</h2>
                  <button
                    onClick={() => setEditingPinpoint({
                      latitude: 48.8566,
                      longitude: 2.3522,
                      title: '',
                      description: '',
                      sound_url: '',
                      icon: '💧',
                    })}
                    className="water-button flex items-center gap-2"
                  >
                    <span>+</span> Nouveau Point
                  </button>
                </div>

                {editingPinpoint && (
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-water-main/20 space-y-4 mb-8 animate-fade-in">
                    <h3 className="font-bold text-water-dark border-b border-gray-100 pb-2 mb-4">
                      {editingPinpoint.id ? 'Modifier le point' : 'Nouveau point'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={editingPinpoint.latitude || ''}
                          onChange={(e) => setEditingPinpoint({
                            ...editingPinpoint,
                            latitude: parseFloat(e.target.value),
                          })}
                          className="water-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={editingPinpoint.longitude || ''}
                          onChange={(e) => setEditingPinpoint({
                            ...editingPinpoint,
                            longitude: parseFloat(e.target.value),
                          })}
                          className="water-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre</label>
                      <input
                        type="text"
                        value={editingPinpoint.title || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          title: e.target.value,
                        })}
                        className="water-input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                      <textarea
                        value={editingPinpoint.description || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          description: e.target.value,
                        })}
                        className="water-input w-full min-h-[100px]"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Audio</label>
                      <input
                        type="text"
                        placeholder="/api/sounds?id=..."
                        value={editingPinpoint.sound_url || ''}
                        onChange={(e) => setEditingPinpoint({
                          ...editingPinpoint,
                          sound_url: e.target.value,
                        })}
                        className="water-input w-full font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icône</label>
                       <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="💧"
                            value={editingPinpoint.icon || ''}
                            onChange={(e) => setEditingPinpoint({
                              ...editingPinpoint,
                              icon: e.target.value,
                            })}
                            className="water-input w-20 text-center text-xl"
                          />
                          <span className="text-xs text-gray-500">Emoji ou caractère simple</span>
                       </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4 justify-end">
                      <button
                        onClick={() => setEditingPinpoint(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button onClick={handleSavePinpoint} className="water-button">
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinpoints.map((pinpoint) => (
                    <div
                      key={pinpoint.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group relative"
                    >
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                          onClick={() => setEditingPinpoint(pinpoint)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePinpoint(pinpoint.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl bg-water-light/30 w-10 h-10 flex items-center justify-center rounded-full">
                          {pinpoint.icon || '💧'}
                        </span>
                        <h4 className="font-bold text-gray-800 truncate pr-16" title={pinpoint.title}>
                          {pinpoint.title}
                        </h4>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                        {pinpoint.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
                        <span>{pinpoint.latitude.toFixed(4)}, {pinpoint.longitude.toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sounds' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Bibliothèque Sonore</h2>
                
                <div className="bg-white p-6 rounded-xl border-2 border-dashed border-water-main/30 hover:border-water-main transition-colors text-center group">
                  <div className="mb-3">
                    <svg className="mx-auto h-12 w-12 text-water-main/50 group-hover:text-water-main" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                    <span className="text-water-main font-bold hover:underline">Cliquez pour téléverser</span> ou glissez un fichier ici
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUploadSound}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">MP3, WAV, OGG jusqu&apos;à 10MB</p>
                </div>

                <div className="space-y-3">
                  {sounds.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">
                      Aucun son dans la bibliothèque.
                    </div>
                  ) : (
                    sounds.map((sound) => (
                        <div
                          key={sound.id}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                               🎵
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-md" title={sound.filename}>
                                  {sound.filename}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">
                                  ID: {sound.id} • {(sound.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                          </div>
                          <button
                            onClick={() => copySoundUrl(sound.id)}
                            className="px-3 py-1 text-xs font-medium text-water-main hover:bg-water-light/20 rounded-full border border-water-main/30 transition-colors"
                          >
                            Copier Lien
                          </button>
                        </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Configuration Globale</h2>
                
                <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Fournisseur de Tuiles (Tile Layer)
                    </label>
                    <input
                      type="text"
                      value={config.tile_layer_url || ''}
                      onChange={(e) => setConfig({ ...config, tile_layer_url: e.target.value })}
                      className="water-input w-full font-mono text-sm"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-400 mt-1">URL template pour Leaflet</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Lat Centre
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Lng Centre
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Zoom Init
                      </label>
                      <input
                        type="number"
                        value={config.zoom_level || ''}
                        onChange={(e) => setConfig({ ...config, zoom_level: parseInt(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Min
                      </label>
                      <input
                        type="number"
                        value={config.min_zoom || ''}
                        onChange={(e) => setConfig({ ...config, min_zoom: parseInt(e.target.value) })}
                        className="water-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Max
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Attribution
                    </label>
                    <textarea
                      value={config.attribution || ''}
                      onChange={(e) => setConfig({ ...config, attribution: e.target.value })}
                      className="water-input w-full text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                     <button onClick={handleSaveConfig} className="water-button px-8">
                       Sauvegarder
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal
        isOpen={deleteId !== null && deleteType !== null}
        title="Confirmer la suppression"
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={async () => {
          if (deleteId && deleteType) {
            if (deleteType === 'pinpoint') {
              try {
                await fetch(`/api/pinpoints?id=${deleteId}`, { method: 'DELETE' });
                await loadData();
                showToast('Point supprimé.', 'success');
              } catch (err) {
                console.error('Error deleting pinpoint:', err);
                showToast('Erreur lors de la suppression du point.', 'error');
              }
            }
            setDeleteId(null);
            setDeleteType(null);
          }
        }}
        confirmText="Supprimer"
        isDestructive={true}
      >
        <p>Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}
