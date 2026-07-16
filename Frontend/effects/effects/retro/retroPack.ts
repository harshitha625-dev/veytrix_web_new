import { 
  Camera, Disc, Tv, Film, Sparkles, MonitorPlay, HelpCircle
} from 'lucide-react';
import { EffectModule } from '../types';

const makeDefaultParams = (intensity: number, speed: number) => ({
  intensity,
  speed,
  duration: 4,
  opacity: 0.8,
  blendMode: 'normal',
  enabled: true
});

const makeAdjustableParams = (name: string, min = 0.1, max = 2, step = 0.05) => [
  { name, key: 'intensity', type: 'number' as const, min, max, step },
  { name: 'Flicker Speed', key: 'speed', type: 'number' as const, min: 0, max: 4, step: 0.1 },
  { name: 'Duration', key: 'duration', type: 'number' as const, min: 0.5, max: 10, step: 0.5 },
  { name: 'Opacity', key: 'opacity', type: 'number' as const, min: 0, max: 1, step: 0.05 },
  { name: 'Blend Mode', key: 'blendMode', type: 'select' as const, options: ['normal', 'overlay', 'multiply', 'screen'] }
];

export const vintageCamera: EffectModule = {
  id: 'pro-vintage-camera',
  name: 'Vintage Camera',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm retro camera tint and corner vignetting.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Warmth Strength', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] * 1.05 + 10 * params.intensity;
      d[i+1] = d[i+1] * 0.95;
      d[i+2] = d[i+2] * 0.85;
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.1:gs=-0.05:bs=-0.1`]
};

export const polaroid: EffectModule = {
  id: 'pro-polaroid',
  name: 'Polaroid',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Faded polaroid snapshot style border and tint.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Fade Amount', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      // Fade highlights, wash blacks
      d[i] = d[i] * 0.8 + 30 * params.intensity;
      d[i+1] = d[i+1] * 0.8 + 25 * params.intensity;
      d[i+2] = d[i+2] * 0.75 + 20 * params.intensity;
    }
    ctx.putImageData(img, 0, 0);

    // White polaroid instant photo border
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`curves=polaroid`]
};

export const kodakFilm: EffectModule = {
  id: 'pro-kodak-film',
  name: 'Kodak Film',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Classic Kodak warmth, rich saturations, and soft grain.',
  defaultParameters: makeDefaultParams(0.5, 0.8),
  adjustableParameters: makeAdjustableParams('Saturation', 0.1, 1.3, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * 1.1); // Rich warmth
      d[i+1] = Math.min(255, d[i+1] * 1.05);
      d[i+2] = Math.min(255, d[i+2] * 0.9);
      // Small grains
      const grain = (Math.random() - 0.5) * 15;
      d[i] = Math.max(0, Math.min(255, d[i] + grain));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + grain));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + grain));
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.1:gs=0.05:bs=-0.1`]
};

export const fujiFilm: EffectModule = {
  id: 'pro-fuji-film',
  name: 'Fuji Film',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Fuji film green and cool blue tones.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Cool Tones', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] * 0.9;
      d[i+1] = Math.min(255, d[i+1] * 1.05); // Rich green
      d[i+2] = Math.min(255, d[i+2] * 1.08); // Cool blue
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=bs=0.15:gs=0.1:rs=-0.1`]
};

export const canonLook: EffectModule = {
  id: 'pro-canon-look',
  name: 'Canon Look',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm skin tones and canonical cinematic coloring.',
  defaultParameters: makeDefaultParams(0.4, 0),
  adjustableParameters: makeAdjustableParams('Skin Contrast', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * 1.05 + 5);
      d[i+1] = d[i+1] * 0.98;
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.05`]
};

export const sonyLook: EffectModule = {
  id: 'pro-sony-look',
  name: 'Sony Look',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Slightly cool-tinted, sharp digital slate look.',
  defaultParameters: makeDefaultParams(0.4, 0),
  adjustableParameters: makeAdjustableParams('Sharpness', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] * 0.96;
      d[i+2] = Math.min(255, d[i+2] * 1.05); // Sony cool blue
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=bs=0.08:rs=-0.04`]
};

export const cinemaFilm: EffectModule = {
  id: 'pro-cinema-film',
  name: 'Cinema Film',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Moody teal & orange cinema color profile.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Moody depth', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      // Teal shadows (low values have blue/green), Orange highlights (high values have red)
      const avg = (d[i] + d[i+1] + d[i+2])/3;
      if (avg < 128) {
        d[i] = d[i] * 0.9;
        d[i+1] = Math.min(255, d[i+1] * 1.05);
        d[i+2] = Math.min(255, d[i+2] * 1.1);
      } else {
        d[i] = Math.min(255, d[i] * 1.1);
        d[i+1] = Math.min(255, d[i+1] * 1.02);
        d[i+2] = d[i+2] * 0.9;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rh=0.15:bh=0.05:rm=-0.05:bm=0.1`]
};

