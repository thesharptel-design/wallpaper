import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GeneratedImage, AppState } from './types';
import { getApiKey } from './services/storageService';
import { generateWallpapers } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    // Initial load check
    const storedKey = getApiKey();
    setApiKey(storedKey);
    // If no key, prompt user
    if (!storedKey) {
        setIsSettingsOpen(true);
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (!prompt.trim()) return;

    setAppState(AppState.GENERATING);
    setImages([]); // Clear previous images or keep them? Let's clear for new context

    try {
      const imageUrls = await generateWallpapers(apiKey, prompt);
      
      if (imageUrls.length === 0) {
        throw new Error("No images generated");
      }

      const newImages: GeneratedImage[] = imageUrls.map((url) => ({
        id: Math.random().toString(36).substring(7),
        url,
        prompt,
        createdAt: Date.now(),
      }));

      setImages(newImages);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error("Generation failed:", error);
      setAppState(AppState.ERROR);
    }
  };

  const handleRemix = (remixPrompt: string) => {
    setPrompt(remixPrompt);
    // Scroll to top to show input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Mood Canvas</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-full transition-colors ${!apiKey ? 'animate-pulse text-indigo-400 bg-indigo-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="API 설정"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 pb-24">
        
        {/* Hero & Input Section */}
        <section className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 animate-gradient-x">
            오늘의 기분은 어떤가요?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            원하는 분위기나 풍경을 묘사해주세요. <br className="hidden md:block"/>
            AI가 당신의 폰을 위한 완벽한 9:16 배경화면 4가지를 그려드립니다.
          </p>

          <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mt-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 shadow-2xl">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 비 오는 보라색 톤의 사이버펑크 도시, 감성적인 느낌"
                className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder-slate-500 text-lg"
                disabled={appState === AppState.GENERATING}
              />
              <button
                type="submit"
                disabled={appState === AppState.GENERATING || !prompt.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2 min-w-[100px] justify-center"
              >
                {appState === AppState.GENERATING ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span className="hidden sm:inline">생성하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          {!apiKey && (
            <p className="text-sm text-indigo-400 mt-2">
              * 시작하려면 우측 상단 톱니바퀴를 눌러 API 키를 설정해주세요.
            </p>
          )}
        </section>

        {/* Results Grid */}
        <section>
          {appState === AppState.ERROR && (
             <div className="text-center p-12 border border-red-900/50 bg-red-900/10 rounded-2xl">
                <p className="text-red-400 text-lg font-medium">이미지 생성 중 오류가 발생했습니다.</p>
                <p className="text-slate-500 mt-2">API 키 상태를 확인하거나 잠시 후 다시 시도해주세요.</p>
             </div>
          )}

          {appState === AppState.SUCCESS && images.length > 0 && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
               {images.map((img, index) => (
                 <div 
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all shadow-md hover:shadow-xl hover:shadow-indigo-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                 >
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                       <p className="text-white text-sm font-medium flex items-center gap-2">
                         <ImageIcon className="w-4 h-4" /> 크게 보기
                       </p>
                    </div>
                 </div>
               ))}
             </div>
          )}
          
          {appState === AppState.IDLE && images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">상상하는 풍경을 입력해보세요</p>
                <p className="text-sm opacity-70">9:16 비율의 멋진 배경화면이 생성됩니다</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={(key) => setApiKey(key)}
      />
      
      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)}
        onRemix={handleRemix}
      />
    </div>
  );
};

export default App;