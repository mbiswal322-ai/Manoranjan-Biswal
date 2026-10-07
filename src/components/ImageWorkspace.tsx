import React, { useState, useRef, useEffect } from 'react';
import {
  Columns2,
  Split,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  ChevronDown,
  ShoppingBag,
  Camera,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { downloadImage, copyImageToClipboard, resizeAndExportImage } from '../utils/imageUtils';
import { EXPORT_PRESETS, ExportPreset } from '../data/exportPresets';

interface ImageWorkspaceProps {
  originalImage: string;
  currentImage: string | null;
  isProcessing: boolean;
  modelUsed?: string;
  activePrompt?: string;
  onOpenSamplePicker: () => void;
  onTriggerUpload: () => void;
  onOpenExportModal: () => void;
}

export type ViewMode = 'split' | 'side-by-side' | 'overlay' | 'clean-only';
export type BackdropMode = 'checkerboard' | 'white' | 'gray' | 'dark' | 'sand' | 'custom';

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  originalImage,
  currentImage,
  isProcessing,
  modelUsed,
  activePrompt,
  onOpenSamplePicker,
  onTriggerUpload,
  onOpenExportModal,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [backdrop, setBackdrop] = useState<BackdropMode>('checkerboard');
  const [customBgColor, setCustomBgColor] = useState<string>('#06B6D4');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showOriginalOverlay, setShowOriginalOverlay] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [quickDownloadingId, setQuickDownloadingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExportMenuOpen]);

  // Handle quick download with preset auto-resize
  const handleQuickPresetDownload = async (preset: ExportPreset) => {
    const target = currentImage || originalImage;
    if (!target) return;
    setQuickDownloadingId(preset.id);
    try {
      const resizedUrl = await resizeAndExportImage(target, {
        width: preset.width,
        height: preset.height,
        fit: preset.recommendedFit,
        format: 'image/png',
        backgroundColor: 'transparent',
      });
      downloadImage(resizedUrl, `cleancut-${preset.id}-${preset.width}x${preset.height}.png`);
      setIsExportMenuOpen(false);
    } catch (err) {
      console.error('Quick preset export failed:', err);
    } finally {
      setQuickDownloadingId(null);
    }
  };

  // Handle slider mouse/touch drag
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 2), 98);
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingSlider(false);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      setIsDraggingSlider(false);
    };

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingSlider]);

  const handleCopy = async () => {
    const target = currentImage || originalImage;
    if (!target) return;
    const ok = await copyImageToClipboard(target);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const target = currentImage || originalImage;
    if (!target) return;
    downloadImage(target, `cleancut-product-${Date.now()}.png`);
  };

  // Get background style based on active backdrop mode
  const getBackdropClass = () => {
    switch (backdrop) {
      case 'checkerboard':
        return 'bg-checkerboard';
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-slate-200';
      case 'dark':
        return 'bg-slate-900';
      case 'sand':
        return 'bg-[#F9F6F0]';
      case 'custom':
        return '';
      default:
        return 'bg-checkerboard';
    }
  };

  const hasProcessedImage = Boolean(currentImage && currentImage !== originalImage);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Workspace Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/70 gap-2">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('split')}
            disabled={!hasProcessedImage}
            className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg font-medium transition-all ${
              viewMode === 'split' && hasProcessedImage
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title="Interactive Split Slider"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            disabled={!hasProcessedImage}
            className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg font-medium transition-all ${
              viewMode === 'side-by-side' && hasProcessedImage
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title="Side by Side Comparison"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            disabled={!hasProcessedImage}
            className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg font-medium transition-all ${
              viewMode === 'overlay' && hasProcessedImage
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title="Overlay Toggle"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hold to Peek</span>
          </button>
          <button
            onClick={() => setViewMode('clean-only')}
            className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg font-medium transition-all ${
              viewMode === 'clean-only' || !hasProcessedImage
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Clean Product Solo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Result Only</span>
          </button>
        </div>

        {/* Center: Stage Backdrop Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
          <Palette className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="hidden md:inline text-slate-400 text-[11px]">Backdrop:</span>
          
          <button
            onClick={() => setBackdrop('checkerboard')}
            className={`w-5 h-5 rounded-md border text-[10px] flex items-center justify-center transition-all bg-checkerboard ${
              backdrop === 'checkerboard' ? 'ring-2 ring-cyan-400 border-white' : 'border-slate-700 opacity-70 hover:opacity-100'
            }`}
            title="Checkerboard Grid (Transparent Preview)"
          />
          <button
            onClick={() => setBackdrop('white')}
            className={`w-5 h-5 rounded-md border text-[10px] bg-white transition-all ${
              backdrop === 'white' ? 'ring-2 ring-cyan-400 border-slate-300' : 'border-slate-600 opacity-70 hover:opacity-100'
            }`}
            title="Commercial Studio White (#FFFFFF)"
          />
          <button
            onClick={() => setBackdrop('gray')}
            className={`w-5 h-5 rounded-md border text-[10px] bg-slate-200 transition-all ${
              backdrop === 'gray' ? 'ring-2 ring-cyan-400 border-slate-300' : 'border-slate-600 opacity-70 hover:opacity-100'
            }`}
            title="Neutral Soft Studio Gray"
          />
          <button
            onClick={() => setBackdrop('sand')}
            className={`w-5 h-5 rounded-md border text-[10px] bg-[#F9F6F0] transition-all ${
              backdrop === 'sand' ? 'ring-2 ring-cyan-400 border-slate-300' : 'border-slate-600 opacity-70 hover:opacity-100'
            }`}
            title="Warm Sand Backdrop"
          />
          <button
            onClick={() => setBackdrop('dark')}
            className={`w-5 h-5 rounded-md border text-[10px] bg-slate-900 transition-all ${
              backdrop === 'dark' ? 'ring-2 ring-cyan-400 border-cyan-500' : 'border-slate-700 opacity-70 hover:opacity-100'
            }`}
            title="Luxury Dark Charcoal"
          />
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => {
                setCustomBgColor(e.target.value);
                setBackdrop('custom');
              }}
              className="sr-only"
            />
            <div
              style={{ backgroundColor: customBgColor }}
              className={`w-5 h-5 rounded-md border border-slate-600 transition-all ${
                backdrop === 'custom' ? 'ring-2 ring-cyan-400' : 'opacity-70 hover:opacity-100'
              }`}
              title="Custom Hex Color"
            />
          </label>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 bg-slate-900/90 px-1 py-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 ml-0.5"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all active:scale-95"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export Menu Dropdown */}
          <div ref={exportMenuRef} className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25">
              <button
                type="button"
                onClick={onOpenExportModal}
                className="flex items-center gap-1 px-3 py-1.5 font-bold text-xs hover:from-cyan-300 hover:to-cyan-400 transition-all active:scale-95 cursor-pointer"
                title="Open Export & Resize Studio"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-1.5 py-1.5 border-l border-cyan-600/30 hover:bg-cyan-400/30 rounded-r-xl transition-colors cursor-pointer"
                title="Quick download presets"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Quick Presets Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick Download Presets</span>
                  <span className="text-cyan-400">Auto-Resize</span>
                </div>

                {/* Etsy Preset */}
                <button
                  type="button"
                  disabled={quickDownloadingId !== null}
                  onClick={() => handleQuickPresetDownload(EXPORT_PRESETS[0])}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="font-semibold block">Etsy (1000×1000)</span>
                      <span className="text-[10px] text-slate-400">1:1 Square Listing</span>
                    </div>
                  </div>
                  {quickDownloadingId === 'etsy' ? (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </button>

                {/* Instagram Preset */}
                <button
                  type="button"
                  disabled={quickDownloadingId !== null}
                  onClick={() => handleQuickPresetDownload(EXPORT_PRESETS[1])}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-pink-400" />
                    <div>
                      <span className="font-semibold block">Instagram (1080×1350)</span>
                      <span className="text-[10px] text-slate-400">4:5 Feed Portrait</span>
                    </div>
                  </div>
                  {quickDownloadingId === 'instagram-portrait' ? (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </button>

                {/* Product Page Wide Preset */}
                <button
                  type="button"
                  disabled={quickDownloadingId !== null}
                  onClick={() => handleQuickPresetDownload(EXPORT_PRESETS[2])}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <span className="font-semibold block">Product Page (Wide)</span>
                      <span className="text-[10px] text-slate-400">1920×1080 Hero Banner</span>
                    </div>
                  </div>
                  {quickDownloadingId === 'product-page-wide' ? (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </button>

                <div className="h-px bg-slate-800 my-1" />

                {/* Custom Export Studio Modal Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onOpenExportModal();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cyan-950/40 text-xs text-cyan-300 transition-colors flex items-center justify-between font-medium group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Studio & Custom Sizes...</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </button>

                {/* Native Unaltered Download */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleDownload();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] text-slate-400 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Download Original Resolution</span>
                  <span className="font-mono text-[10px] text-slate-500">Raw</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: backdrop === 'custom' ? customBgColor : undefined,
        }}
        className={`relative flex-1 min-h-[420px] max-h-[640px] flex items-center justify-center overflow-hidden p-4 sm:p-8 select-none transition-colors duration-300 ${getBackdropClass()}`}
      >
        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md">
            <div className="relative flex items-center justify-center w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-base font-bold text-white tracking-wide">
              Gemini 3.1 is cleaning your photo...
            </p>
            <p className="text-xs text-cyan-300/80 mt-1 max-w-sm text-center px-4">
              Isolating subject, removing background clutter, and casting realistic contact shadows
            </p>
          </div>
        )}

        {/* View Mode: Split Comparison Slider */}
        {viewMode === 'split' && hasProcessedImage && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="relative max-h-full max-w-full aspect-square flex items-center justify-center rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-800/60 transition-transform duration-150"
          >
            {/* Cleaned Result (Background layer) */}
            <img
              src={currentImage!}
              alt="Cleaned product"
              referrerPolicy="no-referrer"
              className="max-h-[520px] max-w-full object-contain pointer-events-none"
            />

            {/* Original Image (Clipped layer over top left) */}
            <div
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <img
                src={originalImage}
                alt="Original messy photo"
                referrerPolicy="no-referrer"
                className="max-h-[520px] max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Interactive Split Divider Line */}
            <div
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-lg shadow-cyan-400/50 cursor-ew-resize flex items-center justify-center z-20 group"
            >
              <div className="w-8 h-8 -ml-3.5 rounded-full bg-slate-950 text-cyan-400 border-2 border-cyan-400 shadow-xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform">
                <Split className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Corner Labels */}
            <div className="absolute top-3 left-3 pointer-events-none z-10 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 text-[11px] font-semibold border border-slate-700/60 shadow">
              Original (Before)
            </div>
            <div className="absolute top-3 right-3 pointer-events-none z-10 px-2.5 py-1 rounded-md bg-cyan-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-semibold border border-cyan-700/60 shadow">
              Clean Cut (After)
            </div>
          </div>
        )}

        {/* View Mode: Side-by-Side Dual View */}
        {viewMode === 'side-by-side' && hasProcessedImage && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl w-full h-full max-h-[520px] items-center transition-transform duration-150"
          >
            <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 h-full max-h-[480px]">
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-slate-950/90 text-slate-300 text-xs font-semibold border border-slate-700">
                Original (Before)
              </span>
              <img
                src={originalImage}
                alt="Original photo"
                referrerPolicy="no-referrer"
                className="max-h-[420px] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/40 border border-cyan-500/30 h-full max-h-[480px]">
              <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-cyan-950/90 text-cyan-300 text-xs font-semibold border border-cyan-600">
                Cleaned by CleanCut AI
              </span>
              <img
                src={currentImage!}
                alt="Cleaned product"
                referrerPolicy="no-referrer"
                className="max-h-[420px] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* View Mode: Hold to Peek Overlay */}
        {viewMode === 'overlay' && hasProcessedImage && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            onMouseDown={() => setShowOriginalOverlay(true)}
            onMouseUp={() => setShowOriginalOverlay(false)}
            onTouchStart={() => setShowOriginalOverlay(true)}
            onTouchEnd={() => setShowOriginalOverlay(false)}
            className="relative flex items-center justify-center cursor-pointer group max-h-[520px] transition-transform duration-150"
            title="Click and hold to peek at original photo"
          >
            <img
              src={showOriginalOverlay ? originalImage : currentImage!}
              alt="Product comparison"
              referrerPolicy="no-referrer"
              className="max-h-[520px] max-w-full object-contain rounded-xl shadow-2xl"
            />
            <div className="absolute bottom-4 inset-x-0 mx-auto w-max px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-medium text-slate-200 border border-slate-700 shadow-lg pointer-events-none flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showOriginalOverlay ? 'Viewing Original Photo' : 'Click & hold anywhere to peek original'}</span>
            </div>
          </div>
        )}

        {/* View Mode: Clean Only (or initial pre-edit state) */}
        {(viewMode === 'clean-only' || !hasProcessedImage) && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="relative flex items-center justify-center max-h-[520px] transition-transform duration-150"
          >
            <img
              src={currentImage || originalImage}
              alt="Product photo"
              referrerPolicy="no-referrer"
              className="max-h-[500px] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {!hasProcessedImage && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-slate-300 border border-slate-700">
                Original Photo Loaded
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workspace Footer Info Bar */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          {activePrompt ? (
            <span className="truncate max-w-md text-slate-300">
              <strong className="text-cyan-400 font-semibold">Active Edit:</strong> {activePrompt}
            </span>
          ) : (
            <span className="text-slate-400">
              Ready to edit. Pick a preset below or type custom instructions.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          {modelUsed && (
            <span className="text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              {modelUsed}
            </span>
          )}
          <span>Aspect: 1:1</span>
        </div>
      </div>
    </div>
  );
};
