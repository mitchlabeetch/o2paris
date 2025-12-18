"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Pinpoint, MapConfig, Sound } from "@/lib/db";
import { getCookie } from "@/lib/client-utils";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import LoginForm from "@/components/admin/LoginForm";
import PinpointList from "@/components/admin/PinpointList";
import SoundList from "@/components/admin/SoundList";
import ConfigForm from "@/components/admin/ConfigForm";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const [initializingDb, setInitializingDb] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"pinpoint" | "sound" | null>(
    null
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type });
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

  const handleLogin = async (password: string) => {
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

  const handleSavePinpoint = async (pinpoint: Partial<Pinpoint>) => {
    try {
      const method = pinpoint.id ? "PUT" : "POST";
      const response = await fetch("/api/pinpoints", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinpoint),
      });

      if (response.ok) {
        await loadData();
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

  const handleUploadSound = async (file: File) => {
    if (file.size > 4.5 * 1024 * 1024) {
      showToast("Erreur : Le fichier dépasse 4.5MB.", "error");
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
    }
  };

  const handleSaveConfig = async (newConfig: Partial<MapConfig>) => {
    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
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
    return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
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
              <PinpointList
                pinpoints={pinpoints}
                sounds={sounds}
                onSave={handleSavePinpoint}
                onDelete={(id) => confirmDelete(id, "pinpoint")}
              />
            )}

            {activeTab === "sounds" && (
              <SoundList
                sounds={sounds}
                onUpload={handleUploadSound}
                onDelete={(id) => confirmDelete(id, "sound")}
                onCopyUrl={copySoundUrl}
              />
            )}

            {activeTab === "config" && (
              <ConfigForm
                config={config}
                onSave={handleSaveConfig}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
