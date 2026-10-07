/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageWorkspace } from './components/ImageWorkspace';
import { PromptConsole } from './components/PromptConsole';
import { HistoryTimeline } from './components/HistoryTimeline';
import { SamplePickerModal } from './components/SamplePickerModal';
import { UploadDropzone } from './components/UploadDropzone';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_PRODUCTS } from './data/samples';
import { EditStep, SampleProduct } from './types';
import { Sparkles, AlertTriangle, CheckCircle, Info, ArrowUpRight } from 'lucide-react';

export default function App() {
  // Pre-load the first realistic product sample (Sneaker on messy studio floor)
  const defaultSample = SAMPLE_PRODUCTS[0];

  const [originalImage, setOriginalImage] = useState<string>(defaultSample.imagePath);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string>(defaultSample.id);
  const [instruction, setInstruction] = useState<string>(defaultSample.suggestedPrompt);

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-image-preview');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [editOnTopCurrent, setEditOnTopCurrent] = useState<boolean>(false);

  const [editSteps, setEditSteps] = useState<EditStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [sampleModalOpen, setSampleModalOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend server and API key status on load
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => {
        console.warn('API status check error:', err);
      });
  }, []);

  // Handle selecting a sample product
  const handleSelectSample = (sample: SampleProduct) => {
    setActiveSampleId(sample.id);
    setOriginalImage(sample.imagePath);
    setCurrentImage(null);
    setCurrentStepId(null);
    setEditSteps([]);
    setInstruction(sample.suggestedPrompt);
    setErrorMessage(null);
  };

  // Handle uploading or pasting a custom photo
  const handleImageUploaded = (dataUrl: string) => {
    setActiveSampleId('');
    setOriginalImage(dataUrl);
    setCurrentImage(null);
    setCurrentStepId(null);
    setEditSteps([]);
    setInstruction('Remove the background and place on pure studio white (#FFFFFF) with a delicate contact shadow.');
    setErrorMessage(null);
  };

  // Trigger file upload dialog
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Execute Gemini background removal and photo cleanup
  const handleExecuteEdit = async (customPrompt?: string) => {
    const promptToUse = customPrompt || instruction;
    if (!promptToUse.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Sending request to Gemini 3.1 Flash Image model...');

    try {
      // Determine base image: current edited or original
      const sourceImage = (editOnTopCurrent && currentImage) ? currentImage : originalImage;

      const response = await fetch('/api/edit-product-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: sourceImage,
          instruction: promptToUse,
          preferredModel: selectedModel,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process product image');
      }

      const newStep: EditStep = {
        id: `step-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: data.imageUrl,
        prompt: promptToUse,
        modelUsed: data.modelUsed || selectedModel,
        textFeedback: data.textFeedback,
        aspectRatio,
      };

      setEditSteps((prev) => [newStep, ...prev]);
      setCurrentStepId(newStep.id);
      setCurrentImage(data.imageUrl);
      setStatusMessage('Photo cleaned successfully!');
    } catch (err: any) {
      console.error('Edit failed:', err);
      setErrorMessage(
        err.message || 'Image editing encountered an error. Please try again or rephrase your instruction.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle switching active step in history timeline
  const handleSelectStep = (stepId: string | null) => {
    setCurrentStepId(stepId);
    if (stepId === null) {
      setCurrentImage(null);
    } else {
      const step = editSteps.find((s) => s.id === stepId);
      if (step) {
        setCurrentImage(step.imageUrl);
      }
    }
  };

  // Revert back to original base
  const handleRevertToOriginal = () => {
    setCurrentStepId(null);
    setCurrentImage(null);
  };

  const activeStep = editSteps.find((s) => s.id === currentStepId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Hidden file input for header upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                handleImageUploaded(reader.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
      />

      {/* Top Navigation */}
      <Header
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onOpenSamplePicker={() => setSampleModalOpen(true)}
        onTriggerUpload={handleTriggerUpload}
        hasApiKey={hasApiKey}
        isProcessing={isProcessing}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-sm shadow-lg animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-300">Processing Error</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Studio Grid: Workspace on Top/Left, Controls on Bottom/Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Workspace (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <ImageWorkspace
              originalImage={originalImage}
              currentImage={currentImage}
              isProcessing={isProcessing}
              modelUsed={activeStep?.modelUsed || (currentImage ? selectedModel : undefined)}
              activePrompt={activeStep?.prompt}
              onOpenSamplePicker={() => setSampleModalOpen(true)}
              onTriggerUpload={handleTriggerUpload}
              onOpenExportModal={() => setExportModalOpen(true)}
            />

            {/* Natural Language Instruction Console */}
            <PromptConsole
              instruction={instruction}
              onChangeInstruction={setInstruction}
              onSubmit={handleExecuteEdit}
              isProcessing={isProcessing}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
              imageSize={imageSize}
              onChangeImageSize={setImageSize}
              editOnTopCurrent={editOnTopCurrent}
              onToggleEditOnTop={setEditOnTopCurrent}
              hasPreviousEdit={Boolean(currentImage)}
            />
          </div>

          {/* Right Sidebar: Timeline & Quick Tools (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Quick Upload / Drag Dropzone Widget */}
            <UploadDropzone
              onImageSelected={handleImageUploaded}
              onOpenSamplePicker={() => setSampleModalOpen(true)}
            />

            {/* Version History Stack */}
            <HistoryTimeline
              steps={editSteps}
              currentStepId={currentStepId}
              originalImage={originalImage}
              onSelectStep={handleSelectStep}
              onRevertToOriginal={handleRevertToOriginal}
            />

            {/* Pro Photography Tips Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-850 p-4 text-xs text-slate-400 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Prompting Studio Tips</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-400">
                <li><strong className="text-slate-300">Pure White Backdrop:</strong> Type <span className="text-cyan-300">#FFFFFF pure studio white</span> for Amazon & Shopify compliant cutouts.</li>
                <li><strong className="text-slate-300">Contact Shadows:</strong> Ask for <span className="text-cyan-300">"subtle contact shadow underneath base"</span> so the product looks naturally anchored.</li>
                <li><strong className="text-slate-300">Pedestals & Stages:</strong> Ask for <span className="text-cyan-300">"minimalist stone podium"</span> or <span className="text-cyan-300">"oak countertop"</span>.</li>
                <li><strong className="text-slate-300">Clutter Erase:</strong> Type <span className="text-cyan-300">"erase all stray cables and coffee stains"</span> to preserve the scene but clean it up.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Sample Products Modal */}
      <SamplePickerModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
        currentSampleId={activeSampleId}
      />

      {/* Export & Auto-Resize Studio Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageSrc={currentImage || originalImage}
      />
    </div>
  );
}
