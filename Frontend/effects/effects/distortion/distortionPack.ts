import { 
  Waves, Eye, Maximize, Minimize, Compass, RotateCw, Wind as WindIcon, HelpCircle
} from 'lucide-react';
import { EffectModule } from '../types';

const makeDefaultParams = (intensity: number, speed: number) => ({
  intensity,
  speed,
  duration: 4,
  opacity: 1,
  blendMode: 'normal',
  enabled: true
});

const makeAdjustableParams = (name: string, min = 1, max = 20, step = 0.5) => [
  { name, key: 'intensity', type: 'number' as const, min, max, step },
  { name: 'Speed', key: 'speed', type: 'number' as const, min: 0.1, max: 5, step: 0.1 },
  { name: 'Duration', key: 'duration', type: 'number' as const, min: 0.5, max: 10, step: 0.5 },
  { name: 'Opacity', key: 'opacity', type: 'number' as const, min: 0, max: 1, step: 0.05 },
  { name: 'Blend Mode', key: 'blendMode', type: 'select' as const, options: ['normal', 'multiply', 'screen', 'overlay'] }
];

export const spiral: EffectModule = {
  id: 'pro-spiral',
  name: 'Spiral',
  category: 'distortion',
  icon: RotateCw,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Concentric spiral swirl rotation warp.',
  defaultParameters: makeDefaultParams(2.5, 1.2),
  adjustableParameters: makeAdjustableParams('Swirl Count', 0.5, 5, 0.1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2, cy = h/2;
    const maxR = Math.min(w,h)*0.45;
    const twist = params.intensity;
    for (let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < maxR){
          const r = dist/maxR;
          const angle = Math.atan2(dy,dx) + twist * Math.sin(time*params.speed) * (1-r);
          const sx = Math.round(cx + Math.cos(angle)*dist);
          const sy = Math.round(cy + Math.sin(angle)*dist);
          if (sx>=0 && sx<w && sy>=0 && sy<h) {
            const di=(y*w+x)*4, si=(sy*w+sx)*4;
            d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`rotate='${params.intensity}*sin(t*${params.speed})*(1-sqrt(X*X+Y*Y)/W)'`]
};

export const blackHole: EffectModule = {
  id: 'pro-black-hole',
  name: 'Black Hole',
  category: 'distortion',
  icon: Minimize,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Infinite pull gravity center warp.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Pull Force', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2, cy = h/2;
    const maxR = Math.min(w,h)*0.45;
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < maxR){
          const r = dist/maxR;
          const factor = Math.pow(r, 1 + params.intensity);
          const sx = Math.round(cx + dx * (factor/r));
          const sy = Math.round(cy + dy * (factor/r));
          const di = (y*w+x)*4;
          if (sx>=0 && sx<w && sy>=0 && sy<h) {
            const si=(sy*w+sx)*4;
            d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`lenscorrection=k1=-${params.intensity}`]
};

export const portal: EffectModule = {
  id: 'pro-portal',
  name: 'Portal',
  category: 'distortion',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Spinning mirror dimension tunnel.',
  defaultParameters: makeDefaultParams(1.3, 2),
  adjustableParameters: makeAdjustableParams('Vortex Depth', 1, 2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2, cy = h/2;
    const phase = time * params.speed;
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const r = dist/(w*0.5);
        if(r < 0.9) {
          const factor = 1 - (params.intensity - 1) * Math.log(r+0.1);
          const angle = Math.atan2(dy, dx) + phase;
          const sx = Math.round(cx + Math.cos(angle)*dist*factor);
          const sy = Math.round(cy + Math.sin(angle)*dist*factor);
          const di = (y*w+x)*4;
          if (sx>=0 && sx<w && sy>=0 && sy<h) {
            const si=(sy*w+sx)*4;
            d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`lenscorrection=k1=0.25`]
};

export const tornado: EffectModule = {
  id: 'pro-tornado',
  name: 'Tornado',
  category: 'distortion',
  icon: RotateCw,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vertical swirl funnel deformation.',
  defaultParameters: makeDefaultParams(3, 1.5),
  adjustableParameters: makeAdjustableParams('Vortex Width', 1, 8, 0.2),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2;
    const twist = params.intensity;
    for(let y=0; y<h; y++){
      const factor = (h - y)/h;
      const angle = Math.sin(time*params.speed)*twist*factor;
      for(let x=0; x<w; x++){
        const dx = x - cx;
        const sx = Math.round(cx + dx * Math.cos(angle));
        const di = (y*w+x)*4;
        if(sx>=0 && sx<w){
          const si = (y*w+sx)*4;
          d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`rotate='${params.intensity}*PI/180*sin(t*${params.speed})'`]
};

export const wind: EffectModule = {
  id: 'pro-wind-distortion',
  name: 'Wind',
  category: 'distortion',
  icon: WindIcon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Horizontal wind streak displacement.',
  defaultParameters: makeDefaultParams(10, 1.8),
  adjustableParameters: makeAdjustableParams('Wind Speed', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed * 4;
    for(let y=0; y<h; y++){
      const offset = Math.round(Math.sin(y*0.02 + t) * params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x + offset));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/20)*${params.intensity},Y)'`]
};

export const smokeWarp: EffectModule = {
  id: 'pro-smoke-warp',
  name: 'Smoke Warp',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Organic undulating smoke-like displacement.',
  defaultParameters: makeDefaultParams(12, 1.2),
  adjustableParameters: makeAdjustableParams('Smoke Flow', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed;
    for (let y=0; y<h; y++){
      const ox = Math.round(Math.sin(y*0.03 + t)*params.intensity + Math.sin(y*0.07 + t*2.1)*params.intensity*0.4);
      for(let x=0; x<w; x++){
        const oy = Math.round(Math.cos(x*0.03 + t)*params.intensity*0.3);
        const sx = Math.max(0, Math.min(w-1, x+ox));
        const sy = Math.max(0, Math.min(h-1, y+oy));
        const di=(y*w+x)*4, si=(sy*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/30)*${params.intensity},Y+cos(X/30)*${Math.round(params.intensity/2)})'`]
};

export const inkFlow: EffectModule = {
  id: 'pro-ink-flow',
  name: 'Ink Flow',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Heavy paint blending fluid simulation.',
  defaultParameters: makeDefaultParams(15, 1),
  adjustableParameters: makeAdjustableParams('Viscosity', 3, 30, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed * 0.8;
    for(let y=0; y<h; y++){
      const ox = Math.round(Math.sin(y*0.025 + t*1.5)*params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x + ox));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/25)*${params.intensity},Y)'`]
};

export const waterSurface: EffectModule = {
  id: 'pro-water-surface',
  name: 'Water Surface',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Soft rippling lake surface reflection warp.',
  defaultParameters: makeDefaultParams(8, 2),
  adjustableParameters: makeAdjustableParams('Ripple Height', 2, 20, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed * 3.5;
    for(let y=0; y<h; y++){
      const ox = Math.round(Math.sin(y*0.06 + t) * params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x + ox));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/12)*${params.intensity},Y)'`]
};

export const oceanWave: EffectModule = {
  id: 'pro-ocean-wave',
  name: 'Ocean Wave',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Rolling swell diagonal wave warp.',
  defaultParameters: makeDefaultParams(12, 1.5),
  adjustableParameters: makeAdjustableParams('Swell Force', 3, 30, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed * 2;
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const ox = Math.round(Math.sin((x+y)*0.03 + t)*params.intensity);
        const sx = Math.max(0, Math.min(w-1, x + ox));
        const di = (y*w+x)*4, si=(y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin((X+Y)/30)*${params.intensity},Y)'`]
};

export const lavaFlow: EffectModule = {
  id: 'pro-lava-flow',
  name: 'Lava Flow',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Viscous thick melting flow warp.',
  defaultParameters: makeDefaultParams(18, 0.8),
  adjustableParameters: makeAdjustableParams('Viscosity', 5, 45, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed;
    for(let y=0; y<h; y++){
      const ox = Math.round(Math.sin(y*0.015 + t*1.2)*params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x + ox));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/45)*${params.intensity},Y)'`]
};

export const jelly: EffectModule = {
  id: 'pro-jelly',
  name: 'Jelly',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Squishy springy gelatin bounce warp.',
  defaultParameters: makeDefaultParams(8, 2),
  adjustableParameters: makeAdjustableParams('Jiggle', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const t = time * params.speed;
    const scaleX = 1 + Math.sin(t*5)*params.intensity*0.006;
    const scaleY = 1 + Math.cos(t*4.3)*params.intensity*0.006;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*(1+${params.intensity*0.006}*sin(t*5)):ih*(1+${params.intensity*0.006}*cos(t*4))`]
};

export const rubber: EffectModule = {
  id: 'pro-rubber',
  name: 'Rubber',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Snapping rubber-band lateral stretching.',
  defaultParameters: makeDefaultParams(10, 2.5),
  adjustableParameters: makeAdjustableParams('Elongation', 3, 30, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const cycle = (time * params.speed) % Math.PI;
    const stretch = 1 + (params.intensity*0.01) * Math.sin(cycle);
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(stretch, 1/stretch);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*(1+${params.intensity*0.01}*sin(t)):ih/(1+${params.intensity*0.01}*sin(t))`]
};

export const stretchX: EffectModule = {
  id: 'pro-stretch-x',
  name: 'Stretch X',
  category: 'distortion',
  icon: Maximize,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Wide horizontal aspect ratio stretch.',
  defaultParameters: makeDefaultParams(1.3, 0),
  adjustableParameters: makeAdjustableParams('Width Scale', 1.05, 1.8, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(params.intensity, 1);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*${params.intensity}:ih,crop=iw/${params.intensity}:ih`]
};

export const stretchY: EffectModule = {
  id: 'pro-stretch-y',
  name: 'Stretch Y',
  category: 'distortion',
  icon: Maximize,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Tall vertical aspect ratio stretch.',
  defaultParameters: makeDefaultParams(1.3, 0),
  adjustableParameters: makeAdjustableParams('Height Scale', 1.05, 1.8, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(1, params.intensity);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw:ih*${params.intensity},crop=iw:ih/${params.intensity}`]
};

export const flipWarp: EffectModule = {
  id: 'pro-flip-warp',
  name: 'Flip Warp',
  category: 'distortion',
  icon: Compass,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '3D horizontal flipping animation.',
  defaultParameters: makeDefaultParams(1.5, 1),
  adjustableParameters: makeAdjustableParams('Flipping Speed', 0.2, 3, 0.1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const scale = Math.cos(time * params.speed);
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(scale, 1);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`identity`]
};

export const fold: EffectModule = {
  id: 'pro-fold',
  name: 'Fold',
  category: 'distortion',
  icon: Minimize,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Accordion center-folding paper warp.',
  defaultParameters: makeDefaultParams(1.3, 0),
  adjustableParameters: makeAdjustableParams('Fold Creases', 1.05, 1.6, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    
    // Fold vertical columns inwards
    const foldFactor = params.intensity;
    const half = w/2;
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x - half;
        const sx = Math.round(half + dx / foldFactor);
        const di = (y*w+x)*4;
        if(sx>=0 && sx<w) {
          const si = (y*w+sx)*4;
          d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw/${params.intensity}:ih,crop=iw:ih`]
};

export const bubble: EffectModule = {
  id: 'pro-bubble',
  name: 'Bubble',
  category: 'distortion',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Expanding radial bubble lens refract.',
  defaultParameters: makeDefaultParams(0.4, 1),
  adjustableParameters: makeAdjustableParams('Lens Bubble', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2, cy = h/2;
    const pulse = 1 + 0.15*Math.sin(time*params.speed);
    const maxR = Math.min(w,h)*params.intensity*pulse * 0.55;
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < maxR){
          const r = dist / maxR;
          const shift = Math.pow(r, 0.75) * maxR;
          const angle = Math.atan2(dy, dx);
          const sx = Math.round(cx + Math.cos(angle)*shift);
          const sy = Math.round(cy + Math.sin(angle)*shift);
          const di = (y*w+x)*4;
          if (sx>=0 && sx<w && sy>=0 && sy<h) {
            const si=(sy*w+sx)*4;
            d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`lenscorrection=k1=${params.intensity}`]
};

export const crystalGlass: EffectModule = {
  id: 'pro-crystal-glass',
  name: 'Crystal Glass',
  category: 'distortion',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Crystalline multi-facet refraction grid.',
  defaultParameters: makeDefaultParams(12, 0),
  adjustableParameters: makeAdjustableParams('Facet Count', 4, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const size = Math.round(params.intensity);
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        // Sample center pixel of each facet
        const cx = Math.min(x + Math.floor(size/2), w-1);
        const cy = Math.min(y + Math.floor(size/2), h-1);
        const ci = (cy*w+cx)*4;
        const r=d[ci], g=d[ci+1], b=d[ci+2];
        for(let dy=0; dy<size && y+dy<h; dy++) {
          for(let dx=0; dx<size && x+dx<w; dx++) {
            const di = ((y+dy)*w+(x+dx))*4;
            d[di]=r; d[di+1]=g; d[di+2]=b;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    const s = Math.round(params.intensity);
    return [`scale=iw/${s}:ih/${s},scale=iw*${s}:ih*${s}:flags=neighbor`];
  }
};

export const diamond: EffectModule = {
  id: 'pro-diamond',
  name: 'Diamond',
  category: 'distortion',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Diamond shape kaleidoscope reflection.',
  defaultParameters: makeDefaultParams(10, 0),
  adjustableParameters: makeAdjustableParams('Facets', 3, 20, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Draw cross reflection overlay
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.25;
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(Math.PI/4);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`identity`]
};

export const liquidGlass: EffectModule = {
  id: 'pro-liquid-glass',
  name: 'Liquid Glass',
  category: 'distortion',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Melting thick refractive glass flow.',
  defaultParameters: makeDefaultParams(12, 1.2),
  adjustableParameters: makeAdjustableParams('Refraction Index', 3, 30, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed * 2.2;
    for (let y=0; y<h; y++){
      const ox = Math.round(Math.sin(y*0.04 + t)*params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x+ox));
        const di=(y*w+x)*4, si=(y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/25)*${params.intensity},Y)'`]
};
