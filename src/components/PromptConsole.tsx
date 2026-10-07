import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Send,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
  ShoppingBag,
  Maximize
} from 'lucide-react';
import { PRESET_INSTRUCTIONS } from '../data/presets';
import { PresetInstruction } from '../types';

interface PromptConsoleProps {
  instruction: string;
  onChangeInstruction: (text: string) => void;
  onSubmit: (promptToUse?: string) => void;
  isProcessing: boolean;
  aspectRatio: string;
  onChangeAspectRatio: (ratio: string) => void;
  imageSize: string;
  onChangeImageSize: (size: string) => void;
  editOnTopCurrent: boolean;
  onToggleEditOnTop: (val: boolean) => void;
  hasPreviousEdit: boolean;
}

export const PromptConsole: React.FC<PromptConsoleProps> = ({
  instruction,
  onChangeInstruction,
  onSubmit,
  isProcessing,
  aspectRatio,
  onChangeAspectRatio,
  imageSize,
  onChangeImageSize,
  editOnTopCurrent,
  onToggleEditOnTop,
  hasPreviousEdit,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'background' | 'cleanup' | 'scene' | 'lighting'>('all');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const filteredPresets = PRESET_INSTRUCTIONS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleApplyPreset = (preset: PresetInstruction) => {
    onChangeInstruction(preset.prompt);
  };

  const handleEnhancePrompt = async () => {
    if (!instruction.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: instruction }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        onChangeInstruction(data.enhancedPrompt);
      }
    } catch (e) {
      console.error('Enhance failed:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isProcessing) return;
    onSubmit(instruction);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Category Filter Chips for Quick Instructions */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          {(['all', 'background', 'cleanup', 'scene', 'lighting'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Settings</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Preset Chips Quick Grid */}
      <div className="flex flex-wrap gap-1.5 mb-4 max-h-24 overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = instruction.trim() === preset.prompt.trim();
          return (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              type="button"
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 group ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span className="text-cyan-400 group-hover:scale-110 transition-transform">✦</span>
              <span>{preset.shortLabel}</span>
              {preset.badge && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Instruction Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={instruction}
            onChange={(e) => onChangeInstruction(e.target.value)}
            disabled={isProcessing}
            rows={3}
            placeholder="Type instructions to clean up or transform this photo... (e.g. 'Remove the background and place on pure studio white with soft contact shadow', or 'Erase cables and coffee stains on the desk')"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-500 transition-all resize-none shadow-inner"
          />

          {/* Quick Clear and AI Enhance Buttons inside textarea */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            {instruction && (
              <button
                type="button"
                onClick={() => onChangeInstruction('')}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                title="Clear instruction"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !instruction.trim() || isProcessing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 hover:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Enhance instruction using Gemini with professional studio terminology"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
              <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Settings (Aspect ratio, Resolution, Multi-turn target) */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => onChangeAspectRatio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="1:1">1:1 Square (Shopify / Instagram)</option>
                <option value="4:3">4:3 Product Catalog</option>
                <option value="3:4">3:4 Portrait Showcase</option>
                <option value="16:9">16:9 Landscape Banner</option>
                <option value="9:16">9:16 Vertical Story / Reel</option>
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Resolution</label>
              <select
                value={imageSize}
                onChange={(e) => onChangeImageSize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="1K">1K Standard (Fast & High Quality)</option>
                <option value="2K">2K Ultra HD (Print & Zoom)</option>
                <option value="512px">512px Draft (Rapid Preview)</option>
              </select>
            </div>

            {/* Sequential Edit Choice */}
            {hasPreviousEdit && (
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Edit Base</label>
                <div className="flex items-center gap-2 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="editBase"
                      checked={editOnTopCurrent}
                      onChange={() => onToggleEditOnTop(true)}
                      className="accent-cyan-400"
                    />
                    <span>Refine Current</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="editBase"
                      checked={!editOnTopCurrent}
                      onChange={() => onToggleEditOnTop(false)}
                      className="accent-cyan-400"
                    />
                    <span>From Original</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Type any command: remove backgrounds, erase cables, add pedestals, fix lighting</span>
          </div>

          <button
            type="submit"
            disabled={!instruction.trim() || isProcessing}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Cleaning Photo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>Clean & Transform Photo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
