import { EffectModule } from '../types';
import { Zap } from 'lucide-react';

const createProductionEffect = (
  id: string, name: string, description: string, icon: any, category: any,
  defaultParams: any, adjustableParams: any[], renderer: any
): EffectModule => {
  return {
    id,
    name,
    category,
    icon,
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60',
    description,
    defaultParameters: { ...defaultParams, enabled: true },
    adjustableParameters: adjustableParams,
    previewRenderer: (ctx, video, params, time, canvas) => {
      ctx.save();
      renderer(ctx, video, params, time, canvas);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    },
    ffmpegExportFilter: () => []
  };
};

export const productionGlitchEffectsList: EffectModule[] = [];

const glitchThemes = [
  { name: 'RGB Misalignment', sub: 'glitch', icon: Zap },
  { name: 'Digital Block Noise', sub: 'glitch', icon: Zap },
  { name: 'Horizontal Tear', sub: 'glitch', icon: Zap },
  { name: 'Signal Drop', sub: 'glitch', icon: Zap },
  { name: 'Frame Buffer Slip', sub: 'glitch', icon: Zap },
  { name: 'Chromatic Split', sub: 'glitch', icon: Zap },
  { name: 'Data Moshing', sub: 'glitch', icon: Zap },
  { name: 'Sync Ripple', sub: 'glitch', icon: Zap },
  { name: 'Hologram Static', sub: 'glitch', icon: Zap },
  { name: 'Flicker Strobe', sub: 'glitch', icon: Zap },
  { name: 'Color Phase', sub: 'glitch', icon: Zap },
  { name: 'Bitcrush Pixel', sub: 'glitch', icon: Zap }
];

glitchThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionGlitchEffectsList.push(createProductionEffect(
      `pro-prod-glitch-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Digital glitch artifact ${t.name} style ${v}.`,
      t.icon,
      'glitch',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `contrast(${1 + intensity * 0.15}) saturate(${1 + intensity * 0.25})`;
      }
    ));
  }
});
