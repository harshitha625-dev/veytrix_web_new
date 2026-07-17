const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Running Transition Library Validation...\n');

// 1. Verify files exist
const dirPath = path.join(__dirname, '..', 'transitions');
const typesFile = path.join(dirPath, 'types.ts');
const packFile = path.join(dirPath, 'transitionsPack.ts');
const indexFile = path.join(dirPath, 'index.ts');

console.log('Checking files:');
[typesFile, packFile, indexFile].forEach(f => {
  if (fs.existsSync(f)) {
    console.log(`  ✓ Found: ${path.basename(f)}`);
  } else {
    console.error(`  ❌ Missing: ${path.basename(f)}`);
    process.exit(1);
  }
});

// 2. Parse transitionsPack.ts to check count and fields without importing TS directly
console.log('\nAnalyzing transitionsPack.ts content:');
const content = fs.readFileSync(packFile, 'utf8');

// Find all occurrence of id: '...' or id: "..."
const idRegex = /id:\s*['"]([^'"]+)['"]/g;
const ids = [];
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}

console.log(`  ✓ Found ${ids.length} transition ID definitions.`);

// Check for duplicates
const uniqueIds = new Set(ids);
if (uniqueIds.size !== ids.length) {
  console.error('  ❌ Error: Duplicate transition IDs found!');
  const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
  console.error('  Duplicates:', duplicates);
  process.exit(1);
} else {
  console.log('  ✓ All transition IDs are unique.');
}

if (ids.length === 50) {
  console.log('  ✓ The library contains exactly 50 transitions.');
} else {
  console.error(`  ❌ Error: Expected exactly 50 transitions, but found ${ids.length}.`);
  process.exit(1);
}

// 3. Compile the typescript files to verify there are no syntax or type errors
console.log('\nRunning TypeScript compilation check...');
try {
  // Run tsc on the transition files specifically
  const command = 'npx tsc --ignoreConfig --noEmit --target es2020 --module esnext --moduleResolution bundler --jsx react-jsx --skipLibCheck "' + indexFile + '"';
  console.log(`  Running: ${command}`);
  execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('  ✓ TypeScript compilation check passed successfully!');
} catch (error) {
  console.error('  ❌ TypeScript compilation check failed!');
  process.exit(1);
}

console.log('\n🎉 All checks passed! Transition library is fully valid and clean.');
