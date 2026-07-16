import { Moon } from 'lucide-react';
import { EffectModule } from '../types';

export const blackWhite: EffectModule = {
  id: 'pro-black-white',
  name: 'Black & White',
  category: 'cinematic',
  icon: Moon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'High-contrast monochrome filter.',
  defaultParameters: {"intensity":1,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Contrast","key":"intensity","type":"number","min":0.5,"max":2,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.filter = `grayscale(100%) contrast(${params.intensity})`;
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`hue=s=0,eq=contrast=${params.intensity}`];
  }
};
