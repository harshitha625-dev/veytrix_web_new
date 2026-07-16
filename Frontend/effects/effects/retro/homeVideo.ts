import { Tv } from 'lucide-react';
import { EffectModule } from '../types';

export const homeVideo: EffectModule = {
  id: 'pro-home-video',
  name: 'Home Video',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '90s home video VHS style color saturation and time overlays.',
  defaultParameters: {"intensity":0.6,"speed":1,"duration":4,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Color Bleed","key":"intensity","type":"number","min":0.1,"max":1.5,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","screen","multiply"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Oversaturated colors with VHS color shift
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.15); // Oversaturate Red
      data[i+1] = Math.min(255, data[i+1] * 1.05); // Oversaturate Green
      data[i+2] = Math.min(255, data[i+2] * 0.95);  // Desaturate Blue
    }
    ctx.putImageData(imageData, 0, 0);

    // Play HUD Text overlay
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 12px Courier, monospace';
    ctx.fillText('PLAY', 25, 30);
    ctx.fillText('SP', 25, 45);

    // Time stamp overlay
    const pad = (n: number) => String(n).padStart(2, '0');
    const h = pad(Math.floor(time / 3600) % 24);
    const m = pad(Math.floor(time / 60) % 60);
    const s = pad(Math.floor(time) % 60);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`AM 12:${m}:${s}`, canvas.width - 120, canvas.height - 30);
    ctx.fillText('OCT. 24 1994', 25, canvas.height - 30);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.1:gs=0.05:bs=-0.1,noise=alls=10:allf=t+u`];
  }
};
