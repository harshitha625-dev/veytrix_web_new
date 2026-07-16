import { Globe } from 'lucide-react';
import { EffectModule } from '../types';

export const fisheye: EffectModule = {
  id: 'pro-fisheye',
  name: 'Fisheye',
  category: 'distortion',
  icon: Globe,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Wide-angle lens circular barrel distortion.',
  defaultParameters: {"intensity":1.4,"speed":1,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Barrel Scale","key":"intensity","type":"number","min":1,"max":2.2,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDist = dist / maxDist;
        const distortion = Math.pow(normDist, params.intensity);
        const sourceX = Math.max(0, Math.min(w - 1, Math.round(cx + dx * distortion)));
        const sourceY = Math.max(0, Math.min(h - 1, Math.round(cy + dy * distortion)));
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
    return [`lenscorrection=cx=0.5:cy=0.5:k1=0.25:k2=0.08`];
  }
};
