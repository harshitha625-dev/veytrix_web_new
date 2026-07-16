import { EyeOff } from 'lucide-react';
import { EffectModule } from '../types';

export const gaussianBlur: EffectModule = {
  id: 'pro-gaussian-blur',
  name: 'Gaussian Blur',
  category: 'blur',
  icon: EyeOff,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Professional soft gaussian blur.',
  defaultParameters: {"intensity":8,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Radius","key":"intensity","type":"number","min":0,"max":40,"step":1},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.filter = `blur(${params.intensity}px)`;
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`boxblur=${params.intensity}:1`];
  }
};
