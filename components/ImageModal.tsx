import React from 'react';
import { GeneratedImage } from '../types';
import { X, Download, RefreshCw } from 'lucide-react';

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRemix: (prompt: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onRemix }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `mood-canvas-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative z-50 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        <div className="relative group rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
            <img 
                src={image.url} 
                alt={image.prompt} 
                className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
        </div>

        <div className="mt-6 flex gap-4">
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
                <Download className="w-5 h-5" />
                다운로드
            </button>
            <button
                onClick={() => {
                    onRemix(image.prompt);
                    onClose();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
                <RefreshCw className="w-5 h-5" />
                Remix (비슷하게 만들기)
            </button>
        </div>
        
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
        >
            <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;