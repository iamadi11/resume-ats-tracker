import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        },
        {
          src: 'assets/**/*',
          dest: 'assets'
        },
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: 'assets'
        }
      ]
    }),
    // Plugin to inline preload-helper into content script
    {
      name: 'inline-content-script-deps',
      generateBundle(options, bundle) {
        const contentScriptChunk = Object.values(bundle).find(
          chunk => chunk.type === 'chunk' && chunk.name === 'content-script'
        ) as any;
        
        const preloadHelperChunk = Object.values(bundle).find(
          chunk => chunk.type === 'chunk' && 
          chunk.fileName && 
          chunk.fileName.includes('preload-helper')
        ) as any;
        
        if (contentScriptChunk && preloadHelperChunk && contentScriptChunk.imports?.includes(preloadHelperChunk.fileName)) {
          console.log('[Vite Plugin] Inlining preload-helper into content script');
          
          // Read the preload-helper code
          const preloadCode = preloadHelperChunk.code;
          
          // Inline the preload-helper code at the top of content script
          // The preload-helper exports a function, we need to extract it
          
          // Remove the import statement from content script
          // Match the exact format Vite generates: import{_ as c}from"./assets/preload-helper-XXX.js";
          let codeWithoutImport = contentScriptChunk.code.replace(
            /import\s*\{[^}]*\}\s*from\s*['"]\.\/assets\/preload-helper-[^'"]+['"];?\s*\n?/g,
            ''
          );
          
          // Also try other import formats
          codeWithoutImport = codeWithoutImport.replace(
            /import\s+[^'"]+\s+from\s*['"]\.\/assets\/preload-helper-[^'"]+['"];?\s*\n?/g,
            ''
          );
          
          // Remove any remaining preload-helper imports
          codeWithoutImport = codeWithoutImport.replace(
            /import[^;]*preload-helper[^;]*;?\s*\n?/g,
            ''
          );
          
          // Extract the exported function from preload-helper
          // The preload-helper exports a function (usually named `_` or `preloadHelper`)
          // We need to extract the function definition and make it available
          const exportMatch = preloadCode.match(/export\s+(function|const|let|var)\s+(\w+)\s*[=:]\s*([\s\S]*?)(?=\n\nexport|\n\nconst|\n\nlet|\n\nvar|$)/);
          
          if (exportMatch) {
            // Extract the function body and create a local version
            const functionName = exportMatch[2];
            const functionBody = exportMatch[3];
            
            // Create a local const with the same name
            const inlinedFunction = `const ${functionName} = ${functionBody}`;
            
            // Prepend the inlined function to content script (before any other code)
            contentScriptChunk.code = inlinedFunction + '\n\n' + codeWithoutImport;
            
            // Remove preload-helper from imports
            if (contentScriptChunk.imports) {
              contentScriptChunk.imports = contentScriptChunk.imports.filter(
                (imp: string) => !imp.includes('preload-helper')
              );
            }
            
            // Delete the preload-helper chunk since it's now inlined
            delete bundle[preloadHelperChunk.fileName];
            
            console.log('[Vite Plugin] Successfully inlined preload-helper into content script');
          } else {
            // Fallback: just prepend the entire preload-helper code
            // Remove export statements and make functions available
            let preloadCodeWithoutExport = preloadCode
              .replace(/export\s+/g, '')
              .replace(/export\s*\{[^}]+\}\s*from\s+['"][^'"]+['"];?\n?/g, '');
            
            // Extract the function name from export{y as _} and create a const
            // The pattern is: export{y as _} where y is the function name and _ is the export name
            const exportMatch = preloadCodeWithoutExport.match(/export\s*\{([^}]+)\}/);
            if (exportMatch) {
              const exportContent = exportMatch[1];
              // Match pattern like "y as _" where y is the function and _ is the export name
              const asMatch = exportContent.match(/(\w+)\s+as\s+(\w+)/);
              if (asMatch) {
                const actualFunctionName = asMatch[1]; // e.g., "y"
                const exportedName = asMatch[2]; // e.g., "_"
                
                // Remove the export statement
                preloadCodeWithoutExport = preloadCodeWithoutExport.replace(
                  /export\s*\{[^}]+\};?\s*\n?/g,
                  ''
                );
                
                // Add const declaration: const _ = y;
                preloadCodeWithoutExport += `\nconst ${exportedName} = ${actualFunctionName};`;
              }
            }
            
            // Ensure codeWithoutImport doesn't have the import
            codeWithoutImport = codeWithoutImport.replace(
              /import[^;]*preload-helper[^;]*;?\s*\n?/g,
              ''
            );
            
            contentScriptChunk.code = preloadCodeWithoutExport.trim() + '\n\n' + codeWithoutImport;
            
            // Remove from imports
            if (contentScriptChunk.imports) {
              contentScriptChunk.imports = contentScriptChunk.imports.filter(
                (imp: string) => !imp.includes('preload-helper')
              );
            }
            
            delete bundle[preloadHelperChunk.fileName];
            console.log('[Vite Plugin] Inlined preload-helper (fallback method)');
          }
          
          // Final check: remove any remaining preload-helper imports
          contentScriptChunk.code = contentScriptChunk.code.replace(
            /import[^;]*preload-helper[^;]*;?\s*\n?/g,
            ''
          );
        } else if (contentScriptChunk && contentScriptChunk.imports && contentScriptChunk.imports.length > 0) {
          console.warn(
            `[Vite Plugin] Content script has ${contentScriptChunk.imports.length} external imports:`,
            contentScriptChunk.imports
          );
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        'content-script': resolve(__dirname, 'src/content/content-script.js'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.js'),
        'drawer': resolve(__dirname, 'src/content/drawer/DrawerApp.js')
      },
      output: {
        // Inline dynamic imports globally to avoid import resolution issues
        inlineDynamicImports: false, // We'll handle this per-entry via manualChunks
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content-script' || chunkInfo.name === 'service-worker') {
            return '[name].js';
          }
          if (chunkInfo.name === 'drawer') {
            return 'assets/drawer-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id, { getModuleInfo }) => {
          const moduleInfo = getModuleInfo(id);
          
          // Check if this module is part of content script dependency tree
          const checkContentScriptDep = (moduleId, visited = new Set()) => {
            if (visited.has(moduleId)) return false;
            visited.add(moduleId);
            
            if (moduleId.includes('drawer')) return false; // Drawer is separate
            if (moduleId.includes('content-script')) return true;
            if (moduleId.includes('content/') && !moduleId.includes('drawer')) return true;
            // Include Vite helper modules used by content script
            if (moduleId.includes('preload-helper') || 
                moduleId.includes('modulepreload') ||
                moduleId.includes('vite') && moduleId.includes('preload')) {
              // Check if it's imported by content script
              const info = getModuleInfo(moduleId);
              if (info && info.importers.some(imp => imp.includes('content-script'))) {
                return true;
              }
            }
            
            const info = getModuleInfo(moduleId);
            if (!info) return false;
            
            // Check all importers recursively
            return info.importers.some(importer => {
              if (importer.includes('content-script')) return true;
              if (importer.includes('drawer')) return false;
              if (importer.includes('popup') || importer.includes('sidepanel') || importer.includes('options')) {
                // Don't bundle popup/sidepanel/options deps into content script
                return false;
              }
              return checkContentScriptDep(importer, visited);
            });
          };
          
          // If this is a content script dependency, inline it (return null)
          if (checkContentScriptDep(id)) {
            return null; // null means inline into entry chunk
          }
          
          // Also check if this is a Vite runtime helper that content script uses
          if (id.includes('preload') && moduleInfo) {
            const isUsedByContentScript = moduleInfo.importers.some(imp => 
              imp.includes('content-script') || checkContentScriptDep(imp)
            );
            if (isUsedByContentScript) {
              return null; // Inline into content script
            }
          }
          
          // Split PDF.js (not used by content script)
          if (id.includes('pdfjs-dist') || id.includes('pdf.js')) {
            return 'pdf';
          }
          // Split mammoth (not used by content script)
          if (id.includes('mammoth')) {
            return 'docx';
          }
          // Split node_modules, but only if not used by content script
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      },
      external: (id) => {
        if (id.includes('scoring-worker')) {
          return true;
        }
        return false;
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
