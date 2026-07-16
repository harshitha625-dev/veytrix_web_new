import { Film } from 'lucide-react';
import { EffectModule } from '../types';

export const silentMovie: EffectModule = {
  id: 'pro-silent-movie',
  name: 'Silent Movie',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '1920s high contrast monochrome silent film simulation.',
  defaultParameters: {"intensity":0.6,"speed":1.8,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Contrast","key":"intensity","type":"number","min":0.3,"max":1.5,"step":0.05},{"name":"Flicker Rate","key":"speed","type":"number","min":0.5,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    
    // High contrast black and white
    const threshold = 128;
    const factor = (259 * (params.intensity * 128 + 255)) / (255 * (259 - params.intensity * 128));
    for (let i = 0; i < len; i += 4) {
      const v = (data[i] + data[i+1] + data[i+2]) / 3;
      const finalVal = factor * (v - 128) + 128;
      const b = Math.max(0, Math.min(255, finalVal));
      data[i] = b; data[i+1] = b; data[i+2] = b;
    }
    ctx.putImageData(imageData, 0, 0);

    // Old vintage projector vignette & flickering brightness
    const flicker = 0.8 + 0.2 * Math.sin(time * params.speed * 18);
    ctx.fillStyle = `rgba(255,255,255,${0.08 * flicker})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vignette
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.35, canvas.width/2, canvas.height/2, canvas.width*0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`format=gray,eq=contrast=1.4:brightness=-0.05`];
  }
};
