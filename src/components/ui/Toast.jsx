import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useAppContext();

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8">
      <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
        <CheckCircle size={18} className="text-green-400" />
        <span className="text-sm font-bold">{toast}</span>
      </div>
    </div>
  );
}
