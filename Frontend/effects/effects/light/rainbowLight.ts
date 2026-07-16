import { Rainbow as RainbowIcon } from 'lucide-react';
import { EffectModule } from '../types';

export const rainbowLight: EffectModule = {
  id: 'pro-rainbow-light',
  name: 'Rainbow Light',
  category: 'light',
  icon: RainbowIcon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Animated rainbow color wash sweeping across the frame.',
  defaultParameters: {"intensity":0.3,"speed":1,"duration":5,"opacity":0.3,"blendMode":"overlay","enabled":true},
  adjustableParameters: [{"name":"Color Intensity","key":"intensity","type":"number","min":0.1,"max":0.7,"step":0.05},{"name":"Sweep Speed","key":"speed","type":"number","min":0.2,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":0.6,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["overlay","screen","color-dodge","normal"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    const offset = time * params.speed * 100;
    const grad = ctx.createLinearGradient(-offset % (canvas.width*2), 0, canvas.width + (-offset % (canvas.width*2)), canvas.height);
    const colors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff','#ff0088'];
    colors.forEach((c, i) => { grad.addColorStop(i / (colors.length-1), c); });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`hue=h=t*${params.speed*30}:s=1.2,eq=saturation=1.3`];
  }
};
