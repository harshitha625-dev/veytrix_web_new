import { Gauge } from 'lucide-react';
import { EffectModule } from '../types';

export const speedRamp: EffectModule = {
  id: 'pro-speed-ramp',
  name: 'Speed Ramp',
  category: 'camera',
  icon: Gauge,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Smooth acceleration and slow-motion effect.',
  defaultParameters: {"intensity":2,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Speed multiplier","key":"intensity","type":"number","min":0.25,"max":4,"step":0.25}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    const stretch = 1 / params.intensity; return [`setpts=${stretch.toFixed(3)}*PTS`];
  }
};
