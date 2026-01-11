/**
 * Type declarations for privacy-utils.js
 */

export function clearAllData(): void;
export function verifyNoDataPersistence(): Promise<boolean>;
export function sanitizeForStorage(data: any): any;
export function containsSensitiveData(data: any): boolean;
export function privacyComplianceCheck(): Promise<{
  compliant: boolean;
  checks: any;
}>;

