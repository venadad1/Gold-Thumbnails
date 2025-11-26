import React from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { openApiKeySelector } from '../services/geminiService';

interface ApiKeyBannerProps {
  hasKey: boolean;
  onKeySelected: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ hasKey, onKeySelected }) => {
  if (hasKey) return null;

  const handleSelectKey = async () => {
    try {
      await openApiKeySelector();
      // Optimistically assume success as per guidelines
      onKeySelected(); 
    } catch (error) {
      console.error("Failed to select key", error);
    }
  };

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-500">
          <Key className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">API Key Required</h3>
          <p className="text-zinc-400 text-sm max-w-xl">
            To generate high-quality thumbnails with Gemini 3 Pro Image Preview, you need to select a billing-enabled project.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-yellow-500 hover:underline flex items-center gap-1 mt-1"
          >
            Learn about billing <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
      <button
        onClick={handleSelectKey}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-yellow-500/20 whitespace-nowrap"
      >
        Select API Key
      </button>
    </div>
  );
};