import { CassetteTape } from 'lucide-react';
import { EffectModule } from '../types';

export const tapeNoise: EffectModule = {
  id: 'pro-tape-noise',
  name: 'Tape Noise',
  category: 'retro',
  icon: CassetteTape,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Analog video magnetic tape noise, color distortion, and rolling bars.',
  defaultParameters: {"intensity":0.5,"speed":1.5,"duration":4,"opacity":0.6,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Noise Strength","key":"intensity","type":"number","min":0.1,"max":1.2,"step":0.05},{"name":"Rolling Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","screen","multiply"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    
    // RGB split + scan line noise
    const shift = Math.round(params.intensity * 8);
    for (let y = 0; y < h; y++) {
      const isNoiseLine = Math.random() < 0.05 * params.intensity;
      const lineShift = isNoiseLine ? Math.round((Math.random() - 0.5) * 15) : 0;
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) * 4;
        const sx = Math.max(0, Math.min(w - 1, x + lineShift + shift));
        const si = (y * w + sx) * 4;
        data[di] = data[si]; // Shift red channel
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Dynamic horizontal rolling tape bars
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    const barY = (time * params.speed * 80) % canvas.height;
    ctx.fillRect(0, barY, canvas.width, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, (barY + 150) % canvas.height, canvas.width, 6);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`chromashift=cbh=4:cbv=2,noise=alls=15:allf=t+u`];
  }
};
