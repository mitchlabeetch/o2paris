'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminTileProps {
  id: number;
  title: string;
  image_url: string;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTile({ id, title, image_url, onEdit, onDelete }: AdminTileProps) {
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
