import { Flame } from 'lucide-react';
import { EffectModule } from '../types';

export const heatWave: EffectModule = {
  id: 'pro-heat-wave',
  name: 'Heat Wave',
  category: 'distortion',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vertical shimmer heat-haze distortion.',
  defaultParameters: {"intensity":8,"speed":3,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Heat Power","key":"intensity","type":"number","min":2,"max":25,"step":0.5}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const phase = time * params.speed * 3.5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const offset = Math.cos(x * 0.02 + phase) * params.intensity * 0.72;
        const sourceY = Math.max(0, Math.min(h - 1, Math.round(y + offset)));
        const destIdx = (y * w + x) * 4;
        const srcIdx = (sourceY * w + x) * 4;
        data[destIdx] = temp[srcIdx];
        data[destIdx + 1] = temp[srcIdx + 1];
        data[destIdx + 2] = temp[srcIdx + 2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X,Y+cos(X/8)*${params.intensity})':g='p(X,Y+cos(X/8)*${params.intensity})':b='p(X,Y+cos(X/8)*${params.intensity})'`];
  }
};
