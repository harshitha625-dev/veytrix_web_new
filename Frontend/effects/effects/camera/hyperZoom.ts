import { Expand } from 'lucide-react';
import { EffectModule } from '../types';

export const hyperZoom: EffectModule = {
  id: 'pro-hyper-zoom',
  name: 'Hyper Zoom',
  category: 'camera',
  icon: Expand,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Fast dramatic zoom with motion blur.',
  defaultParameters: {"intensity":1.6,"speed":4,"duration":1.5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Intensity","key":"intensity","type":"number","min":1,"max":3,"step":0.1},{"name":"Speed","key":"speed","type":"number","min":1,"max":8,"step":0.2},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":5,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const speedFactor = (time * params.speed) % Math.PI;
    const scale = 1 + (params.intensity - 1) * Math.pow(Math.sin(speedFactor), 4);
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    // Draw motion blur steps
    for (let i = 0; i < 3; i++) {
      ctx.save();
      const blurScale = 1 + (scale - 1) * (1 - i * 0.05);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(blurScale, blurScale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.globalAlpha = params.opacity * (1 - i * 0.3);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=iw*${params.intensity}:ih*${params.intensity},crop=iw/${params.intensity}:ih/${params.intensity},gblur=sigma=2`];
  }
};
