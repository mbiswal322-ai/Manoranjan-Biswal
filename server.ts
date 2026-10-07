import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing large base64 image payloads
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Google GenAI client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Check server status & API key configuration
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    models: [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image'
    ]
  });
});

// Helper function to extract base64 payload and mimeType
function parseImageData(rawImage: string): { base64Data: string; mimeType: string } {
  let mimeType = 'image/jpeg';
  let base64Data = rawImage;

  if (rawImage.startsWith('data:')) {
    const matches = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      const commaIndex = rawImage.indexOf(',');
      if (commaIndex !== -1) {
        base64Data = rawImage.substring(commaIndex + 1);
      }
    }
  }

  return { base64Data, mimeType };
}

// API: Edit product photo using Gemini image editing models
app.post('/api/edit-product-photo', async (req, res) => {
  try {
    const {
      image,
      instruction,
      aspectRatio = '1:1',
      imageSize = '1K',
      preferredModel,
      styleModifier
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image payload' });
    }

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: 'Missing instruction prompt' });
    }

    const { base64Data, mimeType } = parseImageData(image);

    // Candidate models in fallback order
    const candidateModels = [
      preferredModel || 'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image'
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let fullPrompt = instruction.trim();
    if (styleModifier) {
      fullPrompt += `\n[Studio Styling Direction: ${styleModifier}]`;
    }

    fullPrompt += `\nCRITICAL PRODUCT PHOTO INSTRUCTIONS:
- Clean up any dust, scratches, glare, unwanted cables, background clutter, and imperfections.
- If background removal or replacement is requested, ensure the product subject is sharply delineated with clean anti-aliased edges and a natural contact shadow at the base so it looks grounded.
- Maintain the original product shape, authentic colors, and materials.
- Produce high-end commercial e-commerce advertising quality.`;

    let generatedImageUrl: string | null = null;
    let modelUsed: string | null = null;
    let textFeedback: string | null = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        console.log(`[CleanCut] Attempting image edit with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: (imageSize === '512px' || imageSize === '1K' || imageSize === '2K' || imageSize === '4K') ? imageSize : '1K',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const outMime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
            modelUsed = model;
          } else if (part.text) {
            textFeedback = part.text;
          }
        }

        if (generatedImageUrl) {
          break; // successfully retrieved image
        }
      } catch (err: any) {
        console.warn(`[CleanCut] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedImageUrl) {
      const errorMsg = lastError?.message || 'Failed to generate edited image from model';
      return res.status(500).json({
        error: errorMsg,
        details: lastError ? String(lastError) : 'No image part returned in candidate response.'
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      modelUsed,
      textFeedback,
    });
  } catch (error: any) {
    console.error('[CleanCut] Edit photo error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred during image processing',
    });
  }
});

// API: Prompt enhancer using gemini-3.8-flash for studio lighting & instructions
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, preset } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert commercial product photographer and digital retoucher.
Convert this simple user instruction into an optimized, highly descriptive image editing instruction that removes distractions, cleans backgrounds, and enhances product presentation for e-commerce.

User prompt: "${prompt}"
${preset ? `Desired aesthetic preset: ${preset}` : ''}

Output ONLY the improved prompt, concise (under 50 words), focusing on:
1. Exact background treatment (e.g. pure white #FFFFFF, pedestal, natural studio gradient)
2. Shadow treatment (soft diffuse contact shadow, subtle ambient occlusion)
3. Cleanup instructions (remove cables, dust, scratches, glare, blemishes)
4. Crisp edge isolation and sharp focus on the product`,
    });

    return res.json({
      enhancedPrompt: response.text?.trim() || prompt,
    });
  } catch (err: any) {
    console.error('Enhance prompt failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to enhance prompt' });
  }
});

// Setup Vite development server or static file serving
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`CleanCut AI Product Studio running on http://localhost:${port}`);
  });
}

setupServer();
