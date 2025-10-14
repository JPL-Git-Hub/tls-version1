const fs = require('fs');
const path = require('path');

// Read all TypeScript/JavaScript files and find imports
function findImports(dir, imports = new Set()) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(item)) {
      findImports(fullPath, imports);
    } else if (item.match(/\.(ts|tsx|js|jsx|mjs)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importMatches = content.match(/import\s+.*?\s+from\s+['"']([^'"']+)['"']/g);
      const requireMatches = content.match(/require\(['"']([^'"']+)['"']\)/g);
      
      if (importMatches) {
        importMatches.forEach(match => {
          const moduleMatch = match.match(/from\s+['"']([^'"']+)['"']/);
          if (moduleMatch && !moduleMatch[1].startsWith('.') && !moduleMatch[1].startsWith('/')) {
            imports.add(moduleMatch[1].split('/')[0]);
          }
        });
      }
      
      if (requireMatches) {
        requireMatches.forEach(match => {
          const moduleMatch = match.match(/require\(['"']([^'"']+)['"']\)/);
          if (moduleMatch && !moduleMatch[1].startsWith('.') && !moduleMatch[1].startsWith('/')) {
            imports.add(moduleMatch[1].split('/')[0]);
          }
        });
      }
    }
  }
  
  return imports;
}

const usedModules = findImports('./src');

// Add modules used in config files
const configFiles = ['next.config.ts', 'eslint.config.mjs', 'postcss.config.mjs'];
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const importMatches = content.match(/import\s+.*?\s+from\s+['"']([^'"']+)['"']/g);
    const requireMatches = content.match(/require\(['"']([^'"']+)['"']\)/g);
    
    if (importMatches) {
      importMatches.forEach(match => {
        const moduleMatch = match.match(/from\s+['"']([^'"']+)['"']/);
        if (moduleMatch && !moduleMatch[1].startsWith('.') && !moduleMatch[1].startsWith('/')) {
          usedModules.add(moduleMatch[1].split('/')[0]);
        }
      });
    }
    
    if (requireMatches) {
      requireMatches.forEach(match => {
        const moduleMatch = match.match(/require\(['"']([^'"']+)['"']\)/);
        if (moduleMatch && !moduleMatch[1].startsWith('.') && !moduleMatch[1].startsWith('/')) {
          usedModules.add(moduleMatch[1].split('/')[0]);
        }
      });
    }
  }
});

console.log('=== MODULES ACTUALLY IMPORTED IN YOUR CODE ===');
const sortedUsed = Array.from(usedModules).sort();
sortedUsed.forEach(mod => console.log('-', mod));
console.log('\nTotal modules imported:', sortedUsed.length);

// Get package.json dependencies
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeclaredDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

console.log('\n=== DECLARED BUT NOT IMPORTED ===');
const unusedDeps = allDeclaredDeps.filter(dep => !usedModules.has(dep));
unusedDeps.forEach(dep => console.log('-', dep));

console.log('\n=== SUMMARY ===');
console.log('Total declared dependencies:', allDeclaredDeps.length);
console.log('Total imported modules:', sortedUsed.length);
console.log('Declared but not imported:', unusedDeps.length);
console.log('Usage percentage:', Math.round((sortedUsed.length / allDeclaredDeps.length) * 100) + '%');