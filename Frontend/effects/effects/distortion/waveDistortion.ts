import { Activity } from 'lucide-react';
import { EffectModule } from '../types';

export const waveDistortion: EffectModule = {
  id: 'pro-wave-distortion',
  name: 'Wave Distortion',
  category: 'distortion',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Double sinusoidal flag wave style effect.',
  defaultParameters: {"intensity":18,"speed":1.5,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Wave Width","key":"intensity","type":"number","min":4,"max":50,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const phaseX = time * params.speed * 2.5;
    const phaseY = time * params.speed * 1.8;
    for (let y = 0; y < h; y++) {
      const offsetX = Math.sin(y * 0.03 + phaseX) * params.intensity;
      for (let x = 0; x < w; x++) {
        const offsetY = Math.cos(x * 0.03 + phaseY) * params.intensity * 0.5;
        const sourceX = Math.max(0, Math.min(w - 1, Math.round(x + offsetX)));
        const sourceY = Math.max(0, Math.min(h - 1, Math.round(y + offsetY)));
        const destIdx = (y * w + x) * 4;
        const srcIdx = (sourceY * w + sourceX) * 4;
        data[destIdx] = temp[srcIdx];
        data[destIdx + 1] = temp[srcIdx + 1];
        data[destIdx + 2] = temp[srcIdx + 2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X+sin(Y/12)*${params.intensity},Y+cos(X/12)*${params.intensity})':g='p(X+sin(Y/12)*${params.intensity},Y+cos(X/12)*${params.intensity})':b='p(X+sin(Y/12)*${params.intensity},Y+cos(X/12)*${params.intensity})'`];
  }
};
