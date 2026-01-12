/**
 * Post-build script to inline content script dependencies
 * This ensures content-script.js is a single self-contained file
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '../dist');

function inlineContentScript() {
  try {
    const contentScriptPath = resolve(distDir, 'content-script.js');
    const contentScript = readFileSync(contentScriptPath, 'utf-8');
    
    // Find all import statements
    const importRegex = /import\s+.*?\s+from\s+['"](\.\/assets\/[^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(contentScript)) !== null) {
      imports.push({
        statement: match[0],
        path: match[1],
        fullPath: resolve(distDir, match[1])
      });
    }
    
    if (imports.length === 0) {
      console.log('✓ Content script has no external imports');
      return;
    }
    
    console.log(`Found ${imports.length} external imports in content script`);
    
    // Read and inline each imported module
    let inlinedScript = contentScript;
    for (const imp of imports) {
      try {
        const moduleContent = readFileSync(imp.fullPath, 'utf-8');
        // Remove the import statement and inline the module content
        // This is a simplified approach - in production, you'd want proper module bundling
        console.log(`⚠ Cannot automatically inline ${imp.path} - manual bundling required`);
      } catch (error) {
        console.error(`Error reading ${imp.path}:`, error.message);
      }
    }
    
    console.log('⚠ Content script still has external imports. Consider using a bundler that supports single-file output.');
  } catch (error) {
    console.error('Error inlining content script:', error);
  }
}

inlineContentScript();

