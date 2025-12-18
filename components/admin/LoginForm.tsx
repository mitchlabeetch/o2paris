'use client';

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-water-light to-water-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-water-dark mb-6 text-center">
          Administration O2Paris
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