export const projector: EffectModule = {
  id: 'pro-projector',
  name: 'Projector',
  category: 'retro',
  icon: MonitorPlay,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '8mm optical projector flicker and edge bleed.',
  defaultParameters: makeDefaultParams(0.4, 2.5),
  adjustableParameters: makeAdjustableParams('Flicker', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const flicker = 0.88 + 0.12 * Math.sin(time * params.speed * 20);
    ctx.fillStyle = `rgba(255,255,255,${0.07 * flicker})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vignette
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.4, canvas.width/2, canvas.height/2, canvas.width*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`vignette=PI/4`]
};

export const filmRoll: EffectModule = {
  id: 'pro-film-roll',
  name: 'Film Roll',
  category: 'retro',
  icon: Disc,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Continuous vertical film loop scrolling glitch.',
  defaultParameters: makeDefaultParams(20, 1.2),
  adjustableParameters: makeAdjustableParams('Roll Speed', 5, 50, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const rollY = (time * params.speed * 120) % canvas.height;
    ctx.drawImage(video, 0, rollY, canvas.width, canvas.height);
    ctx.drawImage(video, 0, rollY - canvas.height, canvas.width, canvas.height);
    // Draw horizontal black divider line
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, rollY - 3, canvas.width, 6);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`identity`]
};

export const dustFilm: EffectModule = {
  id: 'pro-dust-film',
  name: 'Dust Film',
  category: 'retro',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Static dust fibers and specks animation.',
  defaultParameters: makeDefaultParams(10, 2),
  adjustableParameters: makeAdjustableParams('Dust Density', 2, 25, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const count = Math.round(params.intensity);
    for(let i=0; i<count; i++) {
      if(Math.random() < 0.6) {
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*2 + 0.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const scratches: EffectModule = {
  id: 'pro-scratches',
  name: 'Scratches',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Heavy linear vertical scratch lines.',
  defaultParameters: makeDefaultParams(0.4, 2),
  adjustableParameters: makeAdjustableParams('Line Count', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    if (Math.random() < params.intensity) {
      ctx.beginPath();
      const lx = Math.random() * canvas.width;
      ctx.moveTo(lx, 0); ctx.lineTo(lx + (Math.random()-0.5)*15, canvas.height);
      ctx.stroke();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=15:allf=t+u`]
};

export const burnEdges: EffectModule = {
  id: 'pro-burn-edges',
  name: 'Burn Edges',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Heat burns at the borders and corners.',
  defaultParameters: makeDefaultParams(0.5, 0.8),
  adjustableParameters: makeAdjustableParams('Burn warmth', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity;
    const pulse = 0.85 + 0.15 * Math.sin(time * params.speed * 2);
    // Draw burnt orange/brown vignette border
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.35, canvas.width/2, canvas.height/2, canvas.width*0.7);
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(0.85, `rgba(255,100,20,${params.intensity * 0.75 * pulse})`);
    grad.addColorStop(1, `rgba(180,40,0,${params.intensity * pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`vignette=PI/4`]
};

export const vhsTape: EffectModule = {
  id: 'pro-vhs-tape',
  name: 'VHS Tape',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Nostalgic VCR tape static and tracking lines.',
  defaultParameters: makeDefaultParams(8, 2.5),
  adjustableParameters: makeAdjustableParams('VCR Jitter', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const len = d.length;
    for (let i = 0; i < len; i += 440) {
      if (Math.random() < 0.12) {
        const offset = Math.round((Math.random() - 0.5) * params.intensity);
        d[i] = d[Math.max(0, Math.min(len - 1, i + offset * 4))];
        d[i+1] = d[Math.max(0, Math.min(len - 1, i + offset * 4 + 1))];
      }
    }
    ctx.putImageData(img, 0, 0);

    // Roll indicator scanline
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    const scanY = (time * 100) % canvas.height;
    ctx.fillRect(0, scanY, canvas.width, 3);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`chromashift=cbh=4`]
};

export const homeCamcorder: EffectModule = {
  id: 'pro-home-camcorder',
  name: 'Home Camcorder',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '80s handheld camcorder overlays and tint.',
  defaultParameters: makeDefaultParams(0.5, 0),
  adjustableParameters: makeAdjustableParams('Saturation', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Oversaturate
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for(let i=0; i<d.length; i+=4) {
      d[i] = Math.min(255, d[i]*1.12);
      d[i+1] = Math.min(255, d[i+1]*1.05);
    }
    ctx.putImageData(img, 0, 0);

    // Draw camcorder text
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 10px Courier New, monospace';
    ctx.fillText('● REC', 25, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('AUTO', 25, 45);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const s = pad(Math.floor(time) % 60);
    const m = pad(Math.floor(time / 60) % 60);
    ctx.fillText(`00:${m}:${s}`, canvas.width - 90, canvas.height - 30);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10`]
};

