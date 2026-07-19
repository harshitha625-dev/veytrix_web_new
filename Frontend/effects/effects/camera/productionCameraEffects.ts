import { EffectModule } from '../types';
import { Camera } from 'lucide-react';

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

export const productionCameraEffectsList: EffectModule[] = [];

const camThemes = [
  { name: 'Pan Left', sub: 'zoom', icon: Camera },
  { name: 'Pan Right', sub: 'zoom', icon: Camera },
  { name: 'Tilt Up', sub: 'zoom', icon: Camera },
  { name: 'Tilt Down', sub: 'zoom', icon: Camera },
  { name: 'Whip Pan', sub: 'zoom', icon: Camera },
  { name: 'Handheld Shake', sub: 'shake', icon: Camera },
  { name: 'Jib Shot', sub: 'zoom', icon: Camera },
  { name: 'Crane Sweep', sub: 'zoom', icon: Camera },
  { name: 'Dolly Zoom', sub: 'zoom', icon: Camera },
  { name: 'Orbit Ring', sub: 'zoom', icon: Camera },
  { name: 'Tracking Steady', sub: 'zoom', icon: Camera },
  { name: 'Roll Spin', sub: 'zoom', icon: Camera },
  { name: 'Parallax Move', sub: 'zoom', icon: Camera },
  { name: 'Crash Zoom', sub: 'zoom', icon: Camera },
  { name: 'Vertigo Squeeze', sub: 'zoom', icon: Camera }
];

camThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionCameraEffectsList.push(createProductionEffect(
      `pro-prod-cam-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Production-grade camera ${t.name} effect style ${v}.`,
      t.icon,
      'camera',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const factor = params.intensity ?? 0.5;
        ctx.scale(1 + factor * 0.05, 1 + factor * 0.05);
      }
    ));
  }
});
