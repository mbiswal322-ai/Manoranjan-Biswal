import React from 'react';
import { History, ArrowLeft, Download, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { EditStep } from '../types';
import { downloadImage } from '../utils/imageUtils';

interface HistoryTimelineProps {
  steps: EditStep[];
  currentStepId: string | null;
  originalImage: string;
  onSelectStep: (stepId: string | null) => void;
  onRevertToOriginal: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  steps,
  currentStepId,
  originalImage,
  onSelectStep,
  onRevertToOriginal,
}) => {
  if (steps.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 text-center">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 mx-auto mb-2">
          <History className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-300">Edit Timeline</h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Your prompt edits and versions will appear here as you iterate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Version History ({steps.length})</span>
        </h3>

        <button
          onClick={onRevertToOriginal}
          className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          title="Reset back to the raw original image"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Original</span>
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {/* Original Base Image Item */}
        <div
          onClick={() => onSelectStep(null)}
          className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
            currentStepId === null
              ? 'bg-slate-800/90 border-cyan-500/50 ring-1 ring-cyan-500/30'
              : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
          }`}
        >
          <img
            src={originalImage}
            alt="Original Base"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">v0 (Original Photo)</span>
              <span className="text-[10px] text-slate-500">Source</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Unedited original capture
            </p>
          </div>
        </div>

        {/* Steps Stack */}
        {steps.map((step, index) => {
          const isSelected = step.id === currentStepId;
          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <img
                src={step.imageUrl}
                alt={`Version ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">
                    v{index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(step.imageUrl, `cleancut-v${index + 1}.png`);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Download this version"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {step.prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
