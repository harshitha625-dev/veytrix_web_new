import { Eye } from 'lucide-react';
import { EffectModule } from '../types';

export const tunnel: EffectModule = {
  id: 'pro-tunnel',
  name: 'Tunnel',
  category: 'distortion',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Radial vortex tunnel perspective effect.',
  defaultParameters: {"intensity":0.5,"speed":1.5,"duration":5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Depth","key":"intensity","type":"number","min":0.1,"max":1.5,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.3,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const cx = w / 2, cy = h / 2;
    const phase = time * params.speed;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          const r = dist / (w * 0.5);
          const factor = Math.max(0.1, 1 - params.intensity * Math.log(r + 0.1) * 0.3);
          const angle = Math.atan2(dy, dx) + phase * 0.2;
          const sx = Math.round(cx + Math.cos(angle) * dist * factor);
          const sy = Math.round(cy + Math.sin(angle) * dist * factor);
          if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
            const di = (y * w + x) * 4;
            const si = (sy * w + sx) * 4;
            data[di] = temp[si]; data[di+1] = temp[si+1]; data[di+2] = temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`lenscorrection=k1=${params.intensity}:k2=${params.intensity}`];
  }
};
