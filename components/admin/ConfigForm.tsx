'use client';

import { useState, useEffect } from 'react';
import type { MapConfig, CustomBackground } from '@/lib/db';
import { PRESET_TILE_LAYERS, BACKGROUND_PRESETS } from '@/lib/db';

interface ConfigFormProps {
  config: Partial<MapConfig>;
  onSave: (config: Partial<MapConfig>) => Promise<void>;
}

export default function ConfigForm({ config: initialConfig, onSave }: ConfigFormProps) {
  const [config, setConfig] = useState(initialConfig);
  const [showTilePicker, setShowTilePicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>([]);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const handleSave = async () => {
    await onSave(config);
  };

  // Load custom backgrounds
  useEffect(() => {
    const loadCustomBackgrounds = async () => {
      try {
        const response = await fetch('/api/backgrounds');
        if (response.ok) {
          const data = await response.json();
          setCustomBackgrounds(data);
        }
      } catch (error) {
        console.error('Error loading custom backgrounds:', error);
      }
    };
    loadCustomBackgrounds();
  }, []);

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }

    // Validate file size (max 2MB for backgrounds)
    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 2MB).');
      return;
    }

    setUploadingBackground(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/backgrounds', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newBackground = await response.json();
        setCustomBackgrounds([...customBackgrounds, newBackground]);
        alert('Arrière-plan téléversé avec succès !');
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Erreur lors du téléversement.');
    } finally {
      setUploadingBackground(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteBackground = async (id: number) => {
    if (!confirm('Supprimer cet arrière-plan ?')) return;

    try {
      const response = await fetch(`/api/backgrounds?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomBackgrounds(customBackgrounds.filter(bg => bg.id !== id));
        // If this background was selected, reset to default
        if (config.background_theme === `custom-${id}`) {
          setConfig({ ...config, background_theme: 'water' });
        }
      } else {
        alert('Erreur lors de la suppression.');
      }
    } catch (error) {
      console.error('Error deleting background:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        Configuration de la carte
      </h2>

      <div className="space-y-4">
        {/* Tile Layer Picker */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Style de carte
            </label>
            <button
              type="button"
              onClick={() => setShowTilePicker(!showTilePicker)}
              className="text-sm text-water-dark hover:underline"
            >
              {showTilePicker ? "Masquer les styles" : "Voir tous les styles"}
            </button>
          </div>

          {showTilePicker && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {PRESET_TILE_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    setConfig({
                      ...config,
                      tile_layer_url: layer.url,
                      attribution: layer.attribution,
                    });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    config.tile_layer_url === layer.url
                      ? "border-water-main bg-water-light/50 shadow-md"
                      : "border-gray-200 bg-white hover:border-water-light"
                  }`}
                >
                  <div className="text-2xl mb-2">{layer.preview}</div>
                  <div className="font-medium text-sm text-gray-800 truncate">
                    {layer.name}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {layer.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={config.tile_layer_url || ""}
            onChange={(e) =>
              setConfig({ ...config, tile_layer_url: e.target.value })
            }
            className="water-input w-full"
            placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Sélectionnez un style prédéfini ou entrez une URL personnalisée
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude du centre
            </label>
            <input
              type="number"
              step="0.000001"
              value={config.center_lat || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setConfig({
                  ...config,
                  center_lat: isNaN(value) ? config.center_lat : value,
                });
              }}
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
              value={config.center_lng || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setConfig({
                  ...config,
                  center_lng: isNaN(value) ? config.center_lng : value,
                });
              }}
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
              value={config.zoom_level || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setConfig({
                  ...config,
                  zoom_level: isNaN(value) ? config.zoom_level : value,
                });
              }}
              className="water-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom min
            </label>
            <input
              type="number"
              value={config.min_zoom || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setConfig({
                  ...config,
                  min_zoom: isNaN(value) ? config.min_zoom : value,
                });
              }}
              className="water-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom max
            </label>
            <input
              type="number"
              value={config.max_zoom || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setConfig({
                  ...config,
                  max_zoom: isNaN(value) ? config.max_zoom : value,
                });
              }}
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
            value={config.attribution || ""}
            onChange={(e) =>
              setConfig({ ...config, attribution: e.target.value })
            }
            className="water-input w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Thème d&apos;arrière-plan
            </label>
            <button
              type="button"
              onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
              className="text-sm text-water-dark hover:underline"
            >
              {showBackgroundPicker ? "Masquer les thèmes" : "Voir tous les thèmes"}
            </button>
          </div>

          {showBackgroundPicker && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Thèmes prédéfinis</h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setConfig({
                        ...config,
                        background_theme: preset.id,
                      });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                      config.background_theme === preset.id
                        ? "border-water-main shadow-md ring-2 ring-water-light"
                        : "border-gray-200 bg-white hover:border-water-light"
                    }`}
                  >
                    <div className={`h-16 rounded-md mb-2 ${preset.cssClass}`}></div>
                    <div className="text-xl mb-1">{preset.preview}</div>
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                  <span>Vos arrière-plans</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-water-light text-water-dark rounded-lg hover:bg-water-main hover:text-white transition-colors text-sm flex items-center gap-1">
                    <span>📤</span>
                    <span>{uploadingBackground ? "..." : "Téléverser"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBackground}
                      disabled={uploadingBackground}
                      className="hidden"
                    />
                  </label>
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Téléversez vos propres images (max 2MB, formats: JPG, PNG, WebP)
                </p>
                
                {customBackgrounds.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {customBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        className={`relative group p-2 rounded-lg border-2 transition-all ${
                          config.background_theme === `custom-${bg.id}`
                            ? "border-water-main shadow-md ring-2 ring-water-light"
                            : "border-gray-200 bg-white hover:border-water-light"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setConfig({
                              ...config,
                              background_theme: `custom-${bg.id}`,
                            });
                          }}
                          className="w-full"
                        >
                          <div
                            className="h-16 rounded-md mb-1 bg-cover bg-center"
                            style={{ backgroundImage: `url(/api/backgrounds?id=${bg.id})` }}
                          ></div>
                          <div className="text-xs font-medium text-gray-700 truncate">
                            {bg.filename}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBackground(bg.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Aucun arrière-plan personnalisé
                  </div>
                )}
              </div>
            </div>
          )}

          <select
            value={config.background_theme || "water"}
            onChange={(e) =>
              setConfig({ ...config, background_theme: e.target.value })
            }
            className="water-input w-full"
          >
            <optgroup label="Thèmes prédéfinis">
              {BACKGROUND_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.preview} {preset.name}
                </option>
              ))}
            </optgroup>
            {customBackgrounds.length > 0 && (
              <optgroup label="Vos arrière-plans">
                {customBackgrounds.map((bg) => (
                  <option key={bg.id} value={`custom-${bg.id}`}>
                    🖼️ {bg.filename}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Change l&apos;arrière-plan de la page d&apos;accueil (derrière la carte)
          </p>
        </div>

        <button onClick={handleSave} className="water-button">
          Sauvegarder la configuration
        </button>
      </div>
    </div>
  );
}
