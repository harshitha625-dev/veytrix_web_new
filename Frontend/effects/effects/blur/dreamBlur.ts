import { Sparkles } from 'lucide-react';
import { EffectModule } from '../types';

export const dreamBlur: EffectModule = {
  id: 'pro-dream-blur',
  name: 'Dream Blur',
  category: 'blur',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Romantic soft dream glow.',
  defaultParameters: {"intensity":12,"speed":1,"duration":3,"opacity":1,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Dreaminess","key":"intensity","type":"number","min":0,"max":30,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = `blur(${params.intensity * 0.6}px) brightness(1.2) contrast(1.1)`;
    ctx.globalAlpha = params.opacity * 0.45;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`gblur=sigma=2.0,eq=brightness=0.08:contrast=1.1:saturation=1.2`];
  }
};
