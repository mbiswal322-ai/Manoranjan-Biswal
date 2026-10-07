import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { fileToDataUrl } from '../utils/imageUtils';

interface UploadDropzoneProps {
  onImageSelected: (dataUrl: string, filename?: string) => void;
  onOpenSamplePicker: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onImageSelected,
  onOpenSamplePicker,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const dataUrl = await fileToDataUrl(file);
              onImageSelected(dataUrl, 'pasted-image.png');
            } catch (err) {
              setError('Failed to read image from clipboard');
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onImageSelected(dataUrl, file.name);
    } catch (err) {
      setError('Failed to read file. Please try another image.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
          : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/70'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          Drop your product photo here or <span className="text-cyan-400 underline decoration-cyan-400/50 underline-offset-4">browse</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Supports PNG, JPG, WEBP. You can also press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">Ctrl+V</kbd> to paste from clipboard.
        </p>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 w-full flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSamplePicker();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Or try ready-to-test messy product samples</span>
          </button>
        </div>
      </div>
    </div>
  );
};
