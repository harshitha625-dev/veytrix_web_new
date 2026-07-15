const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/quick-edit/style-screen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements for cyan -> purple
content = content.replace(/cyan-300/g, 'purple-300');
content = content.replace(/cyan-400/g, 'purple-400');
content = content.replace(/cyan-500/g, 'purple-500');
content = content.replace(/cyan-600/g, 'purple-600');
content = content.replace(/rgba\(6,182,212/g, 'rgba(168,85,247');
content = content.replace(/rgba\(6,\s*182,\s*212/g, 'rgba(168, 85, 247');

// Replacements for teal -> purple (excluding teal-orange)
// We match teal only if it is not followed by -orange
content = content.replace(/teal-300/g, 'purple-300');
content = content.replace(/teal-400/g, 'purple-400');
content = content.replace(/teal-500(?!-orange)/g, 'purple-500');
content = content.replace(/teal-600/g, 'purple-600');
content = content.replace(/teal-200/g, 'purple-200');
content = content.replace(/rgba\(20,184,166/g, 'rgba(168,85,247');
content = content.replace(/rgba\(45,212,191/g, 'rgba(168,85,247');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated colors in style-screen.tsx');
