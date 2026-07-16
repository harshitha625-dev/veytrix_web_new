import { Camera, Eye, RefreshCw, ZoomIn, ZoomOut, Move, ArrowUp, ArrowDown, Shuffle } from 'lucide-react';
import { EffectModule } from '../types';

const createCameraEffect = (id: string, name: string, description: string, icon: any, defaultParams: any, adjustableParams: any[], renderer: any, ffmpegFilter: string[]): EffectModule => ({
  id,
  name,
  category: 'camera',
  icon,
  thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=150&auto=format&fit=crop&q=60',
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

export const cameraExtraEffectsList: EffectModule[] = [
  createCameraEffect(
    'pro-cam-orbit-pan', 'Orbit Pan', 'Cinematic horizontal orbiting camera movement.', Camera,
    { speed: 1.5, radius: 10 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 5, step: 0.1 }, { name: 'Radius', key: 'radius', type: 'number', min: 1, max: 50, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.radius;
      ctx.translate(dx, 0);
    },
    ['crop=iw-20:ih:10+sin(t)*10']
  ),
  createCameraEffect(
    'pro-cam-dolly-in', 'Dolly In', 'Smooth slow camera forward dolly movement.', ZoomIn,
    { speed: 0.5, maxZoom: 1.2 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 2, step: 0.1 }, { name: 'Max Zoom', key: 'maxZoom', type: 'number', min: 1, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const zoom = 1 + (time * params.speed) % (params.maxZoom - 1);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.1:ih*1.1,crop=iw/1.1:ih/1.1']
  ),
  createCameraEffect(
    'pro-cam-dolly-out', 'Dolly Out', 'Smooth slow camera backward dolly movement.', ZoomOut,
    { speed: 0.5, startZoom: 1.25 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 2, step: 0.1 }, { name: 'Start Zoom', key: 'startZoom', type: 'number', min: 1, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const zoom = params.startZoom - (time * params.speed) % (params.startZoom - 1);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.2:ih*1.2,crop=iw/1.2:ih/1.2']
  ),
  createCameraEffect(
    'pro-cam-whip-up', 'Whip Up', 'Fast camera whip translation upwards.', ArrowUp,
    { speed: 4, intensity: 30 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 1, max: 10, step: 0.5 }, { name: 'Intensity', key: 'intensity', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = -Math.abs(Math.sin(time * params.speed)) * params.intensity;
      ctx.translate(0, dy);
    },
    ['crop=iw:ih-30:0:30']
  ),
  createCameraEffect(
    'pro-cam-whip-down', 'Whip Down', 'Fast camera whip translation downwards.', ArrowDown,
    { speed: 4, intensity: 30 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 1, max: 10, step: 0.5 }, { name: 'Intensity', key: 'intensity', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = Math.abs(Math.sin(time * params.speed)) * params.intensity;
      ctx.translate(0, dy);
    },
    ['crop=iw:ih-30:0:0']
  ),
  createCameraEffect(
    'pro-cam-earthquake', 'Earthquake', 'Aggressive erratic seismic camera shake.', Shuffle,
    { frequency: 18, amplitude: 12 },
    [{ name: 'Frequency', key: 'frequency', type: 'number', min: 5, max: 40, step: 1 }, { name: 'Amplitude', key: 'amplitude', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = (Math.random() - 0.5) * params.amplitude;
      const dy = (Math.random() - 0.5) * params.amplitude;
      ctx.translate(dx, dy);
    },
    ['crop=iw-20:ih-20:10:10']
  ),
  createCameraEffect(
    'pro-cam-handheld-mild', 'Mild Handheld', 'Subtle camera sway mimicking raw human handheld holding.', RefreshCw,
    { speed: 2.2, sway: 4.5 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Sway', key: 'sway', type: 'number', min: 1, max: 20, step: 0.5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.sway;
      const dy = Math.cos(time * params.speed * 0.7) * params.sway;
      ctx.translate(dx, dy);
    },
    ['crop=iw-10:ih-10:5:5']
  ),
  createCameraEffect(
    'pro-cam-crane-shot', 'Crane Shot', 'Sweeping diagonal camera movement simulating a mechanical crane lift.', Move,
    { speed: 0.8, height: 15 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Lift Height', key: 'height', type: 'number', min: 2, max: 60, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = Math.sin(time * params.speed) * params.height;
      const dx = Math.cos(time * params.speed * 0.5) * (params.height * 0.3);
      ctx.translate(dx, dy);
    },
    ['crop=iw-20:ih-20:10:10']
  ),
  createCameraEffect(
    'pro-cam-steadycam', 'Steadicam Follow', 'Highly stabilised floaty steadicam movement simulator.', Eye,
    { speed: 1.2, dampening: 3.5 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 4, step: 0.1 }, { name: 'Dampening', key: 'dampening', type: 'number', min: 1, max: 15, step: 0.5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.dampening;
      ctx.translate(dx, 0);
    },
    ['crop=iw-12:ih:6:0']
  ),
  createCameraEffect(
    'pro-cam-matrix-tilt', 'Matrix Tilt', 'Sci-fi diagonal matrix-like tilt angle sway.', Camera,
    { speed: 1, angle: 0.05 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Tilt Angle', key: 'angle', type: 'number', min: 0.01, max: 0.3, step: 0.01 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.sin(time * params.speed) * params.angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.03']
  ),
  createCameraEffect(
    'pro-cam-hyperlapse', 'Hyperlapse Shift', 'Jumpy frame time adjustments recreating a hyperlapse step effect.', RefreshCw,
    { speed: 1.8, steps: 6 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Step Shift', key: 'steps', type: 'number', min: 1, max: 15, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const step = Math.floor(time * params.speed) % params.steps;
      ctx.translate(step * 3, 0);
    },
    ['crop=iw-10:ih:5:0']
  ),
  createCameraEffect(
    'pro-cam-drone-flyby', 'Drone Flyby', 'High altitude smooth pan simulating a quadcopter drone passing.', Camera,
    { speed: 0.6, drift: 20 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 2, step: 0.1 }, { name: 'Drift Shift', key: 'drift', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = (time * params.speed * params.drift) % canvas.width;
      ctx.translate(-dx * 0.1, 0);
    },
    ['crop=iw-30:ih:15:0']
  ),
  createCameraEffect(
    'pro-cam-focus-pull', 'Focus Pull', 'Artistic camera focus pulling effect.', Eye,
    { speed: 1.5, blur: 15 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.2, max: 4, step: 0.2 }, { name: 'Max Blur', key: 'blur', type: 'number', min: 2, max: 35, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const currentBlur = Math.abs(Math.sin(time * params.speed)) * params.blur;
      ctx.filter = `blur(${currentBlur}px)`;
    },
    ['boxblur=5:1']
  ),
  createCameraEffect(
    'pro-cam-macro-zoom', 'Macro Zoom', 'Extremely high magnifying camera zoom.', ZoomIn,
    { speed: 1, zoom: 1.5 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Zoom Level', key: 'zoom', type: 'number', min: 1.1, max: 3.5, step: 0.1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(params.zoom, params.zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.5:ih*1.5,crop=iw/1.5:ih/1.5']
  ),
  createCameraEffect(
    'pro-cam-pan-left-right', 'Pan L to R', 'Smooth automated horizontal panning.', Move,
    { speed: 0.5, offset: 25 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Offset', key: 'offset', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.offset;
      ctx.translate(dx, 0);
    },
    ['crop=iw-50:ih:25:0']
  ),
  createCameraEffect(
    'pro-cam-tilt-up-down', 'Tilt U to D', 'Smooth automated vertical camera tilting.', Move,
    { speed: 0.5, offset: 20 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Offset', key: 'offset', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dy = Math.sin(time * params.speed) * params.offset;
      ctx.translate(0, dy);
    },
    ['crop=iw:ih-40:0:20']
  ),
  createCameraEffect(
    'pro-cam-diagonal-pan', 'Diagonal Pan', 'Cinematic sweeping diagonal camera movement.', Move,
    { speed: 0.7, offset: 22 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Offset', key: 'offset', type: 'number', min: 5, max: 100, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.offset;
      const dy = Math.cos(time * params.speed) * params.offset;
      ctx.translate(dx, dy);
    },
    ['crop=iw-44:ih-44:22:22']
  ),
  createCameraEffect(
    'pro-cam-circular-spin', 'Circular Spin', 'Smooth looping full circle tilt rotate movement.', RefreshCw,
    { speed: 1.2, angle: 0.1 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 5, step: 0.1 }, { name: 'Max Angle', key: 'angle', type: 'number', min: 0.01, max: 0.5, step: 0.02 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.sin(time * params.speed) * params.angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.05']
  ),
  createCameraEffect(
    'pro-cam-shaky-zoom', 'Shaky Zoom', 'Zooming camera movement with added handheld micro-shakes.', ZoomIn,
    { speed: 1.2, zoom: 1.15, shake: 3.5 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 4, step: 0.1 }, { name: 'Zoom', key: 'zoom', type: 'number', min: 1, max: 2, step: 0.05 }, { name: 'Shake', key: 'shake', type: 'number', min: 0.5, max: 15, step: 0.5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const currentZoom = 1 + (time * params.speed) % (params.zoom - 1);
      const dx = (Math.random() - 0.5) * params.shake;
      const dy = (Math.random() - 0.5) * params.shake;
      ctx.translate(canvas.width / 2 + dx, canvas.height / 2 + dy);
      ctx.scale(currentZoom, currentZoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['scale=iw*1.15:ih*1.15,crop=iw/1.15:ih/1.15']
  ),
  createCameraEffect(
    'pro-cam-jitter-pan', 'Jitter Pan', 'Fast twitchy pan movement recreating dynamic action footage.', Move,
    { speed: 5, range: 8 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 1, max: 15, step: 0.5 }, { name: 'Range', key: 'range', type: 'number', min: 1, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed * 2) * (Math.random() * params.range);
      ctx.translate(dx, 0);
    },
    ['crop=iw-16:ih:8:0']
  ),
  createCameraEffect(
    'pro-cam-glide', 'Glide Camera', 'Ultra stabilised floating glide camera movement.', Move,
    { speed: 0.9, depth: 15 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 3, step: 0.1 }, { name: 'Depth', key: 'depth', type: 'number', min: 2, max: 50, step: 2 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.depth;
      const dy = Math.cos(time * params.speed * 0.3) * (params.depth * 0.5);
      ctx.translate(dx, dy);
    },
    ['crop=iw-30:ih-30:15:15']
  ),
  createCameraEffect(
    'pro-cam-subtle-sway', 'Subtle Sway', 'Extremely light rotation sway ideal for landscape scenery.', RefreshCw,
    { speed: 0.6, sway: 0.02 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.1, max: 2, step: 0.1 }, { name: 'Sway angle', key: 'sway', type: 'number', min: 0.005, max: 0.1, step: 0.005 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.sin(time * params.speed) * params.sway);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['rotate=0.01']
  ),
  createCameraEffect(
    'pro-cam-quick-pan', 'Quick Whip Pan', 'Aggressive speed warp whip pan effect.', Move,
    { speed: 4.5, drift: 40 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 1, max: 10, step: 0.5 }, { name: 'Drift Amount', key: 'drift', type: 'number', min: 10, max: 120, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.drift;
      ctx.translate(dx, 0);
    },
    ['crop=iw-80:ih:40:0']
  ),
  createCameraEffect(
    'pro-cam-slow-dolly', 'Slow Dolly', 'Extremely slow dolly translation.', Move,
    { speed: 0.15, range: 25 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.05, max: 1, step: 0.05 }, { name: 'Range', key: 'range', type: 'number', min: 5, max: 80, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const dx = Math.sin(time * params.speed) * params.range;
      ctx.translate(dx, 0);
    },
    ['crop=iw-50:ih:25:0']
  )
];
