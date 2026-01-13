/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/WaterCurtain.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est l'écran de chargement spectaculaire au démarrage de l'application.
 * Un "rideau d'eau" qui descend avec animation et affiche le titre de l'app.
 *
 * FONCTIONNEMENT :
 * 1. Affiche un overlay qui couvre tout l'écran.
 * 2. Anime une "chute d'eau" dégradée du haut vers le bas.
 * 3. Affiche l'icône de l'app (emoji goutte par défaut).
 * 4. Affiche le titre de l'app (de la config).
 * 5. Disparaît après 2 secondes (buffer 2.2s pour l'animation).
 * 6. À la disparition, le contenu principal devient visible.
 *
 * UTILISÉ PAR :
 * - app/layout.tsx : Au chargement initial de chaque page.
 * - Créé dynamiquement à chaque refresh.
 *
 * REPÈRES :
 * - Lignes 20-25 : Chargement asynchrone de la configuration.
 * - Lignes 27-29 : Timer de disparition (2.2 secondes).
 * - Lignes 32-39 : Contenu affiché (icône, titre, sous-titre).
 * - globals.css Lignes 380-534 : Animations CSS (keyframes).
 * 
 * CONFIGURATION DYNAMIQUE :
 * - L'icône vient de config.overlay_icon (par défaut: '💧').
 * - Le titre vient de config.app_title (par défaut: 'O2Paris').
 * - Ces valeurs sont modifiables via l'admin.
 * - Permet une personnalisation sans redéploiement.
 *
 * ANIMATIONS (DÉFINIES DANS GLOBALS.CSS) :
 * - .water-curtain-overlay : Conteneur avec dégradé animé.
 * - waterCurtainDrop : Chute vers le bas (0 à 100% translateY).
 * - waterCurtainGradient : Mouvement du dégradé.
 * - .water-curtain-wave : Vague en bas (SVG animé).
 * - waveMove : Mouvement horizontal de la vague.
 * - .water-curtain-droplet : Gouttelettes qui flottent.
 * - dropletBounce : Rebond des gouttelettes.
 * 
 * DURÉE TOTALE :
 * - Animation CSS : 2 secondes (voir globals.css).
 * - Timer de disparition : 2.2 secondes (buffer de 200ms).
 * - Buffer nécessaire car React met du temps à re-render.
 * 
 * STYLE VISUEL :
 * - Dégradé eau : du bleu très foncé (#0D47A1) au clair (#E3F2FD).
 * - Icône : 6xl (gros emoji).
 * - Titre : blanc, bold, 2xl, tracking-wider.
 * - Sous-titre : blanc semi-transparent, uppercase, petit.
 * - Z-index 9999 : Au-dessus de tout.
 * 
 * GESTION DU CYCLE DE VIE :
 * - useState(true) : Commence visible.
 * - useEffect : Au montage, fetch config et lance le timer.
 * - Cleanup : clearTimeout quand le composant démonté.
 * - Early return : Si show=false, retourne null (unmount).
 * 
 * DONNÉES CHARGÉES :
 * - Pour éviter un écran blanc, les valeurs par défaut sont définies au state.
 * - Après le fetch, elles peuvent être remplacées par la config réelle.
 * - Si le fetch échoue, les valeurs par défaut restent.
 * 
 * FLUXDE RENDU :
 * 1. Composant monte, show=true (WaterCurtain visible).
 * 2. useEffect lance fetch et le timer.
 * 3. Après 2.2s, setShow(false) est appelé.
 * 4. Re-render : early return null (composant disparu).
 * 5. Le contenu principal devient visible (pas de Z-index au-dessus).
 * 
 * INTÉGRATION DANS L'APP :
 * - Normalement utilisé dans layout.tsx ou page.tsx racine.
 * - Apparaît une seule fois par cycle de vie de l'app.
 * - Sur les navigations suivantes, c'est le client qui gère (pas de WaterCurtain).
 * - Pour le voir à nouveau, faire un refresh complet (F5).
 * 
 * UX/DESIGN :
 * - Effet "wow" au démarrage.
 * - Communique l'identité visuelle (eau).
 * - Donne du temps au chargement du reste (2 secondes).
 * - Transitions fluides (pas de jarring).
 * 
 * LIMITES :
 * - Toujours visible au premier chargement (pas de skip).
 * - Dur-codé 2 secondes (non configurable).
 * - Si le fetch échoue, on voit les valeurs par défaut.
 * 
 * AMÉLIORATION FUTURE :
 * - Permettre de passer (clic sur l'écran).
 * - Durée configurable dans la base de données.
 * - Animations différentes selon le thème de l'app.
 * - Gestion des erreurs de fetch (afficher une variante).
 * 
 * NOTES D'IMPLÉMENTATION :
 * - Le '2200ms' au lieu de '2000ms' est critique pour éviter les sauts.
 * - Tous les styles sont en CSS (globals.css) pour les performances.
 * - Pas de Framer Motion ici (plus simple, performant).
 * 
 * ACCESSIBILITÉ :
 * - Aucun contenu d'action (juste un écran d'attente).
 * - Les utilisateurs peuvent voir le titre de l'app.
 * - Les couleurs ont du contraste.
 * 
 * PERFORMANCE :
 * - Très simple : un conteneur + quelques textes.
 * - Pas de logique complexe.
 * - Le CSS est optimisé (une seule animation).
 * - Le fetch ne bloque pas le rendu.
 * 
 * SÉCURITÉ :
 * - Les données viennent de l'API /api/config.
 * - Les valeurs sont échappées par React (pas de XSS).
 * - L'émoji est juste du texte (safe).
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - app/globals.css : Contient les keyframes et styles.
 * - app/api/config : Fournit les données (overlay_icon, app_title).
 * - lib/db.ts : Définit les types (MapConfig).
 * 
 * COMPARAISON AVEC LOADING.TSX :
 * - WaterCurtain : Au démarrage, spectaculaire, 2 secondes.
 * - Loading : Quand les données se chargent, simple spinner.
 * - Les deux indiquent "attendre" mais à des moments différents.
 * 
 * EXEMPLE D'UTILISATION DANS LAYOUT :
 * ```tsx
 * import WaterCurtain from '@/components/WaterCurtain';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WaterCurtain />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

'use client';

import { useState, useEffect } from 'react';

export default function WaterCurtain() {
  // ---------------------------------------------------------------------------
  // ÉTATS
  // ---------------------------------------------------------------------------
  // show : Contrôle la visibilité du rideau (true initialement, false après 2.2s)
  const [show, setShow] = useState(true);
  
  // config : Données personnalisables depuis l'admin
  const [config, setConfig] = useState<any>({
    overlay_icon: '💧',
    app_title: 'O2Paris',
  });

  // ---------------------------------------------------------------------------
  // EFFET : CHARGEMENT CONFIG & TIMER DE DISPARITION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Chargement asynchrone de la configuration de l'app
    // Cela permet à l'admin de personnaliser l'icône et le titre.
    // Si le fetch échoue, les valeurs par défaut (ci-dessus) restent.
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);

    // Timer de disparition : 2.2 secondes (2s d'animation + 0.2s de buffer)
    // Le buffer est nécessaire pour laisser React terminer le re-render.
    // Sans lui, on verrait un saut visuel (jump) quand le composant disparaît.
    const timer = setTimeout(() => setShow(false), 2200);
    
    // Cleanup : annuler le timer si le composant est démonté avant 2.2s
    // (rare, mais bonne pratique React)
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="water-curtain-overlay">
      <div className="water-curtain-wave" />
      <div className="flex items-center justify-center h-full flex-col">
        <span className="text-6xl water-curtain-droplet">
          {config.overlay_icon || '💧'}
        </span>
        <h2 className="text-white text-2xl font-bold mt-4 tracking-wider text-shadow-water">
          {config.app_title || 'O2Paris'}
        </h2>
        <p className="text-white/80 text-sm mt-2 tracking-widest uppercase">
          Carte Sonore Interactive
        </p>
      </div>
    </div>
  );
}
