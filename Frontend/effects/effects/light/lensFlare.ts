import { Sparkles } from 'lucide-react';
import { EffectModule } from '../types';

export const lensFlare: EffectModule = {
  id: 'pro-lens-flare',
  name: 'Lens Flare',
  category: 'light',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Anamorphic lens flare streak across the frame.',
  defaultParameters: {"intensity":0.5,"speed":1,"duration":4,"opacity":0.6,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Flare Size","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Movement","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","color-dodge","overlay","normal"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    const cx = canvas.width * (0.3 + 0.4 * Math.sin(time * params.speed * 0.5));
    const cy = canvas.height * 0.35;
    // Main flare circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * params.intensity * 0.3);
    grad.addColorStop(0, 'rgba(255,240,200,0.9)');
    grad.addColorStop(0.3, 'rgba(255,200,100,0.4)');
    grad.addColorStop(1, 'rgba(255,150,50,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Horizontal streak
    const streakGrad = ctx.createLinearGradient(0, cy - 2, 0, cy + 4);
    streakGrad.addColorStop(0, 'rgba(255,220,150,0)');
    streakGrad.addColorStop(0.5, `rgba(255,220,150,${params.intensity * 0.6})`);
    streakGrad.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, cy - 3, canvas.width, 6);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`eq=brightness=0.06:contrast=1.05,colorbalance=rs=0.1:gs=0.05`];
  }
};
