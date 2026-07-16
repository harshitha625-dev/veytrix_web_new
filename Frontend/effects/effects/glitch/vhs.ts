import { Tv } from 'lucide-react';
import { EffectModule } from '../types';

export const vhs: EffectModule = {
  id: 'pro-vhs',
  name: 'VHS Screen',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Analog video tape noise and tracking glitch.',
  defaultParameters: {"intensity":10,"speed":2,"duration":4,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Analog Noise","key":"intensity","type":"number","min":2,"max":30,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;
    const len = d.length;
    // Fast color offset noise
    for (let i = 0; i < len; i += 400) {
      if (Math.random() < 0.15) {
        const shiftVal = Math.round((Math.random() - 0.5) * params.intensity);
        d[i] = d[Math.max(0, Math.min(len - 1, i + shiftVal * 4))];
        d[i+1] = d[Math.max(0, Math.min(len - 1, i + shiftVal * 4 + 1))];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // Draw moving static line
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const scanY = (time * 120) % canvas.height;
    ctx.fillRect(0, scanY, canvas.width, 3);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`chromashift=cbh=3:cbv=2,noise=alls=10:allf=t+u`];
  }
};
