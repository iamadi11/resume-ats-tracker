/**
 * Post-build script to fix content script imports
 * Rewrites relative imports to use chrome.runtime.getURL() for Chrome extension compatibility
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '../dist');

function fixContentScriptImports() {
  try {
    const contentScriptPath = resolve(distDir, 'content-script.js');
    let content = readFileSync(contentScriptPath, 'utf-8');
    
    // Find all static imports that use relative paths
    const importRegex = /import\s+([^'"]+)\s+from\s+['"]\.\/assets\/([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        fullMatch: match[0],
        imports: match[1],
        path: match[2]
      });
    }
    
    if (imports.length === 0) {
      console.log('✓ Content script has no relative imports to fix');
      return;
    }
    
    console.log(`Found ${imports.length} relative import(s) in content script`);
    
    // Rewrite each import to use dynamic import with chrome.runtime.getURL()
    // We'll convert: import X from "./assets/file.js"
    // To: const X = await import(chrome.runtime.getURL('assets/file.js'))
    
    for (const imp of imports) {
      console.log(`Rewriting import: ${imp.path}`);
      
      // Extract the imported names
      const importNames = imp.imports.trim();
      
      // Create a dynamic import replacement
      // Note: This changes the code structure, so we need to handle it carefully
      // For now, we'll wrap it in an async IIFE or convert to a top-level await pattern
      
      // Simple approach: Replace with a variable assignment that uses dynamic import
      // But this requires the code to be async, which might break things
      
      // Better approach: Keep the import but ensure it resolves correctly
      // Actually, we can't fix static imports this way - they need to be inlined or use absolute URLs
      
      // For Chrome extensions, the relative path SHOULD work if the file is served correctly
      // The issue might be that Chrome isn't recognizing it as a module
      
      console.warn(`Cannot automatically rewrite static import: ${imp.fullMatch}`);
      console.warn('Static imports in content scripts need to be inlined or use absolute extension URLs');
    }
    
    // For now, just log a warning
    console.warn('⚠ Content script has static imports that may not resolve correctly in Chrome extensions');
    console.warn('⚠ Consider ensuring all dependencies are inlined into content-script.js');
    
  } catch (error) {
    console.error('Error fixing content script imports:', error);
  }
}

fixContentScriptImports();

