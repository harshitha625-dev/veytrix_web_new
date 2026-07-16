import { Wind } from 'lucide-react';
import { EffectModule } from '../types';

export const drift: EffectModule = {
  id: 'pro-drift',
  name: 'Drift',
  category: 'motion',
  icon: Wind,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Slow lateral pan drifting across the frame.',
  defaultParameters: {"intensity":12,"speed":1,"duration":5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Drift Range","key":"intensity","type":"number","min":2,"max":30,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed;
    const ox = Math.sin(t * 0.3) * params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(ox, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw-${params.intensity*2}:ih:${params.intensity}+${params.intensity}*sin(t*0.3*${params.speed}):0`];
  }
};
