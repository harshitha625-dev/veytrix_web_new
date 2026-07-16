import { History } from 'lucide-react';
import { EffectModule } from '../types';

export const vintageFilm: EffectModule = {
  id: 'pro-vintage-film',
  name: 'Vintage Film',
  category: 'cinematic',
  icon: History,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Golden age organic retro film look.',
  defaultParameters: {"intensity":1,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Aging factor","key":"intensity","type":"number","min":0.2,"max":1.5,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = (r * 0.393 + g * 0.769 + b * 0.189) * params.intensity + r * (1 - params.intensity);
      data[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168) * params.intensity + g * (1 - params.intensity);
      data[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131) * params.intensity + b * (1 - params.intensity);
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131`];
  }
};
