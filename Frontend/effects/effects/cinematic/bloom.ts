import { SunMedium } from 'lucide-react';
import { EffectModule } from '../types';

export const bloom: EffectModule = {
  id: 'pro-bloom',
  name: 'Cinematic Bloom',
  category: 'cinematic',
  icon: SunMedium,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Dreamy atmospheric glow around bright elements.',
  defaultParameters: {"intensity":1.5,"speed":1,"duration":4,"opacity":0.5,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Bloom Power","key":"intensity","type":"number","min":1,"max":3,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    ctx.filter = `brightness(1.5) contrast(1.4) blur(18px)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`gblur=sigma=2.0,eq=brightness=0.10:contrast=1.2`];
  }
};
