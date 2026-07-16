import { Tv } from 'lucide-react';
import { EffectModule } from '../types';

export const analogTV: EffectModule = {
  id: 'pro-analog-tv',
  name: 'Analog TV',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Old CRT television screen filter with curved scan lines.',
  defaultParameters: {"intensity":0.5,"speed":1.2,"duration":5,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Curvature","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Scan Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw scan lines
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Dynamic flickering
    const flicker = 0.95 + 0.05 * Math.sin(time * 65);
    ctx.fillStyle = `rgba(255,255,255,${0.03 * flicker})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vignette corners mimicking CRT glass curvature
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height*0.5, canvas.width/2, canvas.height/2, canvas.width*0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`vignette=PI/4`];
  }
};
