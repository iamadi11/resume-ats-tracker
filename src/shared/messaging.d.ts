/**
 * Type declarations for messaging.js
 */

export function sendMessage(message: any): Promise<any>;
export function onMessage(handler: (message: any, sender: any, sendResponse: (response: any) => void) => void | Promise<void>): () => void;

