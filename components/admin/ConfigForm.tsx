'use client';

import { useState } from 'react';
import type { MapConfig } from '@/lib/db';
import { PRESET_TILE_LAYERS } from '@/lib/db';

interface ConfigFormProps {
  config: Partial<MapConfig>;
  onSave: (config: Partial<MapConfig>) => Promise<void>;
}

export default function ConfigForm({ config: initialConfig, onSave }: ConfigFormProps) {
  const [config, setConfig] = useState(initialConfig);
  const [showTilePicker, setShowTilePicker] = useState(false);

  const handleSave = async () => {
    await onSave(config);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème d&apos;arrière-plan
          </label>
          <select
            value={config.background_theme || "water"}
            onChange={(e) =>
              setConfig({ ...config, background_theme: e.target.value })
            }
            className="water-input w-full"
          >
            <option value="water">Eau (Par défaut)</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="nature">Nature</option>
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
