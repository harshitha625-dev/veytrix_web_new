import { 
  Tv, Zap, Sparkles, Waves, RefreshCw, Shuffle, Activity, Eye, Video, 
  Layers, Film, Camera, Compass, Crosshair, Sun, Moon, Disc, Wind, Flame
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

export const digitalGlitch: EffectModule = {
  id: 'pro-digital-glitch',
  name: 'Digital Glitch',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Intermittent digital block shearing and flickering.',
  defaultParameters: makeDefaultParams(10, 2),
  adjustableParameters: makeAdjustableParams('Jitter Block', 2, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const trigger = Math.sin(time * params.speed * 10) > 0.7;
    if (trigger) {
      const h = canvas.height;
      const w = canvas.width;
      const sh = Math.round(params.intensity * 3);
      for(let i=0; i<3; i++){
        const sy = Math.random()*h;
        const dy = sy + (Math.random()-0.5)*10;
        ctx.drawImage(canvas, 0, sy, w, sh, (Math.random()-0.5)*params.intensity*4, dy, w, sh);
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const cyberGlitch: EffectModule = {
  id: 'pro-cyber-glitch',
  name: 'Cyber Glitch',
  category: 'glitch',
  icon: Zap,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cyberpunk style color bar block glitching.',
  defaultParameters: makeDefaultParams(15, 2.5),
  adjustableParameters: makeAdjustableParams('Block Spread', 4, 40, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const trigger = Math.sin(time * params.speed * 6) > 0.5;
    if (trigger) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, params.intensity*3, params.intensity);
      ctx.fillStyle = 'rgba(255, 0, 128, 0.25)';
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, params.intensity*2, params.intensity*2);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=15:allf=t+u`]
};

export const screenTear: EffectModule = {
  id: 'pro-screen-tear',
  name: 'Screen Tear',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Horizontal frame tearing rendering simulation.',
  defaultParameters: makeDefaultParams(20, 1),
  adjustableParameters: makeAdjustableParams('Tear Width', 5, 50, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const tearY = (time * params.speed * 120) % canvas.height;
    ctx.drawImage(canvas, 0, tearY, canvas.width, canvas.height - tearY, params.intensity, tearY, canvas.width, canvas.height - tearY);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`crop=iw-${params.intensity}:ih:0:0`]
};

export const dataCorruption: EffectModule = {
  id: 'pro-data-corruption',
  name: 'Data Corruption',
  category: 'glitch',
  icon: Shuffle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Corrupted pixel blocks and digital artifacts.',
  defaultParameters: makeDefaultParams(12, 1.8),
  adjustableParameters: makeAdjustableParams('Corruption', 3, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const block = Math.round(params.intensity);
    if (Math.random() < 0.3) {
      for (let i = 0; i < d.length; i += block * 16) {
        d[i] = 255 - d[i];
        d[i+1] = d[i+1] ^ 128;
        d[i+2] = 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=25:allf=t+u`]
};

export const pixelGlitch: EffectModule = {
  id: 'pro-pixel-glitch',
  name: 'Pixel Glitch',
  category: 'glitch',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Random blocks of pixel scaling and offset.',
  defaultParameters: makeDefaultParams(10, 2),
  adjustableParameters: makeAdjustableParams('Pixelate Block', 4, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.25) {
      const size = Math.round(params.intensity * 4);
      const px = Math.random()*(canvas.width - size);
      const py = Math.random()*(canvas.height - size);
      ctx.drawImage(canvas, px, py, size, size, px + (Math.random()-0.5)*15, py + (Math.random()-0.5)*15, size*1.2, size*1.2);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const digitalMelt: EffectModule = {
  id: 'pro-digital-melt',
  name: 'Digital Melt',
  category: 'glitch',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Horizontal row dripping displacement.',
  defaultParameters: makeDefaultParams(12, 1.5),
  adjustableParameters: makeAdjustableParams('Melt Depth', 2, 40, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const shift = Math.round(params.intensity);
    for (let y = 0; y < h; y += 4) {
      const slide = Math.round(Math.sin(y*0.05 + time*params.speed*3)*shift);
      for (let x = 0; x < w; x++) {
        const sx = Math.max(0, Math.min(w-1, x + slide));
        for(let k=0; k<4; k++) {
          const di = ((y+k)*w+x)*4;
          const si = ((y+k)*w+sx)*4;
          if (di < d.length && si < d.length) {
            d[di] = temp[si]; d[di+1] = temp[si+1]; d[di+2] = temp[si+2];
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/10)*${params.intensity},Y)'`]
};

export const signalLoss: EffectModule = {
  id: 'pro-signal-loss',
  name: 'Signal Loss',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Flickering bad reception simulation.',
  defaultParameters: makeDefaultParams(0.5, 3),
  adjustableParameters: makeAdjustableParams('Flicker Frequency', 0.1, 1.5, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const isLosingSignal = Math.sin(time * params.speed * 15) > 0.7;
    if (isLosingSignal) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = img.data;
      for(let i=0; i<d.length; i+=40) {
        d[i] = d[i+1] = d[i+2] = 200; // White static noise
      }
      ctx.putImageData(img, 0, 0);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=15:allf=t+u`]
};

export const tvStatic: EffectModule = {
  id: 'pro-tv-static',
  name: 'TV Static',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Monochrome full-screen analog TV static noise.',
  defaultParameters: makeDefaultParams(0.3, 1),
  adjustableParameters: makeAdjustableParams('Static Opacity', 0.1, 0.9, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const scale = params.intensity;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.random() < scale) {
        const val = Math.random() * 255;
        d[i] = val; d[i+1] = val; d[i+2] = val;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=30:allf=t+u`]
};

export const scanlines: EffectModule = {
  id: 'pro-scanlines',
  name: 'Scanlines',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Retro arcade scanning lines overlay.',
  defaultParameters: makeDefaultParams(0.2, 0),
  adjustableParameters: makeAdjustableParams('Density', 0.05, 0.6, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `rgba(0,0,0,${params.intensity})`;
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`drawgrid=w=iw:h=3:t=1:c=black@${params.intensity}`]
};

export const matrix: EffectModule = {
  id: 'pro-matrix',
  name: 'Matrix',
  category: 'glitch',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Digital green rain matrix style overlay.',
  defaultParameters: makeDefaultParams(0.4, 2),
  adjustableParameters: makeAdjustableParams('Rain Density', 0.1, 0.8, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,255,70,0.15)';
    ctx.globalCompositeOperation = 'screen';
    // Draw columns of green rain falling down
    const cols = Math.round(canvas.width / 20);
    const speed = params.speed * 10;
    for(let i=0; i<cols; i++) {
      if(Math.random() < params.intensity) {
        const cy = (time * speed * (1 + i%3) * 10) % canvas.height;
        ctx.fillText(Math.floor(Math.random()*10).toString(), i*20, cy);
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=gs=0.25,eq=contrast=1.15`]
};

export const hacker: EffectModule = {
  id: 'pro-hacker',
  name: 'Hacker',
  category: 'glitch',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Scrolling green code and cyber analytics HUD.',
  defaultParameters: makeDefaultParams(0.4, 1.5),
  adjustableParameters: makeAdjustableParams('Text Speed', 0.1, 2, 0.1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = '9px monospace';
    const lines = ['SYS_INT: STABLE', 'SEC_ERR: BYPASSED', 'IP: 192.168.1.84', 'SYS_ACC: TRUE'];
    const dy = (time * params.speed * 40) % (canvas.height + 100);
    lines.forEach((l, idx) => {
      ctx.fillText(l, 20, dy - idx*15);
    });
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=gs=0.15`]
};

export const terminal: EffectModule = {
  id: 'pro-terminal',
  name: 'Terminal',
  category: 'glitch',
  icon: Video,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Command line terminal cursor blinking.',
  defaultParameters: makeDefaultParams(0.5, 2),
  adjustableParameters: makeAdjustableParams('Blink Rate', 0.2, 4, 0.1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blink = Math.floor(time * params.speed) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(15, 15, 8, 12);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`identity`]
};

export const binaryRain: EffectModule = {
  id: 'pro-binary-rain',
  name: 'Binary Rain',
  category: 'glitch',
  icon: Shuffle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Falling binary stream 0s and 1s columns.',
  defaultParameters: makeDefaultParams(0.5, 2),
  adjustableParameters: makeAdjustableParams('Rain Count', 0.1, 0.9, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.font = '8px Courier';
    const cols = Math.round(canvas.width / 30);
    const speed = params.speed * 8;
    for(let i=0; i<cols; i++) {
      if(Math.random() < params.intensity) {
        const cy = (time * speed * (1 + (i % 2)) * 12) % canvas.height;
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', i*30, cy);
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=gs=0.2`]
};

export const compressionArtifact: EffectModule = {
  id: 'pro-compression-artifact',
  name: 'Compression Artifact',
  category: 'glitch',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Low bitrate macroblock pixel compression artifacts.',
  defaultParameters: makeDefaultParams(12, 0),
  adjustableParameters: makeAdjustableParams('Blockiness', 4, 30, 1),
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

export const vhsDistortion: EffectModule = {
  id: 'pro-vhs-distortion',
  name: 'VHS Distortion',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vintage tape roll skew and grain.',
  defaultParameters: makeDefaultParams(8, 2),
  adjustableParameters: makeAdjustableParams('Jitter Skew', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    
    // Bottom tracking skew
    const skewHeight = Math.round(h * 0.15);
    for (let y = h - skewHeight; y < h; y++) {
      const shift = Math.round(Math.sin(y*0.1 + time*params.speed*15) * params.intensity);
      for (let x = 0; x < w; x++) {
        const sx = Math.max(0, Math.min(w-1, x + shift));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`chromashift=cbh=4`]
};

export const crtDistortion: EffectModule = {
  id: 'pro-crt-distortion',
  name: 'CRT Distortion',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Curved glass tube refraction distortion.',
  defaultParameters: makeDefaultParams(1.1, 0),
  adjustableParameters: makeAdjustableParams('Lens Force', 1.01, 1.25, 0.01),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const cx = w/2, cy = h/2;
    const maxDist = Math.sqrt(cx*cx + cy*cy);
    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const r = dist / maxDist;
        const scale = 1 + (params.intensity - 1) * r * r;
        const sx = Math.round(cx + dx * scale);
        const sy = Math.round(cy + dy * scale);
        const di = (y*w+x)*4;
        if(sx>=0 && sx<w && sy>=0 && sy<h) {
          const si = (sy*w+sx)*4;
          d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
        } else {
          d[di]=0; d[di+1]=0; d[di+2]=0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`lenscorrection=k1=0.15`]
};

export const analogNoise: EffectModule = {
  id: 'pro-analog-noise',
  name: 'Analog Noise',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Fine high-frequency radio noise.',
  defaultParameters: makeDefaultParams(0.3, 1),
  adjustableParameters: makeAdjustableParams('Noise Limit', 0.1, 0.8, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const limit = params.intensity;
    for(let i=0; i<d.length; i+=4){
      if(Math.random() < limit) {
        const grain = (Math.random() - 0.5) * 55;
        d[i] = Math.max(0, Math.min(255, d[i]+grain));
        d[i+1] = Math.max(0, Math.min(255, d[i+1]+grain));
        d[i+2] = Math.max(0, Math.min(255, d[i+2]+grain));
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const tapeDamage: EffectModule = {
  id: 'pro-tape-damage',
  name: 'Tape Damage',
  category: 'glitch',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Heavy tracking glitch lines and color distortion.',
  defaultParameters: makeDefaultParams(15, 2.5),
  adjustableParameters: makeAdjustableParams('Damage amount', 5, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const trigger = Math.sin(time * params.speed * 8) > 0.45;
    if (trigger) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(0, Math.random()*canvas.height, canvas.width, params.intensity);
      const img = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = img.data;
      for(let i=0; i<d.length; i+=400) {
        d[i+1] = 0; // Remove green channels in streaks
      }
      ctx.putImageData(img, 0, 0);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`chromashift=cbh=5`]
};

export const badTV: EffectModule = {
  id: 'pro-bad-tv',
  name: 'Bad TV',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'VCR alignment drift and flickering lines.',
  defaultParameters: makeDefaultParams(10, 1.5),
  adjustableParameters: makeAdjustableParams('Vertical Drift', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    
    // Wave horizontal shear
    for(let y=0; y<h; y++){
      const slide = Math.round(Math.sin(y*0.02 + time*params.speed*10) * params.intensity);
      for(let x=0; x<w; x++){
        const sx = Math.max(0, Math.min(w-1, x + slide));
        const di = (y*w+x)*4, si = (y*w+sx)*4;
        d[di]=temp[si]; d[di+1]=temp[si+1]; d[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=12:allf=t+u`]
};

export const brokenDisplay: EffectModule = {
  id: 'pro-broken-display',
  name: 'Broken Display',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cracked LCD lines and colored grid glitches.',
  defaultParameters: makeDefaultParams(4, 0),
  adjustableParameters: makeAdjustableParams('Crack count', 2, 10, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw static neon crack lines on screen
    ctx.strokeStyle = 'rgba(255,0,100,0.7)';
    ctx.lineWidth = 1.5;
    const count = Math.round(params.intensity);
    for(let i=0; i<count; i++){
      ctx.beginPath();
      ctx.moveTo(canvas.width * (0.2 + i*0.15), 0);
      ctx.lineTo(canvas.width * (0.25 + i*0.15), canvas.height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height*0.45);
    ctx.lineTo(canvas.width, canvas.height*0.5);
    ctx.stroke();

    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`drawgrid=w=iw:h=ih:t=2:c=red`]
};
