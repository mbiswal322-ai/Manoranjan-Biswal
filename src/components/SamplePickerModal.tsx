import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/samples';
import { SampleProduct } from '../types';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleProduct) => void;
  currentSampleId?: string;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  currentSampleId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Realistic Product Photo Test Samples</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a messy product photo to test background removal and cleanup in one click
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_PRODUCTS.map((sample) => {
            const isSelected = sample.id === currentSampleId;
            return (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample);
                  onClose();
                }}
                className={`group relative rounded-xl border p-3 flex gap-3.5 cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={sample.imagePath}
                    alt={sample.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950/80 text-amber-300 border border-amber-500/30">
                    Messy Scene
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                        {sample.category}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-700/60">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                      {sample.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Try with recommended cleanup prompt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>You can also upload your own images anytime via drag & drop or the Upload button.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
