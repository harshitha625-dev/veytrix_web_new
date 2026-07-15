const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/quick-edit/components/TimelineHub.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Color replacements for TimelineHub.tsx
content = content.replace(/bg-\[#071a19\]/g, 'bg-[#140a24]');
content = content.replace(/bg-\[#1a7a59\]/g, 'bg-[#6d28d9]');
content = content.replace(/text-emerald-200 bg-\[#0e3f2d\]/g, 'text-purple-200 bg-[#3b0764]');
content = content.replace(/text-teal-200 bg-\[#0e3f2d\]/g, 'text-purple-200 bg-[#3b0764]');
content = content.replace(/bg-\[#1a7a59\]\/60/g, 'bg-[#6d28d9]/60');
content = content.replace(/bg-\[#0c2f24\]/g, 'bg-[#0f0820]');
content = content.replace(/"#22c55e"/g, '"#a855f7"');

// clipColors
content = content.replace(/bg-teal-950\/70/g, 'bg-purple-950/70');
content = content.replace(/border-teal-500\/40/g, 'border-purple-500/40');
content = content.replace(/text-teal-200/g, 'text-purple-200');
content = content.replace(/bg-teal-400/g, 'bg-purple-400');
content = content.replace(/bg-teal-900\/80/g, 'bg-purple-900/80');
content = content.replace(/border-teal-300/g, 'border-purple-300');
content = content.replace(/rgba\(45,212,191,0\.4\)/g, 'rgba(168,85,247,0.4)');
content = content.replace(/video:\s*"bg-teal-500"/g, 'video:   "bg-purple-500"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated colors in TimelineHub.tsx');
