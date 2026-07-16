import { Camera } from 'lucide-react';
import { EffectModule } from '../types';

export const oldCamera: EffectModule = {
  id: 'pro-old-camera',
  name: 'Old Camera',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Old viewfinder look with camera status overlays.',
  defaultParameters: {"intensity":0.4,"speed":1,"duration":5,"opacity":0.9,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Vignette","key":"intensity","type":"number","min":0.1,"max":0.8,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Sepia tone
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
      data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
      data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
    }
    ctx.putImageData(imageData, 0, 0);

    // Old view finder lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    // Crosshair in center
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 10, canvas.height/2);
    ctx.lineTo(canvas.width/2 + 10, canvas.height/2);
    ctx.moveTo(canvas.width/2, canvas.height/2 - 10);
    ctx.lineTo(canvas.width/2, canvas.height/2 + 10);
    ctx.stroke();

    // Corner guides
    const m = 20;
    ctx.beginPath();
    ctx.moveTo(m, m + 15); ctx.lineTo(m, m); ctx.lineTo(m + 15, m);
    ctx.moveTo(canvas.width - m, m + 15); ctx.lineTo(canvas.width - m, m); ctx.lineTo(canvas.width - m - 15, m);
    ctx.moveTo(m, canvas.height - m - 15); ctx.lineTo(m, canvas.height - m); ctx.lineTo(m + 15, canvas.height - m);
    ctx.moveTo(canvas.width - m, canvas.height - m - 15); ctx.lineTo(canvas.width - m, canvas.height - m); ctx.lineTo(canvas.width - m - 15, canvas.height - m);
    ctx.stroke();

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`sepia`];
  }
};
