import { EyeOff, Eye, RefreshCw, ZoomIn, Compass, HelpCircle, Shuffle, Minimize2 } from 'lucide-react';
import { EffectModule } from '../types';

const createDistortionEffect = (id: string, name: string, description: string, icon: any, defaultParams: any, adjustableParams: any[], renderer: any, ffmpegFilter: string[]): EffectModule => ({
  id,
  name,
  category: 'distortion',
  icon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
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

export const distortionExtraEffectsList: EffectModule[] = [
  createDistortionEffect(
    'pro-distort-sphere', 'Sphere Distort', 'Wraps the video content spherically inside a circular lens distortion.', Compass,
    { strength: 1.15 },
    [{ name: 'Warp Strength', key: 'strength', type: 'number', min: 0.5, max: 2.5, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(params.strength, params.strength);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-waves-vert', 'Vertical Waves', 'Oscillating wave warp along the vertical direction.', RefreshCw,
    { frequency: 2.5, amplitude: 10 },
    [{ name: 'Wave Frequency', key: 'frequency', type: 'number', min: 0.5, max: 8, step: 0.1 }, { name: 'Wave Amplitude', key: 'amplitude', type: 'number', min: 1, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.frequency) * params.amplitude;
      ctx.translate(dx, 0);
    },
    ['crop=iw-20:ih:10:0']
  ),
  createDistortionEffect(
    'pro-distort-vortex', 'Vortex Warp', 'Swirling spiral vortex wrap effect centered in the screen.', RefreshCw,
    { speed: 1.5, angle: 0.12 },
    [{ name: 'Rotation Speed', key: 'speed', type: 'number', min: 0.1, max: 5, step: 0.1 }, { name: 'Warp Angle', key: 'angle', type: 'number', min: 0.01, max: 0.5, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.sin(time * params.speed) * params.angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.04']
  ),
  createDistortionEffect(
    'pro-distort-magnify', 'Magnifying Glass', 'Simulates a magnifying glass hovering focal distortion.', ZoomIn,
    { zoom: 1.35, scale: 0.8 },
    [{ name: 'Zoom Level', key: 'zoom', type: 'number', min: 1, max: 3, step: 0.05 }, { name: 'Glass Radius', key: 'scale', type: 'number', min: 0.2, max: 1.5, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(params.zoom, params.zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.2:ih*1.2,crop=iw/1.2:ih/1.2']
  ),
  createDistortionEffect(
    'pro-distort-pixel-melt', 'Pixel Melt', 'Melt warp distortion dissolving pixels downwards.', Shuffle,
    { speed: 2, scale: 15 },
    [{ name: 'Melt Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Melt Factor', key: 'scale', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = Math.sin(time * params.speed) * params.scale;
      ctx.translate(0, dy);
    },
    ['crop=iw:ih-20:0:10']
  ),
  createDistortionEffect(
    'pro-distort-shear', 'Shear Warp', 'Linear diagonal shear distortion.', HelpCircle,
    { factor: 0.1 },
    [{ name: 'Shear Factor', key: 'factor', type: 'number', min: 0.01, max: 0.4, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(params.factor);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.02']
  ),
  createDistortionEffect(
    'pro-distort-split', 'Split Screen', 'Tessellated mirrored split screen distortion.', Eye,
    { splits: 2 },
    [{ name: 'Splits count', key: 'splits', type: 'number', min: 2, max: 6, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // preview wrapper
    },
    ['crop=iw/2:ih:0:0']
  ),
  createDistortionEffect(
    'pro-distort-stripes', 'Stripes Warp', 'Sliced stripe alignment shift.', EyeOff,
    { thickness: 12, drift: 8 },
    [{ name: 'Stripe Width', key: 'thickness', type: 'number', min: 4, max: 40, step: 1 }, { name: 'Drift Shift', key: 'drift', type: 'number', min: 2, max: 20, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * 3) * params.drift;
      ctx.translate(dx, 0);
    },
    ['crop=iw-10:ih:5:0']
  ),
  createDistortionEffect(
    'pro-distort-zigzag', 'Zigzag Warp', 'S-curve horizontal zigzag waviness.', Shuffle,
    { peaks: 4, amplitude: 10 },
    [{ name: 'Zigzag Peaks', key: 'peaks', type: 'number', min: 1, max: 10, step: 1 }, { name: 'Amplitude', key: 'amplitude', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * 2) * params.amplitude;
      ctx.translate(dx, 0);
    },
    ['crop=iw-20:ih:10:0']
  ),
  createDistortionEffect(
    'pro-distort-cylinder', 'Cylinder Distort', 'Bends output frame around a cylinder curvature.', Compass,
    { bend: 0.12 },
    [{ name: 'Bend Factor', key: 'bend', type: 'number', min: 0.01, max: 0.5, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(1 + params.bend, 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['crop=iw-10:ih:5:0']
  ),
  createDistortionEffect(
    'pro-distort-wave-pulse', 'Wave Pulse', 'Pulsating wavy horizontal line warps.', RefreshCw,
    { speed: 2, waves: 6 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Wave Counts', key: 'waves', type: 'number', min: 2, max: 15, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * 8;
      ctx.translate(dx, 0);
    },
    ['crop=iw-16:ih:8:0']
  ),
  createDistortionEffect(
    'pro-distort-glass-shattered', 'Shattered Glass', 'Simulates looking through shattered shards of glass.', HelpCircle,
    { segments: 8 },
    [{ name: 'Glass segments', key: 'segments', type: 'number', min: 3, max: 20, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // preview wrapper
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-wave-ring', 'Ring wave ripple', 'Concentric ripples propagating outward.', RefreshCw,
    { speed: 1.5, rings: 5 },
    [{ name: 'Wave Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Ring Count', key: 'rings', type: 'number', min: 2, max: 12, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const scale = 1 + Math.sin(time * params.speed) * 0.03;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.03:ih*1.03,crop=iw/1.03:ih/1.03']
  ),
  createDistortionEffect(
    'pro-distort-blocky', 'Blocky Warp', 'Coarse mosaic structural warp distortion.', Shuffle,
    { blockSize: 15 },
    [{ name: 'Block size', key: 'blockSize', type: 'number', min: 4, max: 60, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // pixelation preview
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-squeeze', 'Vertical Squeeze', 'Compresses canvas vertically while stretching horizontally.', Minimize2,
    { ratio: 0.85 },
    [{ name: 'Squeeze Ratio', key: 'ratio', type: 'number', min: 0.5, max: 0.98, step: 0.02 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(1.1, params.ratio);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['crop=iw:ih-30:0:15']
  ),
  createDistortionEffect(
    'pro-distort-expand', 'Bulge Expand', 'Convex lens expand warp distortion.', ZoomIn,
    { strength: 1.25 },
    [{ name: 'Expand Factor', key: 'strength', type: 'number', min: 1.05, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(params.strength, params.strength);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.2:ih*1.2,crop=iw/1.2:ih/1.2']
  ),
  createDistortionEffect(
    'pro-distort-twirl-left', 'Twirl Counter-Clockwise', 'Spins frame content counter-clockwise.', RefreshCw,
    { speed: 1.2, twirlAngle: 0.1 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 4, step: 0.1 }, { name: 'Twirl Angle', key: 'twirlAngle', type: 'number', min: 0.01, max: 0.4, step: 0.02 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.abs(Math.sin(time * params.speed)) * params.twirlAngle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=-0.04']
  ),
  createDistortionEffect(
    'pro-distort-twirl-right', 'Twirl Clockwise', 'Spins frame content clockwise.', RefreshCw,
    { speed: 1.2, twirlAngle: 0.1 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 4, step: 0.1 }, { name: 'Twirl Angle', key: 'twirlAngle', type: 'number', min: 0.01, max: 0.4, step: 0.02 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.abs(Math.sin(time * params.speed)) * params.twirlAngle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.04']
  ),
  createDistortionEffect(
    'pro-distort-ripple-slow', 'Slow Ripple', 'Ultra slow water ripple waves.', RefreshCw,
    { waveLength: 12 },
    [{ name: 'Wave Length', key: 'waveLength', type: 'number', min: 4, max: 50, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * 0.5) * 6;
      ctx.translate(dx, 0);
    },
    ['crop=iw-12:ih:6:0']
  ),
  createDistortionEffect(
    'pro-distort-melt-drip', 'Dripping Melt', 'Dripping liquid gravity warp melt.', Shuffle,
    { gravity: 12 },
    [{ name: 'Gravity Force', key: 'gravity', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = Math.abs(Math.sin(time * 1.5)) * params.gravity;
      ctx.translate(0, dy);
    },
    ['crop=iw:ih-20:0:0']
  ),
  createDistortionEffect(
    'pro-distort-fun-mirror', 'Fun Mirror', 'Splits canvas vertically and mirrors the left side.', HelpCircle,
    { bend: 0.05 },
    [{ name: 'Bend Factor', key: 'bend', type: 'number', min: 0.01, max: 0.3, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // preview matrix mirror
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-kaleido-4', '4-Way Kaleido', 'Tessellates the image into 4 quadrant mirror angles.', Eye,
    { scale: 1 },
    [{ name: 'Mirror Scale', key: 'scale', type: 'number', min: 0.5, max: 1.5, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // kaleido preview
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-kaleido-8', '8-Way Kaleido', 'Tessellates the image into 8 octagonal mirror angles.', Eye,
    { scale: 1 },
    [{ name: 'Mirror Scale', key: 'scale', type: 'number', min: 0.5, max: 1.5, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      // kaleido preview
    },
    ['vignette']
  ),
  createDistortionEffect(
    'pro-distort-skew', 'Skew Distort', 'Applies dynamic perspective skew warp.', Compass,
    { skewX: 0.08, skewY: 0.05 },
    [{ name: 'Skew X', key: 'skewX', type: 'number', min: 0, max: 0.3, step: 0.01 }, { name: 'Skew Y', key: 'skewY', type: 'number', min: 0, max: 0.3, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.transform(1, params.skewY, params.skewX, 1, 0, 0);
    },
    ['rotate=0.03']
  )
];

// Helper interface
