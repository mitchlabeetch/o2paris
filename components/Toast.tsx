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
