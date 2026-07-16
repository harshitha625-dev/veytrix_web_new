import { Diamond } from 'lucide-react';
import { EffectModule } from '../types';

export const crystal: EffectModule = {
  id: 'pro-crystal',
  name: 'Crystal',
  category: 'distortion',
  icon: Diamond,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Crystallized faceted look with sharp edges.',
  defaultParameters: {"intensity":8,"speed":0,"duration":5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Facet Size","key":"intensity","type":"number","min":3,"max":20,"step":1},{"name":"Animate","key":"speed","type":"number","min":0,"max":2,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const blockSize = Math.max(2, Math.round(params.intensity));
    for (let y = 0; y < h; y += blockSize) {
      for (let x = 0; x < w; x += blockSize) {
        const cx = Math.min(x + Math.floor(blockSize/2), w-1);
        const cy = Math.min(y + Math.floor(blockSize/2), h-1);
        const ci = (cy*w+cx)*4;
        const r=data[ci], g=data[ci+1], b=data[ci+2];
        for (let dy=0; dy<blockSize && y+dy<h; dy++) {
          for (let dx=0; dx<blockSize && x+dx<w; dx++) {
            const di = ((y+dy)*w+(x+dx))*4;
            data[di]=r; data[di+1]=g; data[di+2]=b;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // Add edge highlights
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    for (let y=0; y<h; y+=blockSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    for (let x=0; x<w; x+=blockSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    const s = Math.max(2, Math.round(params.intensity));
    return [`scale=iw/${s}:ih/${s},scale=iw*${s}:ih*${s}:flags=neighbor`];
  }
};
