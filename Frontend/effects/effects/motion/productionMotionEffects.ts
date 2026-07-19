import { EffectModule } from '../types';
import { Wind } from 'lucide-react';

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

export const productionMotionEffectsList: EffectModule[] = [];

const motionThemes = [
  { name: 'Speed Ramp', sub: 'motion', icon: Wind },
  { name: 'Hyperlapse Flow', sub: 'motion', icon: Wind },
  { name: 'Slow Motion Cast', sub: 'motion', icon: Wind },
  { name: 'Stutter Stop', sub: 'motion', icon: Wind },
  { name: 'Frame Echo', sub: 'motion', icon: Wind },
  { name: 'Ghost Trail', sub: 'motion', icon: Wind },
  { name: 'Motion Blur Drift', sub: 'motion', icon: Wind },
  { name: 'Time Warp', sub: 'motion', icon: Wind },
  { name: 'Jitter Jump', sub: 'motion', icon: Wind },
  { name: 'Whip Pan Slide', sub: 'motion', icon: Wind },
  { name: 'Rotate Spin', sub: 'motion', icon: Wind },
  { name: 'Elastic Bounce', sub: 'motion', icon: Wind }
];

motionThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionMotionEffectsList.push(createProductionEffect(
      `pro-prod-motion-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Dynamic motion kinetic ${t.name} style ${v}.`,
      t.icon,
      'motion',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const factor = params.intensity ?? 0.5;
        ctx.scale(1 + factor * 0.02, 1 + factor * 0.02);
      }
    ));
  }
});
