import { Orbit } from 'lucide-react';
import { EffectModule } from '../types';

export const orbitCamera: EffectModule = {
  id: 'pro-orbit-camera',
  name: 'Orbit Camera',
  category: 'camera',
  icon: Orbit,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Circular orbiting camera motion around the center.',
  defaultParameters: {"intensity":15,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Orbit Radius","key":"intensity","type":"number","min":3,"max":40,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.3,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const angle = time * params.speed;
    const ox = Math.cos(angle) * params.intensity;
    const oy = Math.sin(angle) * params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(ox, oy);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw-${params.intensity*2}:ih-${params.intensity*2}:${params.intensity}+${params.intensity}*cos(t*${params.speed}):${params.intensity}+${params.intensity}*sin(t*${params.speed})`];
  }
};
