/**
 * Worker Manager
 * 
 * Manages Web Worker lifecycle and communication.
 * Handles worker creation, message passing, and cleanup.
 */

import { WorkerMessage, generateRequestId } from '../workers/worker-utils';

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
      // Use standard Web Worker API
      this.worker = new Worker(
        new URL('../workers/scoring-worker.ts', import.meta.url),
        { type: 'module' }
      );
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
   */
  async sendMessage(type: string, payload: any): Promise<any> {
    if (!this.worker) {
      this.initialize();
    }

    if (!this.worker) {
      throw new Error('Worker not available');
    }

    const id = generateRequestId();

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
    let errorMessage = 'Worker error';
    
    try {
      if (error instanceof ErrorEvent) {
        errorMessage = error.message || `Worker error at ${error.filename || 'unknown'}:${error.lineno || 0}`;
      } else if (error instanceof Event) {
        errorMessage = `Worker error: ${error.type || 'unknown'}`;
      }
    } catch (e) {
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
   */
  onMessage(type: string, handler: WorkerMessageHandler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unregister message handler
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

