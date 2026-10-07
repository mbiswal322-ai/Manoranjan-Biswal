export interface EditStep {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  modelUsed?: string;
  textFeedback?: string;
  aspectRatio?: string;
  settings?: {
    bgColor?: string;
    brightness?: number;
    contrast?: number;
  };
}

export interface PresetInstruction {
  id: string;
  title: string;
  shortLabel: string;
  icon: string;
  prompt: string;
  category: 'background' | 'cleanup' | 'lighting' | 'scene';
  badge?: string;
}

export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  imagePath: string;
  suggestedPrompt: string;
  recommendedPresets: string[];
}
