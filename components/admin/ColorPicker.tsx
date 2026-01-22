'use client';

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800",
  "#ff5722", "#795548", "#607d8b", "#000000", "#ffffff"
];

export default function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <div className="relative">
            <button
            type="button"
            className="w-10 h-10 rounded border border-gray-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={`Choisir la couleur pour ${label}`}
            />
            {isOpen && (
            <div className="absolute top-12 left-0 z-50 flex flex-col gap-3 p-3 bg-white rounded-lg shadow-xl border border-gray-200" ref={popover}>
                <HexColorPicker color={color} onChange={onChange} />
                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100">
                {PRESET_COLORS.map((preset) => (
                    <button
                    key={preset}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset }}
                    onClick={() => onChange(preset)}
                    title={preset}
                    />
                ))}
                </div>
            </div>
            )}
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="water-input flex-1 uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
