import React from 'react';
import { Sparkles, Upload, Image as ImageIcon, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onOpenSamplePicker: () => void;
  onTriggerUpload: () => void;
  hasApiKey: boolean;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onSelectModel,
  onOpenSamplePicker,
  onTriggerUpload,
  hasApiKey,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-slate-950 font-black shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50">
            <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                CleanCut <span className="text-cyan-400 font-semibold text-sm px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">AI STUDIO</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Background removal & product cleanup by typing instructions
            </p>
          </div>
        </div>

        {/* Center / Model Info */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              disabled={isProcessing}
              className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.1-flash-image-preview" className="bg-slate-900 text-slate-200">
                gemini-3.1-flash-image-preview (Recommended)
              </option>
              <option value="gemini-3.1-flash-image" className="bg-slate-900 text-slate-200">
                gemini-3.1-flash-image
              </option>
              <option value="gemini-3.1-flash-lite-image" className="bg-slate-900 text-slate-200">
                gemini-3.1-flash-lite-image (Fast)
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {hasApiKey ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3" />
                API Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                <AlertCircle className="w-3 h-3" />
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSamplePicker}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-cyan-500/40 active:scale-95"
            title="Try with realistic messy product photos"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Sample Products</span>
          </button>

          <button
            onClick={onTriggerUpload}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
