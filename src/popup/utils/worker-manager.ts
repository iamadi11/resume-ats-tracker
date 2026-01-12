/**
 * Worker Manager
 * 
 * Manages Web Worker lifecycle and communication.
 * Handles worker creation, message passing, and cleanup.
 */

interface WorkerMessage {
  type: string;
  id: string;
  payload?: any;
  error?: string;
  performance?: {
    duration: number;
    timestamp: number;
  };
}

type WorkerMessageHandler = (message: WorkerMessage) => void;

class WorkerManager {
  private worker: Worker | null = null;
  private messageHandlers: Map<string, WorkerMessageHandler> = new Map();
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }> = new Map();
  private requestTimeout = 30000; // 30 seconds

  /**
   * Initialize worker
   */
  initialize() {
    if (this.worker) {
      return; // Already initialized
    }

    try {
      // For Chrome extensions, workers must be loaded using chrome.runtime.getURL
      // This avoids Vite trying to bundle the worker during build
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const workerUrl = chrome.runtime.getURL('src/scoring/worker/scoring-worker.js');
        this.worker = new Worker(workerUrl, { type: 'module' });
      } else {
        // Development fallback - use direct path (may not work in all cases)
        // In development, we can skip worker or use main thread
        console.warn('[Worker Manager] Chrome runtime not available, using fallback');
        throw new Error('Worker requires Chrome extension context');
      }

      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      throw error;
    }
  }

  /**
   * Terminate worker
   */
  terminate() {
    if (this.worker) {
      // Cancel all pending requests
      this.pendingRequests.forEach(({ reject, timeout }) => {
        clearTimeout(timeout);
        reject(new Error('Worker terminated'));
      });
      this.pendingRequests.clear();

      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Send message to worker
   * 
   * @param type - Message type
   * @param payload - Message payload
   * @returns Promise that resolves with response
   */
  async sendMessage(type: string, payload: any): Promise<any> {
    if (!this.worker) {
      this.initialize();
    }

    if (!this.worker) {
      throw new Error('Worker not available');
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Worker request timeout'));
      }, this.requestTimeout);

      // Store request
      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Send message
      this.worker!.postMessage({
        type,
        id,
        payload
      });
    });
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(e: MessageEvent<WorkerMessage>) {
    const { type, id, payload, error, performance } = e.data;

    const request = this.pendingRequests.get(id);
    if (request) {
      clearTimeout(request.timeout);
      this.pendingRequests.delete(id);

      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve({ payload, performance });
      }
    }

    // Call registered handlers
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(e.data);
    }
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(error: ErrorEvent | Event) {
    // Extract error message from ErrorEvent or Event object
    let errorMessage = 'Worker error';
    
    try {
      if (error instanceof ErrorEvent) {
        // ErrorEvent has message, filename, lineno, colno
        errorMessage = error.message || `Worker error at ${error.filename || 'unknown'}:${error.lineno || 0}`;
      } else if (error instanceof Event) {
        // Regular Event - try to extract info from target
        const target = error.target as Worker;
        if (target) {
          // Try to get error from worker
          const workerError = (target as any).error;
          if (workerError) {
            if (typeof workerError === 'string') {
              errorMessage = workerError;
            } else if (workerError instanceof Error) {
              errorMessage = workerError.message;
            } else if (workerError && typeof workerError === 'object' && 'message' in workerError) {
              errorMessage = String(workerError.message);
            } else {
              errorMessage = `Worker error: ${error.type || 'unknown'}`;
            }
          } else {
            errorMessage = `Worker error: ${error.type || 'unknown'}`;
          }
        } else {
          errorMessage = `Worker error: ${error.type || 'unknown'}`;
        }
      } else {
        errorMessage = String(error);
      }
    } catch (e) {
      // Fallback if extraction fails
      errorMessage = `Worker error: ${error.type || 'unknown'}`;
    }
    
    console.error('Worker error:', errorMessage, error);
    
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error(errorMessage));
    });
    this.pendingRequests.clear();
  }

  /**
   * Register message handler
   * 
   * @param type - Message type
   * @param handler - Handler function
   */
  onMessage(type: string, handler: WorkerMessageHandler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unregister message handler
   * 
   * @param type - Message type
   */
  offMessage(type: string) {
    this.messageHandlers.delete(type);
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return this.worker !== null;
  }
}

// Singleton instance
export const workerManager = new WorkerManager();

