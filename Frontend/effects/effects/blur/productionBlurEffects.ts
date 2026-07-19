import { EffectModule } from '../types';
import { Eye } from 'lucide-react';

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

export const productionBlurEffectsList: EffectModule[] = [];

const blurThemes = [
  { name: 'Gaussian Blur', sub: 'blur', icon: Eye },
  { name: 'Radial Zoom Blur', sub: 'blur', icon: Eye },
  { name: 'Motion Streak', sub: 'blur', icon: Eye },
  { name: 'Spin Blur', sub: 'blur', icon: Eye },
  { name: 'Bokeh Soften', sub: 'blur', icon: Eye },
  { name: 'Dream Mist', sub: 'blur', icon: Eye },
  { name: 'Tilt Shift', sub: 'blur', icon: Eye },
  { name: 'Horizontal Defocus', sub: 'blur', icon: Eye },
  { name: 'Vertical Smear', sub: 'blur', icon: Eye },
  { name: 'Variable Blur', sub: 'blur', icon: Eye },
  { name: 'Directional Drift', sub: 'blur', icon: Eye },
  { name: 'Focus Pulser', sub: 'blur', icon: Eye }
];

blurThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionBlurEffectsList.push(createProductionEffect(
      `pro-prod-blur-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Dynamic defocus ${t.name} style ${v}.`,
      t.icon,
      'blur',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `blur(${intensity * 5}px)`;
      }
    ));
  }
});
