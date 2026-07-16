import { Palette } from 'lucide-react';
import { EffectModule } from '../types';

export const cinematicLUT: EffectModule = {
  id: 'pro-cinematic-lut',
  name: 'Cinematic LUT',
  category: 'cinematic',
  icon: Palette,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Premium block-buster grading: teal shadows, warm skin.',
  defaultParameters: {"intensity":1,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"LUT Opacity","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const cyanFactor = Math.max(0, (255 - r) / 255) * 20 * params.intensity;
      const warmFactor = Math.max(0, r / 255) * 15 * params.intensity;
      data[i] = Math.min(255, r + warmFactor - cyanFactor * 0.2);
      data[i+1] = Math.min(255, g + warmFactor * 0.5 + cyanFactor * 0.5);
      data[i+2] = Math.min(255, b - warmFactor * 0.3 + cyanFactor);
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.15:gs=0.0:bs=-0.15:rm=0.12:gm=-0.02:bm=-0.12,eq=contrast=1.2:saturation=1.25`];
  }
};
