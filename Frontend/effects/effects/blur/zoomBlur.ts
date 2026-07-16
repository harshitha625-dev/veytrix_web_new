import { Maximize } from 'lucide-react';
import { EffectModule } from '../types';

export const zoomBlur: EffectModule = {
  id: 'pro-zoom-blur',
  name: 'Zoom Blur',
  category: 'blur',
  icon: Maximize,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Radial blur expanding from the center.',
  defaultParameters: {"intensity":1.15,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Scale factor","key":"intensity","type":"number","min":1,"max":1.4,"step":0.02}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = params.opacity * 0.15;
    for (let i = 1; i <= 5; i++) {
      const scale = 1 + (params.intensity - 1) * (i / 5);
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width/2, -canvas.height/2);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=iw*${params.intensity}:ih*${params.intensity},crop=iw/${params.intensity}:ih/${params.intensity},gblur=sigma=1.5`];
  }
};
