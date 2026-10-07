export interface ExportPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  description: string;
  recommendedFit: 'contain' | 'cover';
  badge?: string;
  iconName: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'etsy',
    name: 'Etsy Product',
    platform: 'Etsy',
    width: 1000,
    height: 1000,
    aspectRatioLabel: '1:1 Square',
    description: 'Optimal 1000×1000 listing thumbnail recommended by Etsy guidelines.',
    recommendedFit: 'contain',
    badge: 'Popular',
    iconName: 'ShoppingBag',
  },
  {
    id: 'instagram-portrait',
    name: 'Instagram Feed',
    platform: 'Instagram',
    width: 1080,
    height: 1350,
    aspectRatioLabel: '4:5 Portrait',
    description: 'High-engagement feed portrait (1080×1350) that occupies maximum mobile screen area.',
    recommendedFit: 'cover',
    badge: 'Social',
    iconName: 'Camera',
  },
  {
    id: 'product-page-wide',
    name: 'Product Page (Wide)',
    platform: 'Web & Hero',
    width: 1920,
    height: 1080,
    aspectRatioLabel: '16:9 Wide',
    description: 'Wide hero banner & showcase header (1920×1080) for e-commerce store homepages.',
    recommendedFit: 'contain',
    badge: 'E-Commerce',
    iconName: 'Monitor',
  },
  {
    id: 'shopify-square',
    name: 'Shopify Catalog',
    platform: 'Shopify',
    width: 2048,
    height: 2048,
    aspectRatioLabel: '1:1 Ultra HD',
    description: 'High-resolution square catalog image (2048×2048) with zoom support.',
    recommendedFit: 'contain',
    iconName: 'Store',
  },
  {
    id: 'amazon-standard',
    name: 'Amazon Main Image',
    platform: 'Amazon',
    width: 2000,
    height: 2000,
    aspectRatioLabel: '1:1 Square',
    description: 'Amazon marketplace requirement with pure white background margin.',
    recommendedFit: 'contain',
    iconName: 'Package',
  },
  {
    id: 'story-vertical',
    name: 'Instagram Story / Reel',
    platform: 'TikTok / Story',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16 Full Screen',
    description: 'Mobile full-screen story & video card format (1080×1920).',
    recommendedFit: 'contain',
    iconName: 'Smartphone',
  },
];
