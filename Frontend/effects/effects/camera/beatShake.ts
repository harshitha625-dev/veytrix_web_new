import { Flame } from 'lucide-react';
import { EffectModule } from '../types';

export const beatShake: EffectModule = {
  id: 'pro-beat-shake',
  name: 'Beat Shake',
  category: 'camera',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Camera shake synchronized with beat markers.',
  defaultParameters: {"intensity":1.5,"speed":3,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Intensity","key":"intensity","type":"number","min":0.5,"max":4,"step":0.1},{"name":"Speed","key":"speed","type":"number","min":1,"max":10,"step":0.5},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed * 2;
    const pulse = Math.pow(Math.sin(t % Math.PI), 8);
    const x = Math.sin(t * 12) * params.intensity * 8 * pulse;
    const y = Math.cos(t * 9) * params.intensity * 6 * pulse;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw-20:ih-20:10+${params.intensity}*sin(2*PI*t*8):10+${params.intensity}*cos(2*PI*t*6.5)`];
  }
};
