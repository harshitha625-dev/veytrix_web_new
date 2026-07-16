import { Zap, Tv, EyeOff, ShieldAlert, Monitor, Terminal, Radio } from 'lucide-react';
import { EffectModule } from '../types';

const createGlitchEffect = (id: string, name: string, description: string, icon: any, defaultParams: any, adjustableParams: any[], renderer: any, ffmpegFilter: string[]): EffectModule => ({
  id,
  name,
  category: 'glitch',
  icon,
  thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=60',
  description,
  defaultParameters: { ...defaultParams, enabled: true },
  adjustableParameters: adjustableParams,
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    renderer(ctx, video, params, time, canvas);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: () => ffmpegFilter
});

export const glitchExtraEffectsList: EffectModule[] = [
  createGlitchEffect(
    'pro-glitch-block', 'Block Glitch', 'Generates random rectangular digital noise glitch blocks.', Zap,
    { rate: 0.15, size: 25 },
    [{ name: 'Glitch Rate', key: 'rate', type: 'number', min: 0.05, max: 0.8, step: 0.05 }, { name: 'Block Size', key: 'size', type: 'number', min: 5, max: 60, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if (Math.random() < params.rate) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, params.size * 2, params.size);
      }
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-time-shift', 'RGB Time Shift', 'RGB color channel displacement over time.', Tv,
    { displacement: 10 },
    [{ name: 'Displacement', key: 'displacement', type: 'number', min: 1, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // time shift preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-scanline-jitter', 'Scanline Jitter', 'Horizontal scanline alignment twitching.', EyeOff,
    { jitter: 12, frequency: 3 },
    [{ name: 'Jitter Offset', key: 'jitter', type: 'number', min: 1, max: 40, step: 1 }, { name: 'Frequency', key: 'frequency', type: 'number', min: 1, max: 10, step: 0.5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.frequency * 3) * (Math.random() * params.jitter);
      ctx.translate(dx, 0);
    },
    ['crop=iw-20:ih:10:0']
  ),
  createGlitchEffect(
    'pro-glitch-chromatic', 'Chromatic Glitch', 'Rapid chromatic aberrations with random strobe bursts.', Zap,
    { shift: 8, rate: 0.25 },
    [{ name: 'RGB Shift', key: 'shift', type: 'number', min: 2, max: 25, step: 1 }, { name: 'Burst Rate', key: 'rate', type: 'number', min: 0.05, max: 0.9, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // aberration preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-inversion', 'Color Inversion', 'Rapid frame color inversion flash.', ShieldAlert,
    { frequency: 2, dutyCycle: 0.15 },
    [{ name: 'Frequency', key: 'frequency', type: 'number', min: 0.5, max: 6, step: 0.1 }, { name: 'Duty Cycle', key: 'dutyCycle', type: 'number', min: 0.05, max: 0.5, step: 0.02 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if ((time * params.frequency) % 1 < params.dutyCycle) {
        ctx.filter = 'invert(1)';
      }
    },
    ['negate']
  ),
  createGlitchEffect(
    'pro-glitch-strobe', 'Strobe Flash', 'Intermittent high-speed black or white strobe flashes.', Monitor,
    { speed: 8, intensity: 0.65 },
    [{ name: 'Strobe Speed', key: 'speed', type: 'number', min: 2, max: 24, step: 1 }, { name: 'Flash Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if (Math.sin(time * params.speed * 4) > 0.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${params.intensity * 0.4})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-corrupted', 'Corrupted Signal', 'Simulates random analogue cable data sync loss.', Radio,
    { noise: 0.22, drift: 12 },
    [{ name: 'Signal Noise', key: 'noise', type: 'number', min: 0.05, max: 0.8, step: 0.05 }, { name: 'Drift Shift', key: 'drift', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if (Math.random() < params.noise) {
        ctx.translate((Math.random() - 0.5) * params.drift, 0);
      }
    },
    ['crop=iw-10:ih:5:0']
  ),
  createGlitchEffect(
    'pro-glitch-hacker', 'Hacker Terminal', 'Green digital matrix code rain style overlay.', Terminal,
    { opacity: 0.3 },
    [{ name: 'Code Opacity', key: 'opacity', type: 'number', min: 0.05, max: 0.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.fillStyle = `rgba(0, 255, 0, ${params.opacity * 0.15})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-vector', 'Vector Glitch', 'Sharp vector edge outline jitter.', Zap,
    { threshold: 80, jitter: 10 },
    [{ name: 'Threshold', key: 'threshold', type: 'number', min: 20, max: 200, step: 5 }, { name: 'Edge Jitter', key: 'jitter', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = (Math.random() - 0.5) * params.jitter;
      ctx.translate(dx, 0);
    },
    ['crop=iw-10:ih:5:0']
  ),
  createGlitchEffect(
    'pro-glitch-digital-jitter', 'Digital Jitter', 'Sharp frame horizontal jitter spikes.', Tv,
    { frequency: 4, drift: 20 },
    [{ name: 'Jitter Frequency', key: 'frequency', type: 'number', min: 0.5, max: 10, step: 0.5 }, { name: 'Drift Shift', key: 'drift', type: 'number', min: 2, max: 50, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if ((time * params.frequency) % 1 < 0.2) {
        ctx.translate((Math.random() - 0.5) * params.drift, 0);
      }
    },
    ['crop=iw-20:ih:10:0']
  ),
  createGlitchEffect(
    'pro-glitch-rgb-stutter', 'RGB Stutter', 'Intermittent RGB splits.', Zap,
    { rate: 0.3, shift: 12 },
    [{ name: 'Stutter Rate', key: 'rate', type: 'number', min: 0.05, max: 0.9, step: 0.05 }, { name: 'Shift Amount', key: 'shift', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // stutter preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-analog-noise', 'Analog Tape Noise', 'Horizontal high-frequency tape noise static lines.', Radio,
    { density: 0.35, lines: 5 },
    [{ name: 'Noise Density', key: 'density', type: 'number', min: 0.05, max: 0.9, step: 0.05 }, { name: 'Lines count', key: 'lines', type: 'number', min: 1, max: 12, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // lines preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-sync-loss', 'Sync Signal Loss', 'Simulates horizontal tearing and color phase roll.', Tv,
    { rollSpeed: 0.8 },
    [{ name: 'Roll Speed', key: 'rollSpeed', type: 'number', min: 0.1, max: 3, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = (time * params.rollSpeed * 100) % canvas.height;
      ctx.translate(0, dy * 0.1);
    },
    ['crop=iw:ih-20:0:10']
  ),
  createGlitchEffect(
    'pro-glitch-white-noise', 'White Noise Flash', 'Intermittent white static noise frame overlays.', Radio,
    { frequency: 1.5, opacity: 0.28 },
    [{ name: 'Frequency', key: 'frequency', type: 'number', min: 0.2, max: 5, step: 0.1 }, { name: 'Noise Opacity', key: 'opacity', type: 'number', min: 0.05, max: 0.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if ((time * params.frequency) % 1 < 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${params.opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-horizontal-tear', 'Horizontal Tear', 'Rips portions of the screen horizontally.', EyeOff,
    { threshold: 0.82, tearWidth: 25 },
    [{ name: 'Threshold', key: 'threshold', type: 'number', min: 0.5, max: 0.98, step: 0.02 }, { name: 'Tear Width', key: 'tearWidth', type: 'number', min: 5, max: 60, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if (Math.random() > params.threshold) {
        ctx.translate((Math.random() - 0.5) * params.tearWidth, 0);
      }
    },
    ['crop=iw-30:ih:15:0']
  ),
  createGlitchEffect(
    'pro-glitch-vertical-roll', 'Vertical Roll', 'Looped vertical rolling frame displacement.', Monitor,
    { speed: 0.5 },
    [{ name: 'Roll Speed', key: 'speed', type: 'number', min: 0.1, max: 4, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = (time * params.speed * 50) % canvas.height;
      ctx.translate(0, dy * 0.2);
    },
    ['crop=iw:ih-20:0:10']
  ),
  createGlitchEffect(
    'pro-glitch-color-bleed', 'Color Bleed', 'Horizontal color bleeding and smear glitch.', Zap,
    { length: 12 },
    [{ name: 'Bleed Length', key: 'length', type: 'number', min: 2, max: 45, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // bleed preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-data-moshing', 'Data Mosh', 'Simulates packet drop frame freezing.', ShieldAlert,
    { interval: 2, freezeDuration: 0.3 },
    [{ name: 'Interval (sec)', key: 'interval', type: 'number', min: 1, max: 8, step: 0.5 }, { name: 'Duration (sec)', key: 'freezeDuration', type: 'number', min: 0.1, max: 1.5, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // moshing preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-vhs-grain', 'VHS Head Grain', 'VHS tape tracking noise head grain blocks.', Tv,
    { intensity: 10, lines: 4 },
    [{ name: 'Grain Intensity', key: 'intensity', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Tracking Lines', key: 'lines', type: 'number', min: 1, max: 10, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // tracking preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-interlacing', 'Interlacing lines', 'Standard interlaced video lines distortion.', Monitor,
    { frequency: 15 },
    [{ name: 'Frequency', key: 'frequency', type: 'number', min: 4, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // interlacing preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-hologram', 'Flickering Hologram', 'Glowing scanlines and opacity flicker look.', Terminal,
    { rate: 0.35, scanlines: 10 },
    [{ name: 'Flicker Rate', key: 'rate', type: 'number', min: 0.1, max: 0.9, step: 0.05 }, { name: 'Scanlines count', key: 'scanlines', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      if (Math.random() < params.rate) {
        ctx.globalAlpha = 0.85;
      }
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-phase-shift', 'Phase Shift', 'Phase offset displacement glitch.', Zap,
    { displacement: 14 },
    [{ name: 'Phase Offset', key: 'displacement', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // phase shift preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-static-buzz', 'Static Buzz', 'Random high-speed frame jitters with grain buzz.', Radio,
    { intensity: 8, range: 12 },
    [{ name: 'Buzz intensity', key: 'intensity', type: 'number', min: 1, max: 30, step: 1 }, { name: 'Jitter Range', key: 'range', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = (Math.random() - 0.5) * params.range;
      ctx.translate(dx, 0);
    },
    ['crop=iw-20:ih:10:0']
  ),
  createGlitchEffect(
    'pro-glitch-pixel-corrupt', 'Pixel Corruption', 'Renders corrupted color blocks.', Zap,
    { corruption: 12 },
    [{ name: 'Corruption factor', key: 'corruption', type: 'number', min: 2, max: 45, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // corruption preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-frame-freeze', 'Periodic Freeze', 'Periodically freezes video playback frame.', ShieldAlert,
    { rate: 1.5, duration: 0.25 },
    [{ name: 'Freeze Rate', key: 'rate', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Freeze Duration', key: 'duration', type: 'number', min: 0.05, max: 1.2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // periodic freeze preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-broken-glass', 'Broken LCD', 'Renders horizontal and vertical broken LCD screen lines.', Monitor,
    { density: 4 },
    [{ name: 'LCD Crack density', key: 'density', type: 'number', min: 1, max: 15, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // broken lcd preview
    },
    ['vignette']
  ),
  createGlitchEffect(
    'pro-glitch-wave-jitter', 'Wavy Jitter', 'Wavy alignment horizontal jitter shift.', Zap,
    { waveLength: 15, amplitude: 8 },
    [{ name: 'Wave Length', key: 'waveLength', type: 'number', min: 4, max: 50, step: 1 }, { name: 'Amplitude', key: 'amplitude', type: 'number', min: 1, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * 2) * params.amplitude;
      ctx.translate(dx, 0);
    },
    ['crop=iw-16:ih:8:0']
  ),
  createGlitchEffect(
    'pro-glitch-rgb-rainbow', 'RGB Rainbow Wave', 'Prismatic RGB color shifting wave overlay.', Tv,
    { speed: 1.5 },
    [{ name: 'Wave Speed', key: 'speed', type: 'number', min: 0.2, max: 4, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(${time * params.speed * 50}deg) saturate(1.1)`;
    },
    ['vignette']
  )
];
