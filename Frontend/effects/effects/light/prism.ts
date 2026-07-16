import { Triangle } from 'lucide-react';
import { EffectModule } from '../types';

export const prism: EffectModule = {
  id: 'pro-prism',
  name: 'Prism',
  category: 'light',
  icon: Triangle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Prismatic RGB split with chromatic dispersion.',
  defaultParameters: {"intensity":6,"speed":1,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Dispersion","key":"intensity","type":"number","min":2,"max":15,"step":1},{"name":"Animation","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const shift = params.speed > 0 ? Math.sin(time * params.speed) * params.intensity : params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    // Red channel
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(video, -shift, 0, canvas.width, canvas.height);
    // Green channel
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Blue channel
    ctx.drawImage(video, shift, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`rgbashift=rh=${params.intensity}:bh=-${params.intensity}`];
  }
};
