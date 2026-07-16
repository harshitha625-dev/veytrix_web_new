import { Scissors } from 'lucide-react';
import { EffectModule } from '../types';

export const dustOverlay: EffectModule = {
  id: 'pro-dust-overlay',
  name: 'Dust Overlay',
  category: 'cinematic',
  icon: Scissors,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Retro projector dust, scratches and specs.',
  defaultParameters: {"intensity":0.5,"speed":1.5,"duration":5,"opacity":0.25,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Amount","key":"intensity","type":"number","min":0.1,"max":2,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `rgba(255, 255, 255, ${params.opacity})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${params.opacity})`;
    const count = Math.round(params.intensity * 4);
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.3) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (Math.random()-0.5)*15, startY + (Math.random()-0.5)*15, startX + (Math.random()-0.5)*30, startY + (Math.random()-0.5)*30);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`noise=alls=10:allf=t+u`];
  }
};
