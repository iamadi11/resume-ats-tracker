import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock DOMMatrix for PDF.js
global.DOMMatrix = class DOMMatrix {
  constructor(init?: string | number[]) {
    // Mock implementation
  }
  static fromMatrix() {
    return new DOMMatrix();
  }
} as any;

// Polyfill File.text() and File.arrayBuffer() for Node.js test environment
if (typeof File !== 'undefined') {
  const FilePrototype = File.prototype as any;
  
  if (!FilePrototype.text) {
    FilePrototype.text = function() {
      return new Promise((resolve, reject) => {
        // For test files created with content array, use the first element
        if (this._testContent) {
          resolve(this._testContent);
        } else {
          // Try to read as text using a simple approach
          const reader = new (global as any).FileReader();
          reader.onload = () => resolve(reader.result || '');
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(this);
        }
      });
    };
  }
  
  if (!FilePrototype.arrayBuffer) {
    FilePrototype.arrayBuffer = function() {
      return new Promise((resolve, reject) => {
        if (this._testContent) {
          // Convert string to ArrayBuffer
          const encoder = new TextEncoder();
          resolve(encoder.encode(this._testContent).buffer);
        } else {
          const reader = new (global as any).FileReader();
          reader.onload = () => resolve(reader.result || new ArrayBuffer(0));
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(this);
        }
      });
    };
  }
}

// Enhanced FileReader mock
if (typeof FileReader === 'undefined' || !FileReader.prototype.readAsText) {
  class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    
    readAsText(file: Blob) {
      setTimeout(() => {
        if ((file as any)._testContent) {
          this.result = (file as any)._testContent;
        } else if (file instanceof File) {
          // Try to get content from file name or use default
          this.result = 'test file content';
        } else {
          this.result = '';
        }
        if (this.onload) {
          this.onload({ target: this } as any);
        }
      }, 0);
    }
    
    readAsArrayBuffer(file: Blob) {
      setTimeout(() => {
        if ((file as any)._testContent) {
          const encoder = new TextEncoder();
          this.result = encoder.encode((file as any)._testContent).buffer;
        } else {
          this.result = new ArrayBuffer(0);
        }
        if (this.onload) {
          this.onload({ target: this } as any);
        }
      }, 0);
    }
  }
  
  (global as any).FileReader = MockFileReader;
}

// Mock PDF.js to avoid DOMMatrix issues in tests
vi.mock('../processors/pdf-parser.js', async () => {
  const actual = await vi.importActual('../processors/pdf-parser.js');
  return {
    ...actual,
    parsePDF: vi.fn().mockResolvedValue({
      success: true,
      text: 'Mock PDF text content',
      metadata: { format: 'pdf', pageCount: 1 },
    }),
    parsePDFWithLayout: vi.fn().mockResolvedValue({
      success: true,
      text: 'Mock PDF text content',
      metadata: { format: 'pdf', pageCount: 1 },
    }),
  };
});

// Mock DOCX parser
vi.mock('../processors/docx-parser.js', async () => {
  const actual = await vi.importActual('../processors/docx-parser.js');
  return {
    ...actual,
    parseDOCX: vi.fn().mockResolvedValue({
      success: true,
      text: 'Mock DOCX text content',
      metadata: { format: 'docx' },
    }),
  };
});

