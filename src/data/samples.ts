import { SampleProduct } from '../types';

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-sneaker',
    name: 'Urban Streetwear Sneaker',
    category: 'Footwear & Apparel',
    description: 'Messy studio floor with tools, wood planks, and paint splashes in background.',
    imagePath: '/src/assets/images/sample_sneaker_1791409745688.jpg',
    suggestedPrompt: 'Remove the messy studio floor and paint splashes completely. Isolate the sneakers on a seamless pure white studio cyclorama background (#FFFFFF) with a realistic soft natural contact shadow beneath the soles.',
    recommendedPresets: ['pure-white', 'pedestal', 'amazon-clean'],
  },
  {
    id: 'sample-watch',
    name: 'Luxury Chronograph Watch',
    category: 'Jewelry & Watches',
    description: 'Textured granite desk with cables, pens, and coffee stains in background.',
    imagePath: '/src/assets/images/sample_watch_1791409758851.jpg',
    suggestedPrompt: 'Remove all background cables, pens, and coffee stains. Place this luxury watch on a clean, sleek dark matte slate surface with elegant commercial rim lighting and crystal-clear dial visibility.',
    recommendedPresets: ['dark-luxury', 'pure-white', 'studio-clean'],
  },
  {
    id: 'sample-cosmetic',
    name: 'Radiance Botanical Serum',
    category: 'Beauty & Skincare',
    description: 'Bathroom countertop with water splashes, towels, and distracting toiletries.',
    imagePath: '/src/assets/images/sample_cosmetic_1791409770344.jpg',
    suggestedPrompt: 'Remove bathroom countertop clutter, water drops, and towels. Place the cosmetic serum bottle on a minimalist travertine stone podium with gentle morning sunlight, soft organic shadow, and crisp glass reflections.',
    recommendedPresets: ['pedestal', 'pure-white', 'sunlight-lifestyle'],
  },
  {
    id: 'sample-headphones',
    name: 'Wireless Studio Headphones',
    category: 'Electronics & Audio',
    description: 'Cluttered office workspace with laptop cables, crumpled paper, and coffee mug.',
    imagePath: '/src/assets/images/sample_headphones_1791409781658.jpg',
    suggestedPrompt: 'Remove the messy office background, tangled cables, and coffee mug. Isolate headphones on a pristine neutral studio backdrop with sleek subtle cyan accent rim lighting and sharp ear-cup details.',
    recommendedPresets: ['pure-white', 'amazon-clean', 'dark-luxury'],
  },
];
