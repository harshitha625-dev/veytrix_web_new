import { Flame } from 'lucide-react';
import { EffectModule } from '../types';

export const melt: EffectModule = {
  id: 'pro-melt',
  name: 'Melt',
  category: 'distortion',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vertical drip melt deformation.',
  defaultParameters: {"intensity":10,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Melt Amount","key":"intensity","type":"number","min":2,"max":35,"step":1},{"name":"Melt Speed","key":"speed","type":"number","min":0.3,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const t = time * params.speed;
    for (let x = 0; x < w; x++) {
      const drip = Math.sin(x * 0.05 + t) * Math.cos(x * 0.02) * params.intensity;
      for (let y = 0; y < h; y++) {
        const sy = Math.max(0, Math.min(h - 1, Math.round(y - drip)));
        const di = (y * w + x) * 4;
        const si = (sy * w + x) * 4;
        data[di] = temp[si];
        data[di + 1] = temp[si + 1];
        data[di + 2] = temp[si + 2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X,Y+sin(X/20)*${params.intensity})':g='p(X,Y+sin(X/20)*${params.intensity})':b='p(X,Y+sin(X/20)*${params.intensity})'`];
  }
};
