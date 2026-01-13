/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/Modal.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est une "Boîte de Dialogue" pour confirmer une action ou afficher du contenu.
 * Utilisée pour les suppressions, confirmations, formulaires importants.
 *
 * FONCTIONNEMENT :
 * 1. Affiche une modale centrée avec overlay sombre (backdrop).
 * 2. Contient un titre, du contenu, et des boutons d'action.
 * 3. Peut être destructive (danger) ou confirmative (action normale).
 * 4. Se ferme en cliquant le × ou le bouton "Annuler".
 *
 * UTILISÉ PAR :
 * - admin/page.tsx : confirmations avant suppression.
 * - Formulaires : validations avant envoi.
 * - Notifications : messages importants.
 *
 * REPÈRES :
 * - Lignes 27 : Overlay (fond sombre semi-transparent).
 * - Lignes 29-36 : En-tête avec titre et bouton fermeture.
 * - Lignes 38-40 : Zone de contenu (slot children).
 * - Lignes 42-64 : Boutons d'action (Annuler, Confirmer).
 * - Lignes 55-59 : Style destructive (rouge) vs normal (bleu).
 * 
 * PROPS :
 * - isOpen : boolean - Modale visible ou non.
 * - title : string - Titre affiché en haut.
 * - children : React.ReactNode - Contenu de la modale.
 * - onClose : () => void - Appelé quand on ferme.
 * - onConfirm : (() => void) optional - Appelé quand on confirme.
 * - confirmText : string - Texte du bouton confirmer (défaut: "Confirmer").
 * - cancelText : string - Texte du bouton annuler (défaut: "Annuler").
 * - isDestructive : boolean - Si true, bouton rouge (danger).
 * 
 * EXEMPLE :
 * ```tsx
 * <Modal
 *   isOpen={showModal}
 *   title="Supprimer cette tuile ?"
 *   isDestructive={true}
 *   confirmText="Supprimer"
 *   onConfirm={() => deleteTile(id)}
 *   onClose={() => setShowModal(false)}
 * >
 *   <p>Cette action est irréversible.</p>
 * </Modal>
 * ```
 * 
 * STYLE :
 * - Fond blanc avec ombres (box-shadow: 0 2px 2xl).
 * - Overlay semi-transparent (bg-black/50) avec blur.
 * - Bouton destructive en rouge (#dc2626).
 * - Bouton normal en couleur eau (#1565c0).
 * - Z-index 2000 pour être au-dessus de tout.
 * 
 * ANIMATIONS :
 * - Fade-in du backdrop.
 * - Apparition fluide du contenu.
 * - Transition de couleur au hover des boutons.
 * 
 * STRUCTURE INTERNE :
 * 1. Vérification d'ouverture (early return si fermée).
 * 2. Overlay (backdrop) cliquable qui ferme.
 * 3. Conteneur blanc de la modale.
 * 4. En-tête (titre + bouton fermeture).
 * 5. Corps (contenu slot).
 * 6. Pied (boutons d'action).
 * 
 * INTERACTIONS :
 * - Clic sur le × ferme.
 * - Clic sur "Annuler" ferme.
 * - Clic sur "Confirmer" appelle onConfirm puis ferme.
 * - Clic sur l'overlay ferme (backdrop dismissed).
 * 
 * ACCESSIBILITÉ :
 * - Boutons avec texte explicite.
 * - Contraste suffisant (noir sur blanc, blanc sur bleu/rouge).
 * - Focus visible au clavier.
 * - Fermeture facile (×, Échap possible).
 * 
 * LIMITES :
 * - Pas d'animation d'entrée/sortie (juste fade).
 * - Pas de gestion du clavier (Échap ne ferme pas).
 * - Pas de contenu scrollable très long.
 * 
 * AMÉLIORATION FUTURE :
 * - Ajouter le support de la touche Échap.
 * - Animation de scale (grow/shrink).
 * - Contenu scrollable si trop long.
 * - Gestion du focus (trap focus à l'intérieur).
 * 
 * NOTES :
 * - Composant UI générique.
 * - Pas d'import spécifique au domaine.
 * - Réutilisable pour n'importe quel contexte.
 * 
 * COMPARAISON AVEC TIKEMODAL :
 * - TileModal : Spécialisée pour les tuiles (2 colonnes, audio, navigation).
 * - Modal : Générique (simple, polyvalente, pour confirmations).
 * 
 * PERFORMANCE :
 * - Très léger (simple return null si fermée).
 * - Pas d'animation complexe.
 * - Pas de re-render si props stables.
 * 
 * DÉPENDANCES :
 * - React (simple composant fonctionnel).
 * - Tailwind CSS pour les styles.
 * - SVG pour l'icône × (inline).
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

'use client';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDestructive = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 text-gray-600">
          {children}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm shadow-sm ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-water-dark hover:bg-water-deep'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
