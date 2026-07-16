import { Clapperboard } from 'lucide-react';
import { EffectModule } from '../types';

export const cinematicZoom: EffectModule = {
  id: 'pro-cinematic-zoom',
  name: 'Cinematic Zoom',
  category: 'camera',
  icon: Clapperboard,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Slow dramatic zoom with letterbox vignette.',
  defaultParameters: {"intensity":1.2,"speed":0.8,"duration":6,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Zoom Depth","key":"intensity","type":"number","min":1,"max":2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":15,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const progress = (time * params.speed * 0.1) % 1;
    const eased = progress * progress * (3 - 2 * progress);
    const scale = 1 + (params.intensity - 1) * eased;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Letterbox bars
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const barH = canvas.height * 0.08;
    ctx.fillRect(0, 0, canvas.width, barH);
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
    // Vignette
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.3, canvas.width/2, canvas.height/2, canvas.width*0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*(on/duration)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720,vignette=PI/4`];
  }
};
