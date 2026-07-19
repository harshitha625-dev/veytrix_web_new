import { EffectModule } from '../types';
import { Tv } from 'lucide-react';

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

export const productionRetroEffectsList: EffectModule[] = [];

const retroThemes = [
  { name: 'Super 8 Film', sub: 'film', icon: Tv },
  { name: '16mm Vintage', sub: 'film', icon: Tv },
  { name: 'Kinetoscope', sub: 'film', icon: Tv },
  { name: 'VHS Static', sub: 'retro', icon: Tv },
  { name: '8-Bit Retro', sub: 'retro', icon: Tv },
  { name: 'Scanline CRT', sub: 'retro', icon: Tv },
  { name: 'Sepia Wash', sub: 'retro', icon: Tv },
  { name: 'Monochrome Grain', sub: 'retro', icon: Tv },
  { name: 'Daguerreotype', sub: 'retro', icon: Tv },
  { name: 'Polaroid Frame', sub: 'retro', icon: Tv },
  { name: 'Faded Archive', sub: 'retro', icon: Tv },
  { name: 'Warm Nostalgia', sub: 'retro', icon: Tv }
];

retroThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionRetroEffectsList.push(createProductionEffect(
      `pro-prod-retro-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Nostalgic retro ${t.name} style version ${v}.`,
      t.icon,
      'retro',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `sepia(${intensity * 0.4}) contrast(${1 - intensity * 0.1}) saturate(${1 - intensity * 0.15})`;
      }
    ));
  }
});
