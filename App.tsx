
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyBanner } from './components/ApiKeyBanner';
import { STYLE_OPTIONS, getIconComponent, POPULAR_FONTS, TEXT_COLORS, POSITION_GRID } from './constants';
import { ThumbnailStyle, ThumbnailQuality, TextOverlayConfig } from './types';
import { checkApiKey, generateThumbnail } from './services/geminiService';
import { Upload, Image as ImageIcon, Loader2, Download, RefreshCw, Wand2, Sparkles, Zap, Crown, Type, Bold, Italic, Eye, X } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>(ThumbnailStyle.REALISTIC);
  const [quality, setQuality] = useState<ThumbnailQuality>(ThumbnailQuality.STANDARD);
  const [prompt, setPrompt] = useState('');
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  
  // Text Overlay State
  const [textConfig, setTextConfig] = useState<TextOverlayConfig>({
    text: '',
    fontFamily: 'Roboto',
    fontSize: 120,
    color: '#FFFFFF',
    position: 'bottom-center',
    isBold: true,
    isItalic: false
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  // Update canvas whenever image or text config changes
  useEffect(() => {
    drawCanvas();
  }, [generatedImage, textConfig]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to standard 16:9 HD
    canvas.width = 1280;
    canvas.height = 720;

    // 1. Draw Background (Image or Placeholder)
    if (generatedImage) {
      const img = new Image();
      img.src = generatedImage;
      img.onload = () => {
        // Draw image keeping aspect ratio (cover)
        ctx.drawImage(img, 0, 0, 1280, 720);
        drawText(ctx);
      };
    } else {
      // Placeholder background
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.fillRect(0, 0, 1280, 720);
      
      // Draw grid pattern
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1280; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 720);
        ctx.stroke();
      }
      for (let i = 0; i < 720; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1280, i);
        ctx.stroke();
      }
      
      // Draw Placeholder Text
      if (!isGenerating) {
        ctx.fillStyle = '#52525b';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Preview Area", 640, 360);
      }
      
      // We still draw user overlay text on top of placeholder for preview
      drawText(ctx);
    }
  };

  const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    if (!textConfig.text.trim()) return;

    const { text, fontFamily, fontSize, color, position, isBold, isItalic } = textConfig;

    // Font Configuration
    const fontStyle = isItalic ? 'italic' : 'normal';
    const fontWeight = isBold ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;

    const paddingX = 60;
    const paddingY = 60;
    const maxWidth = 1280 - (paddingX * 2);

    // Calculate lines
    const lines = getLines(ctx, text, maxWidth);
    const lineHeight = fontSize * 1.1; // 1.1 Line height
    const totalHeight = lines.length * lineHeight;

    // Calculate Start Position
    let x = 640;
    let startY = 360; // Default center
    let textAlign: CanvasTextAlign = 'center';

    // Horizontal Alignment
    if (position.includes('left')) {
      x = paddingX;
      textAlign = 'left';
    } else if (position.includes('right')) {
      x = 1280 - paddingX;
      textAlign = 'right';
    }

    // Vertical Alignment Calculation
    // We calculate the Y for the FIRST line based on the total block height
    if (position.includes('top')) {
      startY = paddingY + (fontSize * 0.8); // Offset slightly for ascent
    } else if (position.includes('bottom')) {
      // Bottom y - height of all lines except the last one's extra space + ascent correction
      startY = 720 - paddingY - totalHeight + (fontSize * 0.8); 
    } else {
      // Middle
      startY = (720 - totalHeight) / 2 + (fontSize * 0.8);
    }

    // Draw Config
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize * 0.15; // Scale stroke with font size
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'alphabetic'; // Standard baseline

    // Draw Each Line
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.strokeText(line, x, lineY);
      ctx.fillStyle = color;
      ctx.fillText(line, x, lineY);
    });
  };

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
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
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
        
        {quality === ThumbnailQuality.PRO && <ApiKeyBanner hasKey={hasKey} onKeySelected={() => setHasKey(true)} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: CONTROLS */}
          <div className="space-y-8">
            
            {/* 1. Quality Selection */}
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
                  <p className="text-xs text-zinc-400">Fast generation. Free to use.</p>
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
                  <p className="text-xs text-zinc-400">2K Resolution. Requires API Key.</p>
                </button>
              </div>
            </section>

            {/* 2. Style Selection */}
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
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Character Upload */}
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
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                {characterImage ? (
                  <>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
                      <img src={characterImage} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Character Image Loaded</p>
                      <p className="text-zinc-500 text-xs mt-1">Click to change</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-400"
                    >
                       <RefreshCw className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-300 text-sm font-medium">Click to upload</p>
                  </div>
                )}
              </div>
            </section>

             {/* 4. Text Overlay */}
             <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">4</span>
                Text Overlay <span className="text-zinc-500 text-sm font-normal ml-auto">(Post-process)</span>
              </h2>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                
                {/* Text Input */}
                <div>
                   <label className="text-xs text-zinc-400 font-semibold uppercase mb-1 block">Text Content</label>
                   <input 
                    type="text" 
                    value={textConfig.text}
                    onChange={(e) => setTextConfig({...textConfig, text: e.target.value})}
                    placeholder="E.g. EPIC WIN!"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                   />
                </div>

                {/* Font & Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase mb-1 block">Font</label>
                    <div className="relative">
                      <select 
                        value={textConfig.fontFamily}
                        onChange={(e) => setTextConfig({...textConfig, fontFamily: e.target.value})}
                        className="w-full appearance-none bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none cursor-pointer"
                        style={{ fontFamily: textConfig.fontFamily }}
                      >
                        {POPULAR_FONTS.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </select>
                      <Type className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                   <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase mb-1 block">Style</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setTextConfig({...textConfig, isBold: !textConfig.isBold})}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors ${textConfig.isBold ? 'bg-zinc-800 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => setTextConfig({...textConfig, isItalic: !textConfig.isItalic})}
                         className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors ${textConfig.isItalic ? 'bg-zinc-800 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Font Size Slider */}
                <div>
                   <label className="text-xs text-zinc-400 font-semibold uppercase mb-2 flex justify-between">
                     <span>Font Size</span>
                     <span className="text-yellow-500">{textConfig.fontSize}px</span>
                   </label>
                   <input 
                     type="range" 
                     min="50" 
                     max="400" 
                     value={textConfig.fontSize} 
                     onChange={(e) => setTextConfig({...textConfig, fontSize: parseInt(e.target.value)})}
                     className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                   />
                </div>

                {/* Color & Position */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Colors */}
                   <div>
                      <label className="text-xs text-zinc-400 font-semibold uppercase mb-2 block">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {TEXT_COLORS.map(c => (
                          <button
                            key={c.name}
                            onClick={() => setTextConfig({...textConfig, color: c.value})}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${textConfig.color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          />
                        ))}
                      </div>
                   </div>

                   {/* Position Grid */}
                   <div>
                      <label className="text-xs text-zinc-400 font-semibold uppercase mb-2 block">Position</label>
                      <div className="grid grid-cols-3 gap-1 w-24">
                        {POSITION_GRID.map(pos => (
                          <button
                            key={pos.id}
                            onClick={() => setTextConfig({...textConfig, position: pos.id})}
                            className={`
                              h-6 w-full rounded border transition-colors text-[8px] font-bold
                              ${textConfig.position === pos.id 
                                ? 'bg-yellow-500 text-black border-yellow-600' 
                                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700'}
                            `}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

              </div>
            </section>

            {/* 5. Prompt Input */}
            <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">5</span>
                Description
              </h2>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 focus-within:border-yellow-500/50 transition-colors">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your thumbnail... e.g. 'Shocked face reacting to a giant explosion'"
                  className="w-full bg-transparent text-white placeholder-zinc-600 resize-none h-24 focus:outline-none text-lg"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all w-full justify-center
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
               <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs text-yellow-500 font-bold border border-zinc-700">6</span>
              Result
            </h2>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 relative group shadow-2xl">
              
              {/* Canvas is always rendered but hidden/shown based on state logic if needed, 
                  but here we use it as the main display */}
              <canvas 
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              {isGenerating && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm z-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-4 text-zinc-400 text-sm animate-pulse">Creating masterpiece...</p>
                 </div>
              )}

              {/* Overlay Actions */}
              {(generatedImage || textConfig.text) && !isGenerating && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm z-10">
                   <button 
                    onClick={downloadImage}
                    title="Download"
                    className="bg-white text-black p-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                   >
                     <Download className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => setIsViewing(true)}
                    title="View Fullscreen"
                    className="bg-zinc-800 text-white p-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors border border-zinc-700"
                   >
                     <Eye className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={handleGenerate}
                    title="Regenerate"
                    className="bg-zinc-800 text-white p-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors border border-zinc-700"
                   >
                     <RefreshCw className="w-5 h-5" />
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
                 <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Elements</p>
                 <p className="text-white font-mono text-sm mt-1">{textConfig.text ? 'Image + Text' : 'Image Only'}</p>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Fullscreen Viewer Modal */}
      {isViewing && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
           <button 
             onClick={() => setIsViewing(false)}
             className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2"
           >
             <X className="w-8 h-8" />
           </button>
           
           <div className="max-w-[95vw] max-h-[85vh]">
              {/* Reuse canvas image data for display */}
              <img 
                src={canvasRef.current?.toDataURL()} 
                alt="Full View" 
                className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border border-zinc-800"
              />
           </div>
           
           <div className="mt-8 flex gap-4">
             <button 
                onClick={downloadImage}
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400"
               >
                 <Download className="w-4 h-4" /> Download
             </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
