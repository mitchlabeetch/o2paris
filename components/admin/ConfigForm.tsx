/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/admin/ConfigForm.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Tableau de Personnalisation" de l'app.
 * Il permet de modifier tous les paramètres globaux : titre, couleurs, police,
 * thème de fond, icône d'accueil, et paramètres de la carte.
 *
 * FONCTIONNEMENT :
 * 1. Affiche des onglets pour différentes sections (général, carte, thème).
 * 2. Permet de sélectionner parmi des presets (couleurs, polices, fonds).
 * 3. Permet d'uploader des fonds d'écran personnalisés.
 * 4. Sauvegarde tout en base de données via l'API /api/config.
 * 5. Les changements sont appliqués en temps réel au public.
 *
 * UTILISÉ PAR :
 * - admin/page.tsx : Onglet "Configuration" du tableau de bord.
 *
 * REPÈRES :
 * - Lignes 39-82 : Upload des fonds personnalisés.
 * - Lignes 84-108 : Suppression des fonds.
 * - Lignes 110-200+ : Rendu des onglets et formulaires.
 * 
 * SECTIONS CONFIGURABLES :
 * 1. Général :
 *    - Titre de l'app (app_title)
 *    - Sous-titre (app_subtitle)
 *    - Icône d'accueil (overlay_icon : emoji)
 * 
 * 2. Apparence :
 *    - Police d'écriture (font_family)
 *    - Couleur principale (primary_color)
 *    - Couleur secondaire (secondary_color)
 *    - Thème de fond (background_theme)
 * 
 * 3. Fonds Personnalisés :
 *    - Upload d'images (max 2 MB)
 *    - Suppression des fonds
 *    - Sélection et aperçu
 * 
 * 4. Carte (Leaflet) :
 *    - Coordonnées centrales (center_lat, center_lng)
 *    - Niveaux de zoom (zoom_level, min_zoom, max_zoom)
 *    - Couche de tuiles (tile_layer_url)
 *    - Attribution
 * 
 * DONNÉES SAUVEGARDÉES :
 * - Type MapConfig (voir lib/db.ts).
 * - Stockées en base de données (table map_config).
 * - Une seule ligne de config (mise à jour, pas d'insertion).
 * 
 * FLUX DE SAUVEGARDE :
 * 1. L'utilisateur remplit les formulaires.
 * 2. Clique sur "Enregistrer".
 * 3. Appelle onSave(config) (callback du parent).
 * 4. Le parent fait PUT /api/config avec les données.
 * 5. Le serveur met à jour la base.
 * 6. Le public voit les changements au prochain poll (5s par défaut).
 * 
 * PRESETS :
 * - Polices : Playfair Display, Lato, Cinzel, etc.
 * - Couleurs : Eau, ciel, forêt, coucher de soleil, etc.
 * - Fonds : 20+ thèmes prédéfinis (eau, nuit, arc-en-ciel, etc).
 * - Icônes : Plusieurs emoji par catégorie (eau, nature, objets).
 * 
 * UPLOAD DE FONDS :
 * - Types acceptés : jpg, png, webp (images).
 * - Taille max : 2 MB (plus que les images normales pour qualité).
 * - Sauvegardé en base (table custom_backgrounds).
 * - Accessible via /api/backgrounds?id=X.
 * 
 * LIMITATIONS :
 * - Une seule config active à la fois (pas de profils).
 * - Les changements ne se voient qu'après rafraîchissement du public.
 * - Pas de preview en temps réel du public.
 * 
 * AMÉLIORATIONS FUTURES :
 * - Preview en temps réel (iframe ou snapshot).
 * - Historique des configurations (undo/redo).
 * - Themes sauvegardés (save/load configurations).
 * - Palette de couleurs générées (ColorPicker avancé).
 * 
 * SÉCURITÉ :
 * - L'upload est validé côté serveur.
 * - Les données sont échappées avant stockage.
 * - Pas d'accès au disque (tout passe par l'API).
 * 
 * PERFORMANCE :
 * - Les uploads sont asynchrones (ne bloquent pas).
 * - Chaque changement ne requête qu'une seule API.
 * - Les presets sont pre-chargés (pas d'appels supplémentaires).
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - admin/page.tsx : Père qui utilise ce composant.
 * - /api/config : Sauvegarde la configuration.
 * - /api/backgrounds : Upload et gestion des fonds.
 * - lib/db.ts : Types MapConfig, BACKGROUND_PRESETS, FONT_PRESETS.
 * - app/page.tsx : Consomme la config (polling toutes les 5s).
 * 
 * EXEMPLE D'UTILISATION :
 * ```tsx
 * <ConfigForm
 *   config={currentConfig}
 *   onSave={async (config) => {
 *     await fetch('/api/config', { method: 'PUT', body: JSON.stringify(config) })
 *   }}
 * />
 * ```
 * 
 * NOTES :
 * - Composant volumineux (441+ lignes).
 * - Gère beaucoup de state (onglets, sélections, uploads).
 * - À considérer pour refactoring (split en sous-composants).
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

'use client';

import { useState, useEffect } from 'react';
import type { MapConfig, CustomBackground } from '@/lib/db';
import { BACKGROUND_PRESETS, OVERLAY_ICON_PRESETS, FONT_PRESETS } from '@/lib/db';
import ColorPicker from './ColorPicker';

const COLOR_THEMES = [
  { name: "Eau de Paris", primary: "#2196f3", secondary: "#1565c0" },
  { name: "Forêt", primary: "#4caf50", secondary: "#2e7d32" },
  { name: "Coucher de Soleil", primary: "#ff9800", secondary: "#f57c00" },
  { name: "Baie Sauvage", primary: "#9c27b0", secondary: "#7b1fa2" },
  { name: "Ardoise", primary: "#607d8b", secondary: "#455a64" },
  { name: "Océan Profond", primary: "#006064", secondary: "#00acc1" },
  { name: "Rose", primary: "#e91e63", secondary: "#c2185b" },
];

// ---------------------------------------------------------------------------
// PROPS (PARAMÈTRES)
// ---------------------------------------------------------------------------
interface ConfigFormProps {
  config: Partial<MapConfig>;
  onSave: (config: Partial<MapConfig>) => Promise<void>;
}

export default function ConfigForm({ config: initialConfig, onSave }: ConfigFormProps) {
  const [config, setConfig] = useState(initialConfig);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showOverlayIconPicker, setShowOverlayIconPicker] = useState(false);
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
      if (e.target) {
        e.target.value = ''; // Reset input
      }
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
        Configuration globale
      </h2>

      <div className="space-y-4">
        {/* Section 1: Titles & Text */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Titres et textes</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l&apos;application
              </label>
              <input
                type="text"
                value={config.app_title || ""}
                onChange={(e) =>
                  setConfig({ ...config, app_title: e.target.value })
                }
                className="water-input w-full"
                placeholder="Eau de Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={config.app_subtitle || ""}
                onChange={(e) =>
                  setConfig({ ...config, app_subtitle: e.target.value })
                }
                className="water-input w-full"
                placeholder="Une expérience sonore et visuelle"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Colors & Fonts */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Couleurs et police</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police de caractères
              </label>
              <select
                value={config.font_family || "Playfair Display"}
                onChange={(e) =>
                  setConfig({ ...config, font_family: e.target.value })
                }
                className="water-input w-full"
              >
                {FONT_PRESETS.map((font) => (
                  <option key={font.id} value={font.value}>
                    {font.name} ({font.style})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thèmes de couleurs rapides
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        primary_color: theme.primary,
                        secondary_color: theme.secondary,
                      })
                    }
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-sm hover:shadow-md transition-shadow flex items-center gap-2 bg-white"
                  >
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary }} />
                    </div>
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker
                label="Couleur principale"
                color={config.primary_color || "#2196f3"}
                onChange={(val) => setConfig({ ...config, primary_color: val })}
              />
              <ColorPicker
                label="Couleur secondaire"
                color={config.secondary_color || "#1565c0"}
                onChange={(val) => setConfig({ ...config, secondary_color: val })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Loading Overlay Icon */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⏳ Icône de chargement</h3>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Icône pour l&apos;écran de chargement
              </label>
              <button
                type="button"
                onClick={() => setShowOverlayIconPicker(!showOverlayIconPicker)}
                className="text-sm text-water-dark hover:underline"
              >
                {showOverlayIconPicker ? "Masquer" : "Voir toutes les icônes"}
              </button>
            </div>

            {showOverlayIconPicker && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4 p-4 bg-white rounded-lg border border-gray-200">
                {OVERLAY_ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setConfig({
                        ...config,
                        overlay_icon: preset.icon,
                      });
                    }}
                    className={`p-2 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                      config.overlay_icon === preset.icon
                        ? "border-water-main bg-water-light shadow-md"
                        : "border-gray-200 bg-white hover:border-water-light"
                    }`}
                    title={preset.name}
                  >
                    <div className="text-3xl">{preset.icon}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="text-5xl p-3 bg-white rounded-lg border-2 border-gray-300">
                {config.overlay_icon || "💧"}
              </div>
              <input
                type="text"
                value={config.overlay_icon || ""}
                onChange={(e) =>
                  setConfig({ ...config, overlay_icon: e.target.value })
                }
                className="water-input flex-1"
                placeholder="💧"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choisissez une icône prédéfinie ou entrez un emoji personnalisé
            </p>
          </div>
        </div>

        {/* Background Theme Section */}
        <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎭 Arrière-plan</h3>
          
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

        <button onClick={handleSave} className="water-button w-full text-lg py-3">
          💾 Sauvegarder la configuration
        </button>
      </div>
    </div>
  );
}
