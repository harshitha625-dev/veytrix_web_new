import { ArrowDownUp } from 'lucide-react';
import { EffectModule } from '../types';

export const bounce: EffectModule = {
  id: 'pro-bounce',
  name: 'Bounce',
  category: 'motion',
  icon: ArrowDownUp,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Bouncy vertical motion with gravity simulation.',
  defaultParameters: {"intensity":12,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Bounce Height","key":"intensity","type":"number","min":3,"max":30,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":8,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = (time * params.speed) % 1;
    const oy = -Math.abs(Math.sin(t * Math.PI)) * params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(0, oy);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw:ih-${params.intensity*2}:0:${params.intensity}+${params.intensity}*abs(sin(t*PI*${params.speed}))`];
  }
};
