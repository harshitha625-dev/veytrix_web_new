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

export const productionDistortionEffectsList: EffectModule[] = [];

const distThemes = [
  { name: 'Fisheye Lens', sub: 'distortion', icon: Sliders },
  { name: 'Water Ripple', sub: 'distortion', icon: Sliders },
  { name: 'Wave Warp', sub: 'distortion', icon: Sliders },
  { name: 'Glass Refract', sub: 'distortion', icon: Sliders },
  { name: 'Sphere Bulge', sub: 'distortion', icon: Sliders },
  { name: 'Pinch Twist', sub: 'distortion', icon: Sliders },
  { name: 'Mirror Symmetry', sub: 'distortion', icon: Sliders },
  { name: 'Kaleidoscope', sub: 'distortion', icon: Sliders },
  { name: 'Vortex Swirl', sub: 'distortion', icon: Sliders },
  { name: 'Scan Distort', sub: 'distortion', icon: Sliders },
  { name: 'Offset Splice', sub: 'distortion', icon: Sliders },
  { name: 'Grid Liquify', sub: 'distortion', icon: Sliders }
];

distThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionDistortionEffectsList.push(createProductionEffect(
      `pro-prod-dist-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Geometric ${t.name} warp variation ${v}.`,
      t.icon,
      'distortion',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const factor = params.intensity ?? 0.5;
        ctx.skewX(factor * 0.05);
      }
    ));
  }
});
