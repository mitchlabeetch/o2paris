/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/admin/AdminTileGrid.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est la "Grille Réordonnée" dans l'admin.
 * Affiche les tuiles avec la possibilité de les réordonner par glisser-déposer,
 * ainsi que des boutons d'édition et suppression.
 *
 * FONCTIONNEMENT :
 * 1. Affiche toutes les tuiles en grille.
 * 2. Permet de réorganiser l'ordre en glissant les tuiles.
 * 3. Le nouvel ordre est automatiquement sauvegardé en base.
 * 4. Chaque tuile a des boutons d'édition (✏️) et suppression (🗑️).
 * 5. Utilise la librairie @dnd-kit pour le drag-drop.
 *
 * UTILISÉ PAR :
 * - admin/page.tsx : Onglet "Tuiles" du tableau de bord admin.
 *
 * REPÈRES :
 * - Lignes 16-40 : Composant SortableTile (une tuile individuelle).
 * - Lignes 43-91 : Composant AdminTileGrid (le conteneur principal).
 * - Lignes 65-91 : Gestion du drop et mise à jour de l'ordre.
 * 
 * DÉPENDANCES :
 * - @dnd-kit/core : Framework pour drag & drop.
 * - @dnd-kit/sortable : Plugin de tri.
 * - @dnd-kit/utilities : Utilitaires (CSS transform).
 * 
 * STRUCTURE DU DRAG-DROP :
 * 1. DndContext : Conteneur qui gère les interactions drag.
 * 2. SortableContext : Récipient pour les éléments triables.
 * 3. useSortable : Hook qui rend une tuile traînable.
 * 4. DragEndEvent : Event au relâchement (recalcule l'ordre).
 * 
 * UX DU GLISSER-DÉPOSER :
 * - On clique et on maintient sur une tuile.
 * - Une ombre ou indication visuelle montre la position cible.
 * - En relâchant, la position est sauvegardée.
 * - Visual feedback (cursor: move, opacity change).
 * 
 * SAUVEGARDE DE L'ORDRE :
 * - Dans handleDragEnd, on calcule le nouvel ordre avec arrayMove.
 * - On appelle l'API /api/tiles/reorder avec le nouvel ordre.
 * - Les IDs des tuiles et leur position y sont envoyés.
 * 
 * STRUCTURE D'UNE TUILE :
 * - Image (carrée : aspect-square).
 * - Titre (truncaté à 1-2 lignes).
 * - Boutons d'édition et suppression (icônes emoji).
 * - Indicateur "Drag" au survol de la zone draggable.
 * 
 * ACCESSIBILITÉ :
 * - Support du clavier (KeyboardSensor, sortableKeyboardCoordinates).
 * - Les utilisateurs de clavier peuvent utiliser Entrée/Espace pour drag.
 * - Textes explicites dans les boutons.
 * 
 * LIMITE :
 * - Nécessite une souris ou tactile pour glisser (pas de clavier full-featured).
 * 
 * AMÉLIORATIONS FUTURES :
 * - Ajouter du drag à la portée dans l'admin (sections, catégories).
 * - Permettre multi-select et drag multiple tuiles.
 * - Animations plus lisses lors du drop.
 * - Undo/redo pour l'ordre.
 * 
 * DONNÉES MANAGÉES :
 * - tiles : Array de tuiles avec id, title, image_url.
 * - setTiles : Callback pour mettre à jour l'état des tuiles.
 * - display_order : Champ en base de données qui stocke l'ordre.
 * 
 * PERFORMANCE :
 * - Le composant re-render à chaque changement de tiles.
 * - Pour une app grande, considérer l'optimisation (useMemo, React.memo).
 * - Les animations dnd-kit sont GPU-accelerated (rapides).
 * 
 * SÉCURITÉ :
 * - Les modifications d'ordre vont via l'API (pas de modification locale seule).
 * - Le serveur valide et sauvegarde l'ordre définitif.
 * - Les IDs sont vérifiés côté serveur.
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - admin/page.tsx : Père qui utilise ce composant.
 * - /api/tiles : Récupère les tuiles.
 * - /api/tiles/reorder : Sauvegarde le nouvel ordre.
 * - TileGrid.tsx : Affiche les tuiles en ordre sauvegardé au public.
 * 
 * FLUX DE DONNÉES :
 * 1. Parent (admin/page.tsx) fetch /api/tiles.
 * 2. Passe les données à AdminTileGrid via props.
 * 3. Utilisateur glisse-dépose une tuile.
 * 4. handleDragEnd est appelé.
 * 5. On POST /api/tiles/reorder avec le nouvel ordre.
 * 6. Le serveur met à jour les display_order en base.
 * 7. Le parent rafraîchit les tuiles (loadTiles()).
 * 8. L'interface se met à jour avec le nouvel ordre.
 * 
 * SENSEURS DND :
 * - PointerSensor : Souris et tactile.
 * - KeyboardSensor : Clavier (flèches pour naviguer, Entrée pour drag).
 * 
 * ERREURS POSSIBLES :
 * - TypeError si une tuile n'a pas d'id unique.
 * - Network error si /api/tiles/reorder échoue (afficher une toast).
 * - Race condition si deux drags simultanés (rare, mais possible).
 * 
 * TESTS :
 * - Vérifier que l'ordre change visuellement après drag.
 * - Vérifier que l'ordre persiste après refresh.
 * - Vérifier que les boutons ✏️ et 🗑️ fonctionnent.
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---------------------------------------------------------------------------
// SOUS-COMPOSANT : TUILE TRIABLE
// ---------------------------------------------------------------------------
// Une tuile individuelle qui peut être traînée et contient des boutons.

interface AdminTileProps {
  id: number;
  title: string;
  image_url: string;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTile({ id, title, image_url, onEdit, onDelete }: AdminTileProps) {
  // ---------------------------------------------------------------------------
  // HOOKS DND
  // ---------------------------------------------------------------------------
  // useSortable rend ce composant "draggable".
  // - attributes : Attributs HTML pour rendre le drag n drop (dnd) des tuiles possible.
  // - listeners : Event listeners pour les interactions.
  // - setNodeRef : Ref pour l'élément DOM (dnd-kit en a besoin).
  // - transform : Position transformée (calculée par dnd-kit).
  // - transition : CSS transition (animation fluide lors du drag). Augmente le swag
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white rounded-lg shadow overflow-hidden">
      <div {...attributes} {...listeners} className="aspect-square cursor-move relative">
         <img src={image_url} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">Drag</span>
         </div>
      </div>
      <div className="p-2 flex justify-between items-center bg-gray-50">
        <span className="text-sm font-medium truncate w-24">{title}</span>
        <div className="flex gap-1">
            <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-1">🗑️</button>
        </div>
      </div>
    </div>
  );
}

interface AdminTileGridProps {
  tiles: any[];
  setTiles: (tiles: any[]) => void;
  onEdit: (tile: any) => void;
  onDelete: (id: number) => void;
}

export function AdminTileGrid({ tiles, setTiles, onEdit, onDelete }: AdminTileGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tiles.findIndex((item) => item.id === active.id);
      const newIndex = tiles.findIndex((item) => item.id === over.id);

      const newTiles = arrayMove(tiles, oldIndex, newIndex);
      setTiles(newTiles);

      // Persist order
      await fetch('/api/tiles/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newTiles.map(t => t.id) })
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tiles.map(t => t.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-gray-100 rounded-xl min-h-[200px]">
          {tiles.map((tile) => (
            <SortableTile
                key={tile.id}
                {...tile}
                onEdit={() => onEdit(tile)}
                onDelete={() => onDelete(tile.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
