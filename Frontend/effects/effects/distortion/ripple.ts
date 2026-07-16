import { Waves } from 'lucide-react';
import { EffectModule } from '../types';

export const ripple: EffectModule = {
  id: 'pro-ripple',
  name: 'Ripple',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Liquid sine-wave displacement animation.',
  defaultParameters: {"intensity":15,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Strength","key":"intensity","type":"number","min":2,"max":40,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const phase = time * params.speed * 4;
    for (let y = 0; y < h; y++) {
      const offset = Math.sin(y * 0.05 + phase) * params.intensity;
      for (let x = 0; x < w; x++) {
        const sourceX = Math.max(0, Math.min(w - 1, Math.round(x + offset)));
        const destIdx = (y * w + x) * 4;
        const srcIdx = (y * w + sourceX) * 4;
        data[destIdx] = temp[srcIdx];
        data[destIdx + 1] = temp[srcIdx + 1];
        data[destIdx + 2] = temp[srcIdx + 2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X+sin(Y/10)*${params.intensity},Y)':g='p(X+sin(Y/10)*${params.intensity},Y)':b='p(X+sin(Y/10)*${params.intensity},Y)'`];
  }
};
