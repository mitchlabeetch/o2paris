'use client';

import { useState, useEffect } from 'react';
import type { Pinpoint, Sound, CustomIcon } from '@/lib/db';
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
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const handleSave = async () => {
    if (editingPinpoint) {
      await onSave(editingPinpoint);
      setEditingPinpoint(null);
    }
  };

  // Load custom icons
  useEffect(() => {
    const loadCustomIcons = async () => {
      try {
        const response = await fetch('/api/icons');
        if (response.ok) {
          const data = await response.json();
          setCustomIcons(data);
        }
      } catch (error) {
        console.error('Error loading custom icons:', error);
      }
    };
    loadCustomIcons();
  }, []);

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }

    // Validate file size (max 500KB for icons)
    if (file.size > 500 * 1024) {
      alert('Le fichier est trop volumineux (max 500KB).');
      return;
    }

    setUploadingIcon(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/icons', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newIcon = await response.json();
        setCustomIcons([...customIcons, newIcon]);
        alert('Icône téléversée avec succès !');
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Erreur lors du téléversement.');
    } finally {
      setUploadingIcon(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteIcon = async (id: number) => {
    if (!confirm('Supprimer cette icône ?')) return;

    try {
      const response = await fetch(`/api/icons?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomIcons(customIcons.filter(icon => icon.id !== id));
        // If this icon was selected, reset to default
        if (editingPinpoint?.icon === `custom-icon-${id}`) {
          setEditingPinpoint({ ...editingPinpoint, icon: '💧' });
        }
      } else {
        alert('Erreur lors de la suppression.');
      }
    } catch (error) {
      console.error('Error deleting icon:', error);
      alert('Erreur lors de la suppression.');
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
              <div className="w-12 h-12 rounded-lg bg-water-light flex items-center justify-center text-2xl border-2 border-water-main overflow-hidden">
                {editingPinpoint.icon?.startsWith('custom-icon-') ? (
                  <img 
                    src={`/api/icons?id=${editingPinpoint.icon.replace('custom-icon-', '')}`}
                    alt="icon"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  editingPinpoint.icon || "💧"
                )}
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
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Search bar */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher une icône..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="water-input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {iconSearchQuery.trim() 
                      ? `Recherche: "${iconSearchQuery}"`
                      : "Plus de 200+ icônes disponibles"}
                  </p>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setIconCategory(key as keyof typeof ICON_CATEGORIES);
                        setIconSearchQuery("");
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                        iconCategory === key && !iconSearchQuery.trim()
                          ? "bg-water-main text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Icon grid */}
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-64 overflow-y-auto p-2 bg-white rounded-lg mb-4">
                  {(() => {
                    // If searching, show all matching icons from all categories
                    const searchTerm = iconSearchQuery.trim().toLowerCase();
                    let iconsToShow = searchTerm
                      ? Object.values(ICON_CATEGORIES).flatMap(cat => cat.icons)
                      : ICON_CATEGORIES[iconCategory].icons;
                    
                    // Basic search filter (could be enhanced)
                    if (searchTerm) {
                      // Filter by the icon itself or category names
                      const matchingCategoryIcons = Object.entries(ICON_CATEGORIES)
                        .filter(([key, cat]) => 
                          cat.label.toLowerCase().includes(searchTerm) ||
                          key.toLowerCase().includes(searchTerm)
                        )
                        .flatMap(([_, cat]) => cat.icons);
                      
                      iconsToShow = [...new Set([...matchingCategoryIcons])];
                    }

                    return iconsToShow.length > 0 ? (
                      iconsToShow.map((icon, idx) => (
                        <button
                          key={`${icon}-${idx}`}
                          type="button"
                          onClick={() => {
                            setEditingPinpoint({
                              ...editingPinpoint,
                              icon: icon,
                            });
                            setShowIconPicker(false);
                            setIconSearchQuery("");
                          }}
                          className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-water-light transition-colors ${
                            editingPinpoint.icon === icon
                              ? "bg-water-main ring-2 ring-water-dark"
                              : "bg-gray-50 hover:shadow-sm"
                          }`}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-6 text-gray-500">
                        Aucune icône trouvée
                      </div>
                    );
                  })()}
                </div>

                {/* Custom Icons Section */}
                <div className="border-t border-gray-300 pt-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                    <span>Vos icônes</span>
                    <label className="cursor-pointer px-3 py-1.5 bg-water-light text-water-dark rounded-lg hover:bg-water-main hover:text-white transition-colors text-sm flex items-center gap-1">
                      <span>📤</span>
                      <span>{uploadingIcon ? "..." : "Téléverser"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadIcon}
                        disabled={uploadingIcon}
                        className="hidden"
                      />
                    </label>
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Téléversez vos propres icônes (max 500KB, formats: JPG, PNG, SVG, WebP)
                  </p>
                  
                  {customIcons.length > 0 ? (
                    <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 p-2 bg-white rounded-lg">
                      {customIcons.map((icon) => (
                        <div key={icon.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPinpoint({
                                ...editingPinpoint,
                                icon: `custom-icon-${icon.id}`,
                              });
                              setShowIconPicker(false);
                              setIconSearchQuery("");
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-water-light transition-colors overflow-hidden ${
                              editingPinpoint.icon === `custom-icon-${icon.id}`
                                ? "bg-water-main ring-2 ring-water-dark"
                                : "bg-gray-50 hover:shadow-sm"
                            }`}
                            title={icon.filename}
                          >
                            <img 
                              src={`/api/icons?id=${icon.id}`} 
                              alt={icon.filename}
                              className="w-full h-full object-contain"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIcon(icon.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            title="Supprimer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm bg-white rounded-lg">
                      Aucune icône personnalisée
                    </div>
                  )}
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
                <div className="w-10 h-10 rounded-full bg-water-light flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                  {pinpoint.icon?.startsWith('custom-icon-') ? (
                    <img 
                      src={`/api/icons?id=${pinpoint.icon.replace('custom-icon-', '')}`}
                      alt="icon"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    pinpoint.icon || "💧"
                  )}
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
