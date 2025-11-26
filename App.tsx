import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyBanner } from './components/ApiKeyBanner';
import { STYLE_OPTIONS, getIconComponent } from './constants';
import { ThumbnailStyle, ThumbnailQuality } from './types';
import { checkApiKey, generateThumbnail } from './services/geminiService';
import { Upload, Image as ImageIcon, Loader2, Download, RefreshCw, Wand2, Sparkles, Zap, Crown } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>(ThumbnailStyle.REALISTIC);
  const [quality, setQuality] = useState<ThumbnailQuality>(ThumbnailQuality.STANDARD);
  const [prompt, setPrompt] = useState('');
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your thumbnail.");
      return;
    }

    // Key check only required for Pro
    if (quality === ThumbnailQuality.PRO && !hasKey) {
      setError("Pro quality requires you to select a paid API key. Please select one above or switch to Standard quality.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateThumbnail({
        prompt,
        style: selectedStyle,
        quality,
        characterImage: characterImage || undefined
      });
      setGeneratedImage(imageBase64);
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail. Please try again.");
      // If key was invalid, reset key state (simple heuristic)
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `gold-thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-yellow-500/30">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Only show banner if Pro is selected and no key, or if user hasn't selected one yet to encourage it (optional) */}
        {/* We show it if quality is PRO and !hasKey to guide them */}
        {quality === ThumbnailQuality.PRO && <ApiKeyBanner hasKey={hasKey} onKeySelected={() => setHasKey(true)} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: CONTROLS */}
          <div className="space-y-8">
            
            {/* Quality Selection */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">1</span>
                Choose Quality
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setQuality(ThumbnailQuality.STANDARD)}
                  className={`
                    p-4 rounded-xl border flex flex-col gap-2 text-left transition-all relative
                    ${quality === ThumbnailQuality.STANDARD 
                      ? 'bg-yellow-500/10 border-yellow-500 ring-1 ring-yellow-500/50' 
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}
                  `}
                >
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Zap className={`w-5 h-5 ${quality === ThumbnailQuality.STANDARD ? 'text-yellow-500' : 'text-zinc-500'}`} />
                    Standard
                  </div>
                  <p className="text-xs text-zinc-400">Fast generation. Free to use with standard quota.</p>
                  {quality === ThumbnailQuality.STANDARD && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setQuality(ThumbnailQuality.PRO)}
                  className={`
                    p-4 rounded-xl border flex flex-col gap-2 text-left transition-all relative
                    ${quality === ThumbnailQuality.PRO 
                      ? 'bg-yellow-500/10 border-yellow-500 ring-1 ring-yellow-500/50' 
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}
                  `}
                >
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Crown className={`w-5 h-5 ${quality === ThumbnailQuality.PRO ? 'text-yellow-500' : 'text-zinc-500'}`} />
                    Pro (High Res)
                  </div>
                  <p className="text-xs text-zinc-400">2K Resolution. Requires paid API Key.</p>
                  {quality === ThumbnailQuality.PRO && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </section>

            {/* Style Selection */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">2</span>
                Choose Style
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STYLE_OPTIONS.map((option) => {
                  const isSelected = selectedStyle === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedStyle(option.id)}
                      className={`
                        relative group p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 h-28
                        ${isSelected 
                          ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'}
                      `}
                    >
                      <div className={`${isSelected ? 'text-yellow-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        {getIconComponent(option.iconName)}
                      </div>
                      <span className="text-xs font-medium leading-tight">{option.label}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Character Upload */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">3</span>
                Upload Character <span className="text-zinc-500 text-sm font-normal ml-auto">(Optional)</span>
              </h2>
              
              <div 
                onClick={triggerFileInput}
                className={`
                  border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
                  flex items-center justify-center gap-4 relative overflow-hidden
                  ${characterImage 
                    ? 'border-yellow-500/50 bg-zinc-900' 
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                
                {characterImage ? (
                  <>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
                      <img src={characterImage} alt="Uploaded character" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Character Image Loaded</p>
                      <p className="text-zinc-500 text-xs mt-1">Click to change image</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
                    >
                       <RefreshCw className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-300 text-sm font-medium">Click to upload a character photo</p>
                    <p className="text-zinc-600 text-xs mt-1">AI will integrate this person into the thumbnail</p>
                  </div>
                )}
              </div>
            </section>

            {/* Prompt Input */}
            <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">4</span>
                Description
              </h2>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 focus-within:border-yellow-500/50 transition-colors">
                <label className="block text-xs text-yellow-500/80 font-semibold uppercase tracking-wider mb-2">
                  Optimized for 16:9 YouTube Thumbnails
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your thumbnail... e.g. 'Shocked face reacting to a giant explosion in the background, high contrast, bright red arrows'"
                  className="w-full bg-transparent text-white placeholder-zinc-600 resize-none h-32 focus:outline-none text-lg"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-zinc-600 text-xs">Be descriptive for best results.</span>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
                      ${isGenerating
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]'}
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Generate Thumbnail
                      </>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="lg:sticky lg:top-28 h-fit space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
               <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">5</span>
              Result
            </h2>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 relative group">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-cover"
                />
              ) : isGenerating ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-4 text-zinc-400 text-sm animate-pulse">Creating masterpiece...</p>
                 </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/30">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium">No thumbnail generated yet</p>
                </div>
              )}

              {/* Overlay Actions for Generated Image */}
              {generatedImage && !isGenerating && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button 
                    onClick={downloadImage}
                    className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                   >
                     <Download className="w-5 h-5" /> Download
                   </button>
                   <button 
                    onClick={handleGenerate}
                    className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors border border-zinc-700"
                   >
                     <RefreshCw className="w-5 h-5" /> Regenerate
                   </button>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="grid grid-cols-3 gap-4 mt-4">
               <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center">
                 <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Resolution</p>
                 <p className="text-white font-mono text-sm mt-1">
                   {quality === ThumbnailQuality.PRO ? '2K' : '1280x720'}
                 </p>
               </div>
               <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center">
                 <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Ratio</p>
                 <p className="text-white font-mono text-sm mt-1">16:9</p>
               </div>
               <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center">
                 <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Format</p>
                 <p className="text-white font-mono text-sm mt-1">PNG</p>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;