import { Pause } from 'lucide-react';
import { EffectModule } from '../types';

export const freezeFrame: EffectModule = {
  id: 'pro-freeze-frame',
  name: 'Freeze Frame',
  category: 'motion',
  icon: Pause,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Dramatic freeze with zoom and brightness flash.',
  defaultParameters: {"intensity":1.15,"speed":2,"duration":2,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Zoom Punch","key":"intensity","type":"number","min":1,"max":1.5,"step":0.02},{"name":"Flash Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":5,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const cycle = (time * params.speed) % 3;
    const isFrozen = cycle > 1.5;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    if (isFrozen) {
      const flashProgress = (cycle - 1.5) / 1.5;
      const scale = 1 + (params.intensity - 1) * (1 - flashProgress);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(255,255,255,${0.3 * (1 - flashProgress)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`eq=brightness=0.04:contrast=1.05,zoompan=z='1+${(params.intensity-1).toFixed(2)}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
