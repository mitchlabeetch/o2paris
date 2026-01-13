/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/Toast.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est une "Notification Flottante" qui apparaît brièvement en bas à droite.
 * Utilisée pour confirmer une action ou signaler une erreur.
 *
 * FONCTIONNEMENT :
 * 1. Affiche un message temporaire pendant 3 secondes.
 * 2. Disparaît automatiquement ou quand l'utilisateur clique la croix.
 * 3. Trois styles selon le type : success (vert), error (rouge), info (bleu).
 *
 * UTILISÉ PAR :
 * - admin/page.tsx : pour confirmer les changements.
 * - Formulaires : après une sauvegarde ou suppression.
 *
 * REPÈRES :
 * - Lignes 27 : Conteneur fixed en bas à droite.
 * - Lignes 20-24 : Couleurs selon le type.
 * - Lignes 12-18 : Timer automatique (3 secondes).
 * 
 * PROPS :
 * - message : Le texte à afficher.
 * - type : 'success' | 'error' | 'info' (défaut: 'info').
 * - onClose : Fonction appelée quand le toast doit fermer.
 * 
 * EXEMPLE :
 * ```tsx
 * <Toast message="Sauvegardé !" type="success" onClose={() => setShow(false)} />
 * ```
 * 
 * ANIMATIONS :
 * - Apparition/disparition automatique.
 * - Classe 'transition-all duration-300' pour une animation fluide.
 * - Z-index 50 pour rester au-dessus du contenu.
 * 
 * LIMITES :
 * - Affiche un seul toast à la fois (pas de queue).
 * - Durée fixe à 3 secondes (non configurable).
 * 
 * AMÉLIORATION FUTURE :
 * - Ajouter une queue de toasts.
 * - Permettre une durée personnalisable.
 * - Support des toasts en haut/bas, gauche/droite.
 * 
 * SÉCURITÉ :
 * - Le message est échappé par React (XSS safe).
 * - Pas d'injection HTML possible.
 * 
 * ACCESSIBILITÉ :
 * - Le bouton × a un bon contraste.
 * - Largeur et hauteur adéquates pour le clic.
 * 
 * DÉPENDANCES :
 * - React (useState, useEffect).
 * - Tailwind CSS pour les styles.
 * 
 * FICHIER COMPLET :
 * - Simple et minimaliste.
 * - Pas de logique métier.
 * - Réutilisable dans toute l'app.
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - Aucune dépendance spécifique au domaine.
 * - Composant générique UI (comme Modal).
 * 
 * PERFORMANCE :
 * - Très léger : quelques lignes seulement.
 * - Pas d'effet de bord (cleanup du timer en retour).
 * 
 * NOTES :
 * - Très courant dans les apps modernes.
 * - Pattern aussi appelé "snackbar" (Material Design).
 * - Ne bloque pas l'interaction utilisateur.
 * 
 * EXEMPLE COMPLET D'UTILISATION :
 * ```tsx
 * const [toast, setToast] = useState<{msg: string; type: 'success'|'error'} | null>(null);
 * 
 * return (
 *   <>
 *     <button onClick={() => setToast({msg: "Succès!", type: "success"})}>
 *       Tester Toast
 *     </button>
 *     {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
 *   </>
 * );
 * ```
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border flex items-center shadow-lg transition-all transform duration-300 ease-in-out ${bgColors[type]}`}>
      <span className="mr-2">{message}</span>
      <button onClick={onClose} className="ml-2 font-bold focus:outline-none">
        ×
      </button>
    </div>
  );
}
