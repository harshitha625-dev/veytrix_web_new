import { EffectModule } from '../types';
import { Sliders } from 'lucide-react';

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

export const productionLightEffectsList: EffectModule[] = [];

const lightThemes = [
  { name: 'Solar Flare', sub: 'light', icon: Sliders },
  { name: 'Prism Glow', sub: 'light', icon: Sliders },
  { name: 'Neon Tube', sub: 'light', icon: Sliders },
  { name: 'Light Sweep', sub: 'light', icon: Sliders },
  { name: 'Optical Sparkle', sub: 'light', icon: Sliders },
  { name: 'Volumetric Rays', sub: 'light', icon: Sliders },
  { name: 'Lens Halation', sub: 'light', icon: Sliders },
  { name: 'Laser Beam', sub: 'light', icon: Sliders },
  { name: 'Disco Strobe', sub: 'light', icon: Sliders },
  { name: 'Fairy Dust', sub: 'light', icon: Sliders },
  { name: 'Chroma Streak', sub: 'light', icon: Sliders },
  { name: 'Rainbow Leak', sub: 'light', icon: Sliders }
];

lightThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionLightEffectsList.push(createProductionEffect(
      `pro-prod-light-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Vivid lighting ${t.name} overlay style ${v}.`,
      t.icon,
      'light',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `brightness(${1 + intensity * 0.25}) saturate(${1 + intensity * 0.2})`;
      }
    ));
  }
});