export const oldTV: EffectModule = {
  id: 'pro-old-tv',
  name: 'Old TV',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Antique television curved screen and scanlines.',
  defaultParameters: makeDefaultParams(0.4, 1.5),
  adjustableParameters: makeAdjustableParams('TV Scanlines', 0.1, 0.8, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Scanlines
    ctx.strokeStyle = `rgba(0,0,0,${params.intensity})`;
    ctx.lineWidth = 1;
    for (let y=0; y<canvas.height; y+=3){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
    }

    // Flicker
    const flicker = 0.94 + 0.06 * Math.sin(time * 50);
    ctx.fillStyle = `rgba(255,255,255,${0.04 * flicker})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`vignette=PI/4`]
};

export const retroGaming: EffectModule = {
  id: 'pro-retro-gaming',
  name: 'Retro Gaming',
  category: 'retro',
  icon: MonitorPlay,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '8-bit retro arcade pixelation.',
  defaultParameters: makeDefaultParams(12, 0),
  adjustableParameters: makeAdjustableParams('Pixel Block', 4, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const size = Math.round(params.intensity);
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        const ci = (Math.min(y + Math.floor(size/2), h-1)*w + Math.min(x + Math.floor(size/2), w-1))*4;
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

export const gameBoy: EffectModule = {
  id: 'pro-gameboy',
  name: 'GameBoy',
  category: 'retro',
  icon: MonitorPlay,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Classic green monochrome handheld screen.',
  defaultParameters: makeDefaultParams(10, 0),
  adjustableParameters: makeAdjustableParams('Resolution', 4, 25, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    
    // Pixelate + Green Tint
    const size = Math.round(params.intensity);
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        const ci = (Math.min(y + Math.floor(size/2), h-1)*w + Math.min(x + Math.floor(size/2), w-1))*4;
        const avg = (d[ci] + d[ci+1] + d[ci+2]) / 3;
        // Map brightness to GameBoy 4-color palette of greens
        let r=15, g=56, b=15; // Dark green
        if (avg > 200) { r=155; g=188; b=15; } // Lightest green
        else if (avg > 120) { r=139; g=172; b=15; }
        else if (avg > 60) { r=48; g=98; b=48; }

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
  ffmpegExportFilter: (params) => [`colorbalance=rs=-0.4:gs=0.3:bs=-0.4`]
};

export const vhsCam: EffectModule = {
  id: 'pro-vhs-cam',
  name: 'VHS Cam',
  category: 'retro',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'VHS tape tracking lines and overlay indicators.',
  defaultParameters: makeDefaultParams(6, 1.5),
  adjustableParameters: makeAdjustableParams('Tape distortion', 2, 20, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const len = d.length;
    for (let i = 0; i < len; i += 400) {
      if (Math.random() < 0.1) {
        const offset = Math.round((Math.random() - 0.5) * params.intensity);
        d[i] = d[Math.max(0, Math.min(len - 1, i + offset * 4))];
        d[i+2] = d[Math.max(0, Math.min(len - 1, i - offset * 4 + 2))];
      }
    }
    ctx.putImageData(img, 0, 0);
    
    // Draw VHS HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Courier New, monospace';
    ctx.fillText('REC', 25, 30);
    ctx.fillText('SP', 25, 45);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`chromashift=cbh=4`]
};

export const super8: EffectModule = {
  id: 'pro-super-8',
  name: 'Super 8',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Flickering 8mm analog projector look.',
  defaultParameters: makeDefaultParams(0.5, 2.5),
  adjustableParameters: makeAdjustableParams('Jitter Strength', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    // Warm retro tint
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] * 1.05 + 10;
      d[i+1] = d[i+1] * 0.95;
      d[i+2] = d[i+2] * 0.8;
    }
    ctx.putImageData(img, 0, 0);

    // Gate Jitter
    ctx.save();
    ctx.globalAlpha = params.opacity;
    const jx = (Math.random()-0.5) * params.intensity * 8;
    const jy = (Math.random()-0.5) * params.intensity * 6;
    ctx.translate(jx, jy);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=15`]
};

export const noirFilm: EffectModule = {
  id: 'pro-noir-film',
  name: 'Noir Film',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '1940s high-contrast dramatic monochrome look.',
  defaultParameters: makeDefaultParams(1.3, 0),
  adjustableParameters: makeAdjustableParams('Contrast', 0.5, 2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const factor = (259 * (params.intensity * 128 + 255)) / (255 * (259 - params.intensity * 128));
    for (let i = 0; i < d.length; i += 4) {
      const avg = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]; // Grayscale
      const val = factor * (avg - 128) + 128;
      const b = Math.max(0, Math.min(255, val));
      d[i] = b; d[i+1] = b; d[i+2] = b;
    }
    ctx.putImageData(img, 0, 0);

    // Heavy dark vignette edges
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.25, canvas.width/2, canvas.height/2, canvas.width*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`format=gray,eq=contrast=1.5:brightness=-0.08`]
};
