'use client';

import { useState } from 'react';
import type { Pinpoint, Sound } from '@/lib/db';
import { ICON_CATEGORIES } from '@/lib/db';

interface PinpointListProps {
  pinpoints: Pinpoint[];
  sounds: Sound[];
  onSave: (pinpoint: Partial<Pinpoint>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function PinpointList({ pinpoints, sounds, onSave, onDelete }: PinpointListProps) {
  const [editingPinpoint, setEditingPinpoint] = useState<Partial<Pinpoint> | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconCategory, setIconCategory] = useState<keyof typeof ICON_CATEGORIES>("water");

  const handleSave = async () => {
    if (editingPinpoint) {
      await onSave(editingPinpoint);
      setEditingPinpoint(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Gérer les points
        </h2>
        <button
          onClick={() =>
            setEditingPinpoint({
              latitude: 48.8566,
              longitude: 2.3522,
              title: "",
              description: "",
              sound_url: "",
              icon: "💧",
            })
          }
          className="water-button"
        >
          + Nouveau point
        </button>
      </div>

      {editingPinpoint && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-bold text-gray-800">
            {editingPinpoint.id ? "Modifier" : "Nouveau"} point
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.000001"
              placeholder="Latitude"
              value={editingPinpoint.latitude || ""}
              onChange={(e) =>
                setEditingPinpoint({
                  ...editingPinpoint,
                  latitude: parseFloat(e.target.value),
                })
              }
              className="water-input"
            />
            <input
              type="number"
              step="0.000001"
              placeholder="Longitude"
              value={editingPinpoint.longitude || ""}
              onChange={(e) =>
                setEditingPinpoint({
                  ...editingPinpoint,
                  longitude: parseFloat(e.target.value),
                })
              }
              className="water-input"
            />
          </div>

          <input
            type="text"
            placeholder="Titre"
            value={editingPinpoint.title || ""}
            onChange={(e) =>
              setEditingPinpoint({
                ...editingPinpoint,
                title: e.target.value,
              })
            }
            className="water-input w-full"
          />

          <textarea
            placeholder="Description"
            value={editingPinpoint.description || ""}
            onChange={(e) =>
              setEditingPinpoint({
                ...editingPinpoint,
                description: e.target.value,
              })
            }
            className="water-input w-full"
            rows={3}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Son associé
            </label>
            <select
              value={
                editingPinpoint.sound_url?.startsWith("/api/sounds?id=")
                  ? editingPinpoint.sound_url.split("=")[1]
                  : ""
              }
              onChange={(e) => {
                const id = e.target.value;
                setEditingPinpoint({
                  ...editingPinpoint,
                  sound_url: id ? `/api/sounds?id=${id}` : "",
                });
              }}
              className="water-input w-full"
            >
              <option value="">Sélectionner un son...</option>
              {sounds.map((sound) => (
                <option key={sound.id} value={sound.id}>
                  {sound.filename} (ID: {sound.id})
                </option>
              ))}
            </select>
            {editingPinpoint.sound_url &&
              !editingPinpoint.sound_url.startsWith(
                "/api/sounds?id="
              ) && (
                <p className="text-xs text-amber-600 mt-1">
                  Attention: Ce point utilise une URL personnalisée (
                  {editingPinpoint.sound_url})
                </p>
              )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Icône du point
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-12 h-12 rounded-lg bg-water-light flex items-center justify-center text-2xl border-2 border-water-main">
                {editingPinpoint.icon || "💧"}
              </div>
              <input
                type="text"
                placeholder="Icône personnalisée"
                value={editingPinpoint.icon || ""}
                onChange={(e) =>
                  setEditingPinpoint({
                    ...editingPinpoint,
                    icon: e.target.value,
                  })
                }
                className="water-input flex-1"
              />
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="px-3 py-2 bg-water-light text-water-dark rounded-lg hover:bg-water-main hover:text-white transition-colors"
              >
                {showIconPicker ? "Fermer" : "Choisir"}
              </button>
            </div>

            {showIconPicker && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                {/* Category tabs */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIconCategory(key as keyof typeof ICON_CATEGORIES)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                        iconCategory === key
                          ? "bg-water-main text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Icon grid */}
                <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto p-1 bg-white rounded-lg">
                  {ICON_CATEGORIES[iconCategory].icons.map((icon, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditingPinpoint({
                          ...editingPinpoint,
                          icon: icon,
                        });
                      }}
                      className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-water-light transition-colors ${
                        editingPinpoint.icon === icon
                          ? "bg-water-main ring-2 ring-water-dark"
                          : "bg-gray-50"
                      }`}
                      title={icon}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Saisissez une icône ou choisissez parmi les icônes thématiques.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="water-button"
            >
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

      <div className="space-y-3">
        {pinpoints.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500">Aucun point sur la carte.</p>
            <button
              onClick={() =>
                setEditingPinpoint({
                  latitude: 48.8566,
                  longitude: 2.3522,
                  title: "",
                  description: "",
                  sound_url: "",
                  icon: "💧",
                })
              }
              className="mt-4 text-water-dark font-medium hover:underline"
            >
              Créer le premier point
            </button>
          </div>
        ) : (
          pinpoints.map((pinpoint) => (
            <div
              key={pinpoint.id}
              className="group bg-white border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md hover:border-water-light"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-water-light flex items-center justify-center text-xl flex-shrink-0">
                  {pinpoint.icon || "💧"}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">
                    {pinpoint.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {pinpoint.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {Number(pinpoint.latitude).toFixed(4)},{" "}
                    {Number(pinpoint.longitude).toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => setEditingPinpoint(pinpoint)}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-water-dark bg-water-light/30 rounded-lg hover:bg-water-light transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() =>
                    onDelete(pinpoint.id)
                  }
                  className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
