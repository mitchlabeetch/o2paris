/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/Loading.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est l'écran d'attente quand on charge la carte.
 * Un simple spinner avec un message d'encouragement.
 *
 * FONCTIONNEMENT :
 * - Affiche un élément tournant (spinner CSS).
 * - Affiche un message qui clignote.
 * - Remplit toute la hauteur de l'écran.
 *
 * UTILISÉ PAR :
 * - Map.tsx : en attente du client React avant d'afficher la carte Leaflet.
 * - Chaque fois qu'on a besoin d'indiquer un chargement.
 * 
 * REPÈRES :
 * - Lignes 23 : Spinner rotatif.
 * - Lignes 24 : Message animé (pulse).
 * - Lignes 22 : Fond en couleur eau (water-light).
 * -----------------------------------------------------------------------------
 */

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-water-light">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-water-dark"></div>
        <div className="text-water-dark text-xl font-semibold animate-pulse">Chargement de la carte...</div>
      </div>
    </div>
  );
}
