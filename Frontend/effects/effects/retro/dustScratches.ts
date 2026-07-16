import { Sparkles } from 'lucide-react';
import { EffectModule } from '../types';

export const dustScratches: EffectModule = {
  id: 'pro-dust-scratches',
  name: 'Dust & Scratches',
  category: 'retro',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vintage dust spots, noise specs, and vertical scratches.',
  defaultParameters: {"intensity":0.4,"speed":2,"duration":5,"opacity":0.7,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Scratches","key":"intensity","type":"number","min":0.1,"max":1.5,"step":0.05},{"name":"Flicker Speed","key":"speed","type":"number","min":0.5,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    ctx.globalAlpha = params.opacity;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    const spotsCount = Math.round(params.intensity * 15);
    // Draw black/white dust spots
    for (let i = 0; i < spotsCount; i++) {
      if (Math.random() < 0.6) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        const radius = Math.random() * 2.5 + 0.5;
        ctx.arc(rx, ry, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vertical scratches lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.8;
    if (Math.random() < 0.35 * params.intensity) {
      ctx.beginPath();
      const lx = Math.random() * canvas.width;
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + (Math.random() - 0.5) * 8, canvas.height);
      ctx.stroke();
    }

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`noise=alls=12:allf=t+u`];
  }
};
