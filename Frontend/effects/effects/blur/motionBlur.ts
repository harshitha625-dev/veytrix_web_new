import { Wind } from 'lucide-react';
import { EffectModule } from '../types';

export const motionBlur: EffectModule = {
  id: 'pro-motion-blur',
  name: 'Motion Blur',
  category: 'blur',
  icon: Wind,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Simulated high-speed camera motion blur.',
  defaultParameters: {"intensity":10,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Strength","key":"intensity","type":"number","min":0,"max":30,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.filter = `blur(${params.intensity * 0.4}px) brightness(1.05)`;
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`tmix=frames=6,gblur=sigma=1.0`];
  }
};
