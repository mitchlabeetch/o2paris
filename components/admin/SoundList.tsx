'use client';

import { useState, useRef, useEffect } from 'react';
import type { Sound } from '@/lib/db';

interface SoundListProps {
  sounds: Sound[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: number) => void;
  onCopyUrl: (id: number, e: React.MouseEvent) => void;
}

export default function SoundList({ sounds, onUpload, onDelete, onCopyUrl }: SoundListProps) {
  const [playingSoundId, setPlayingSoundId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingSoundId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(`/api/sounds?id=${soundId}`);
      audio.onended = () => setPlayingSoundId(null);
      audio.onerror = () => {
        // Handle error if needed (parent handles toasts usually)
        setPlayingSoundId(null);
      };

      audioRef.current = audio;
      audio.play().catch(err => {
        console.error("Play error:", err);
        setPlayingSoundId(null);
      });
      setPlayingSoundId(soundId);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
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
          onChange={handleFileChange}
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
                    onClick={(e) => onCopyUrl(sound.id, e)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Copier URL
                  </button>
                  <button
                    onClick={() => onDelete(sound.id)}
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
  );
}
