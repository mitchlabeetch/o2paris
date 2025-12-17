"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Pinpoint, MapConfig, Sound } from "@/lib/db";
import { PRESET_TILE_LAYERS, ICON_CATEGORIES } from "@/lib/db";
import { getCookie } from "@/lib/client-utils";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [config, setConfig] = useState<Partial<MapConfig>>({});
  const [activeTab, setActiveTab] = useState<"pinpoints" | "sounds" | "config">(
    "pinpoints"
  );

  const [editingPinpoint, setEditingPinpoint] =
    useState<Partial<Pinpoint> | null>(null);
  const [initializingDb, setInitializingDb] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"pinpoint" | "sound" | null>(
    null
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconCategory, setIconCategory] = useState<keyof typeof ICON_CATEGORIES>("water");
  const [showTilePicker, setShowTilePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio playback state
  const [playingSoundId, setPlayingSoundId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type });
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlaySound = (soundId: number) => {
    if (playingSoundId === soundId) {
      // Stop currently playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingSoundId(null);
    } else {
      // Stop previous if any
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Start new
      const audio = new Audio(`/api/sounds?id=${soundId}`);
      audio.onended = () => setPlayingSoundId(null);
      audio.onerror = () => {
        showToast("Erreur lors de la lecture du son", "error");
        setPlayingSoundId(null);
      };

      audioRef.current = audio;
      audio.play().catch(err => {
        console.error("Play error:", err);
        showToast("Impossible de lire le son", "error");
        setPlayingSoundId(null);
      });
      setPlayingSoundId(soundId);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [pinpointsRes, configRes, soundsRes] = await Promise.all([
        fetch("/api/pinpoints"),
        fetch("/api/config"),
        fetch("/api/sounds"),
      ]);

      if (!pinpointsRes.ok || !configRes.ok || !soundsRes.ok) {
        throw new Error("Failed to load data");
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
      console.error("Error loading data:", err);
      const message = err instanceof Error ? err.message : "erreur inconnue";
      showToast(`Impossible de charger les données. (${message})`, "error");
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie("admin_token");
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
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword("");
        loadData();
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  const handleSavePinpoint = async () => {
    if (!editingPinpoint) return;

    try {
      const method = editingPinpoint.id ? "PUT" : "POST";
      const response = await fetch("/api/pinpoints", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPinpoint),
      });

      if (response.ok) {
        await loadData();
        setEditingPinpoint(null);
        showToast("Point sauvegardé.", "success");
      } else {
        const data = await response.json();
        showToast(
          data?.error || "Impossible de sauvegarder le point.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error saving pinpoint:", err);
      showToast("Erreur lors de la sauvegarde du point.", "error");
    }
  };

  const confirmDelete = (id: number, type: "pinpoint" | "sound") => {
    setDeleteId(id);
    setDeleteType(type);
  };

  const executeDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "pinpoint") {
        await fetch(`/api/pinpoints?id=${deleteId}`, { method: "DELETE" });
        showToast("Point supprimé.", "success");
      } else {
        await fetch(`/api/sounds?id=${deleteId}`, { method: "DELETE" });
        showToast("Son supprimé.", "success");
      }
      await loadData();
    } catch (err) {
      console.error(`Error deleting ${deleteType}:`, err);
      showToast(
        `Erreur lors de la suppression du ${
          deleteType === "pinpoint" ? "point" : "son"
        }.`,
        "error"
      );
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      showToast("Erreur : Le fichier dépasse 4.5MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/sounds", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await loadData();
        showToast("Fichier téléchargé !", "success");
      } else {
        const errorData = await response.json();
        showToast(`Erreur : ${errorData.error}`, "error");
      }
    } catch (err) {
      console.error("Error uploading sound:", err);
      showToast("Erreur lors du téléversement du son.", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        showToast("Configuration sauvegardée !", "success");
        await loadData();
      } else {
        const data = await response.json();
        showToast(
          data?.error || "Impossible de sauvegarder la configuration.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error saving config:", err);
      showToast("Erreur lors de la sauvegarde de la configuration.", "error");
    }
  };

  const handleInitDatabase = async () => {
    try {
      setInitializingDb(true);
      const response = await fetch("/api/init");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Initialisation échouée");
      }

      showToast(data?.message || "Base initialisée avec succès.", "success");
      await loadData();
    } catch (err) {
      console.error("Error initializing database:", err);
      showToast(
        "Impossible d’initialiser la base. Vérifiez DATABASE_URL.",
        "error"
      );
    } finally {
      setInitializingDb(false);
    }
  };

  const copySoundUrl = async (id: number, e: React.MouseEvent) => {
    try {
      const fullUrl = `${window.location.origin}/api/sounds?id=${id}`;
      await navigator.clipboard.writeText(fullUrl);
      const btn = e.currentTarget as HTMLButtonElement;
      const originalText = btn.innerText;
      btn.innerText = "Copié !";
      setTimeout(() => (btn.innerText = originalText), 2000);
      showToast("URL copiée dans le presse-papier.", "success");
    } catch (err) {
      console.error("Error copying sound url:", err);
      showToast("Impossible de copier l’URL du son.", "error");
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

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex gap-2">
              <a
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                title="Retour à la carte"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </a>
              <button
                type="submit"
                disabled={loading}
                className="water-button w-full"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 text-xs text-gray-500 text-center">
              Développement - Mot de passe par défaut: Admin123
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Modal
        isOpen={!!deleteId}
        title={`Supprimer ce ${deleteType === "pinpoint" ? "point" : "son"} ?`}
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={executeDelete}
        confirmText="Supprimer"
        isDestructive
      >
        <p>
          Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
        </p>
      </Modal>

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-water-dark">
              Admin O2Paris
            </h1>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={handleInitDatabase}
              disabled={initializingDb}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {initializingDb ? "..." : "Réinitialiser BDD"}
            </button>
            <a
              href="/"
              className="text-sm bg-water-light text-water-dark hover:bg-water-main hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
              Voir carte
            </a>
            <button
              onClick={handleLogout}
              className="hidden md:block text-red-600 hover:text-red-700 px-3 py-1.5"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pinpoints")}
              className={`flex-1 min-w-[120px] px-4 py-4 font-medium text-sm transition-colors relative ${
                activeTab === "pinpoints"
                  ? "text-water-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Points
              {activeTab === "pinpoints" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-water-dark" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("sounds")}
              className={`flex-1 min-w-[120px] px-4 py-4 font-medium text-sm transition-colors relative ${
                activeTab === "sounds"
                  ? "text-water-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sons
              {activeTab === "sounds" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-water-dark" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 min-w-[120px] px-4 py-4 font-medium text-sm transition-colors relative ${
                activeTab === "config"
                  ? "text-water-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Configuration
              {activeTab === "config" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-water-dark" />
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "pinpoints" && (
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
                        onClick={handleSavePinpoint}
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
                              confirmDelete(pinpoint.id, "pinpoint")
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
            )}

            {activeTab === "sounds" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Gérer les sons
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Télécharger un nouveau son
                  </label>
                  <input
                    ref={fileInputRef}
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
                    Formats acceptés: MP3, WAV, OGG, etc. Max 4.5MB.
                  </p>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Téléchargez un fichier audio ci-dessus</li>
                    <li>
                      Copiez l&apos;URL grâce au bouton associé ou notez
                      l&apos;ID
                    </li>
                    <li>
                      Utilisez /api/sounds?id=ID dans le champ &quot;URL du
                      son&quot; d&apos;un point
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      Sons disponibles
                    </h3>
                    <span className="text-xs text-gray-500">
                      {sounds.length} fichier(s)
                    </span>
                  </div>
                  {sounds.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="text-4xl mb-2">🎵</div>
                      <p className="text-gray-500">La sonothèque est vide.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Téléversez un fichier audio pour commencer.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {sounds.map((sound) => (
                        <div
                          key={sound.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:shadow-sm transition-all gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017c0-.568.085-1.122.245-1.646.218-.714.757-1.3 1.455-1.562l10.04-2.868a.75.75 0 01.912.693z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 break-all">
                                {sound.filename}
                              </p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                ID:{" "}
                                <span className="bg-gray-100 px-1 rounded text-gray-600">
                                  {sound.id}
                                </span>{" "}
                                • {(sound.size / 1024).toFixed(1)} Ko
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => togglePlaySound(sound.id)}
                              className={`flex-1 sm:flex-none w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                playingSoundId === sound.id
                                  ? "bg-water-main text-white hover:bg-water-dark"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              title={playingSoundId === sound.id ? "Arrêter" : "Écouter"}
                            >
                              {playingSoundId === sound.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => copySoundUrl(sound.id, e)}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              Copier URL
                            </button>
                            <button
                              onClick={() => confirmDelete(sound.id, "sound")}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer le son"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "config" && (
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
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            center_lat: parseFloat(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            center_lng: parseFloat(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            zoom_level: parseInt(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            min_zoom: parseInt(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            max_zoom: parseInt(e.target.value),
                          })
                        }
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
