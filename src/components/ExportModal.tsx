import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  Camera,
  Monitor,
  Store,
  Package,
  Smartphone,
  Layers,
  Palette,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { EXPORT_PRESETS, ExportPreset } from '../data/exportPresets';
import { resizeAndExportImage, downloadImage, copyImageToClipboard } from '../utils/imageUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>(EXPORT_PRESETS[0]); // default Etsy (1000x1000)
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [fileFormat, setFileFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.95);
  const [paddingColor, setPaddingColor] = useState<string>('#FFFFFF');
  const [isTransparent, setIsTransparent] = useState<boolean>(true);
  
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [estimatedSizeKb, setEstimatedSizeKb] = useState<number>(0);

  // Re-generate canvas preview whenever parameters change
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    let isMounted = true;
    setIsRendering(true);

    const generatePreview = async () => {
      try {
        const bg = (fileFormat === 'image/png' && isTransparent) ? 'transparent' : paddingColor;
        const resultUrl = await resizeAndExportImage(imageSrc, {
          width: selectedPreset.width,
          height: selectedPreset.height,
          fit: fitMode,
          format: fileFormat,
          quality,
          backgroundColor: bg,
        });

        if (isMounted) {
          setPreviewDataUrl(resultUrl);
          // Estimate byte size from base64 length
          const base64Str = resultUrl.split(',')[1] || '';
          const bytes = Math.round((base64Str.length * 3) / 4);
          setEstimatedSizeKb(Math.round(bytes / 1024));
        }
      } catch (err) {
        console.error('Failed to generate resized preview:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc, selectedPreset, fitMode, fileFormat, quality, paddingColor, isTransparent]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ExportPreset) => {
    setSelectedPreset(preset);
    setFitMode(preset.recommendedFit);
  };

  const handleDownload = async () => {
    if (!previewDataUrl) return;
    const ext = fileFormat === 'image/jpeg' ? 'jpg' : fileFormat === 'image/webp' ? 'webp' : 'png';
    const filename = `cleancut-${selectedPreset.id}-${selectedPreset.width}x${selectedPreset.height}.${ext}`;
    downloadImage(previewDataUrl, filename);
  };

  const handleQuickDownload = async (e: React.MouseEvent, preset: ExportPreset) => {
    e.stopPropagation();
    try {
      const bg = (fileFormat === 'image/png' && isTransparent) ? 'transparent' : paddingColor;
      const dataUrl = await resizeAndExportImage(imageSrc, {
        width: preset.width,
        height: preset.height,
        fit: preset.recommendedFit,
        format: fileFormat,
        quality,
        backgroundColor: bg,
      });
      const ext = fileFormat === 'image/jpeg' ? 'jpg' : fileFormat === 'image/webp' ? 'webp' : 'png';
      downloadImage(dataUrl, `cleancut-${preset.id}-${preset.width}x${preset.height}.${ext}`);
    } catch (err) {
      console.error('Quick download failed:', err);
    }
  };

  const handleCopy = async () => {
    if (!previewDataUrl) return;
    const ok = await copyImageToClipboard(previewDataUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-pink-400" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-cyan-400" />;
      case 'Store':
        return <Store className="w-4 h-4 text-emerald-400" />;
      case 'Package':
        return <Package className="w-4 h-4 text-orange-400" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Export & Quick Resize Studio
              </h2>
              <p className="text-xs text-slate-400">
                Auto-resize to Etsy, Instagram, Wide Product Page, and commercial marketplace dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Preset Selection & Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Presets List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Platform Preset</span>
                </label>
                <span className="text-[11px] text-slate-400">Auto-scales without distortion</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPORT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            {getPlatformIcon(preset.iconName)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors block">
                              {preset.name}
                            </span>
                            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                              {preset.width} × {preset.height} px
                            </span>
                          </div>
                        </div>

                        {preset.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {preset.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">{preset.aspectRatioLabel}</span>
                        <button
                          type="button"
                          onClick={(e) => handleQuickDownload(e, preset)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                          title="Instant 1-click download"
                        >
                          <Download className="w-3 h-3" />
                          <span>Quick Save</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Framing & Padding Controls */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Framing & Background Fill</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fit Mode */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Framing Method</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      className={`py-1.5 rounded-md font-medium transition-all ${
                        fitMode === 'contain'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Fit (Contain)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`py-1.5 rounded-md font-medium transition-all ${
                        fitMode === 'cover'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Fill (Center Crop)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {fitMode === 'contain'
                      ? 'Entire product visible with clean canvas padding.'
                      : 'Fills target rectangle completely, centering the subject.'}
                  </span>
                </div>

                {/* Padding Background */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Canvas Background</label>
                  <div className="flex items-center gap-2">
                    {fileFormat === 'image/png' && (
                      <button
                        type="button"
                        onClick={() => setIsTransparent(true)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          isTransparent
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-sm bg-checkerboard border border-slate-500" />
                        <span>Transparent</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsTransparent(false);
                        setPaddingColor('#FFFFFF');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        !isTransparent && paddingColor.toLowerCase() === '#ffffff'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-sm bg-white border border-slate-300" />
                      <span>White (#FFF)</span>
                    </button>

                    <label className="relative cursor-pointer">
                      <input
                        type="color"
                        value={paddingColor}
                        onChange={(e) => {
                          setIsTransparent(false);
                          setPaddingColor(e.target.value);
                        }}
                        className="sr-only"
                      />
                      <div
                        style={{ backgroundColor: paddingColor }}
                        className={`w-7 h-7 rounded-lg border border-slate-700 transition-all ${
                          !isTransparent && paddingColor.toLowerCase() !== '#ffffff'
                            ? 'ring-2 ring-cyan-400'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        title="Custom Color"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Format */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Format:</span>
                {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFileFormat(fmt)}
                    className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                      fileFormat === fmt
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {fmt.replace('image/', '')}
                  </button>
                ))}
              </div>

              {fileFormat !== 'image/png' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Quality:</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-24 accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-300">{Math.round(quality * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Frame Preview & Download Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/70 rounded-2xl border border-slate-800 p-4">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Output Preview</span>
                </span>
                <span className="font-mono text-cyan-400 text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  {selectedPreset.width} × {selectedPreset.height} px
                </span>
              </div>

              {/* Aspect-Ratio Box Preview */}
              <div
                style={{
                  aspectRatio: `${selectedPreset.width} / ${selectedPreset.height}`,
                  maxHeight: '320px',
                }}
                className="relative w-full mx-auto rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center bg-checkerboard shadow-xl"
              >
                {isRendering ? (
                  <div className="flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span>Rendering canvas preview...</span>
                  </div>
                ) : previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Resized output preview"
                    className="w-full h-full object-contain"
                  />
                ) : null}

                {/* Dimension Overlay Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700/60">
                  ~{estimatedSizeKb} KB
                </div>
              </div>

              <div className="mt-3 text-center text-xs text-slate-400">
                <p className="font-medium text-slate-300">{selectedPreset.name} Preset</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedPreset.description}</p>
              </div>
            </div>

            {/* Export Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/25 active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download for {selectedPreset.platform} ({selectedPreset.width}×{selectedPreset.height})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
