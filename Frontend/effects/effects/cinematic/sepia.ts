import { Sunset } from 'lucide-react';
import { EffectModule } from '../types';

export const sepia: EffectModule = {
  id: 'pro-sepia',
  name: 'Classic Sepia',
  category: 'cinematic',
  icon: Sunset,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm brown-wash old photograph filter.',
  defaultParameters: {"intensity":1,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Warmth","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.filter = `sepia(${params.intensity})`;
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131`];
  }
};
