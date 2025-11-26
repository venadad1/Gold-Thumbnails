import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Sparkles className="text-zinc-900 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Gold Thumbnails
            </h1>
            <p className="text-xs text-yellow-500 font-medium tracking-wider uppercase">
              AI YouTube Architect
            </p>
          </div>
        </div>
        <div className="hidden md:block">
           <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
             Powered by Google Gemini
           </span>
        </div>
      </div>
    </header>
  );
};