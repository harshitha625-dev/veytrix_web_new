import { Monitor } from 'lucide-react';
import { EffectModule } from '../types';

export const crtScreen: EffectModule = {
  id: 'pro-crt-screen',
  name: 'CRT Screen',
  category: 'glitch',
  icon: Monitor,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Retro cathode-ray tube screen grid layout.',
  defaultParameters: {"intensity":0.6,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Grid Opacity","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `rgba(0,0,0,${params.intensity * 0.15})`;
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // Add phosphor scanline vignette
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width * 0.4, canvas.width/2, canvas.height/2, canvas.width * 0.72);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`drawgrid=width=iw:height=4:thickness=1:color=black@${params.intensity},vignette=angle=0.5`];
  }
};
