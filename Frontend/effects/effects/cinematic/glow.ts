import { SunDim } from 'lucide-react';
import { EffectModule } from '../types';

export const glow: EffectModule = {
  id: 'pro-glow',
  name: 'Soft Glow',
  category: 'cinematic',
  icon: SunDim,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Highlight flare overlay with smooth shadows.',
  defaultParameters: {"intensity":1.2,"speed":1,"duration":3,"opacity":0.4,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Glow Radius","key":"intensity","type":"number","min":1,"max":2,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    ctx.filter = `blur(12px) brightness(${params.intensity})`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`gblur=sigma=1.2,eq=brightness=0.08:contrast=1.05`];
  }
};
