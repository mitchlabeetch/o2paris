/**
 * FICHIER : app/not-found.tsx
 * RÔLE : Page 404 personnalisée (page introuvable).
 * Affichage : Fond dégradé bleu, emoji goutte animée, lien retour.
 * Auto-activé : Next.js appelle ce composant pour toutes les routes 404.
 * Style : Cohérent avec le thème "eau" du site.
 * CTA : Bouton "Retourner à la carte" (href="/").
 * _____________________________________________________________________________
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100">
        <div className="text-8xl mb-4 animate-bounce">💧</div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">404 - Page Introuvable</h2>
        <p className="text-blue-700 mb-6">
          Il semble que cette source soit tarie. La page que vous cherchez n&apos;existe pas.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
        >
          Retourner à la carte
        </a>
      </div>
    </div>
  );
}
