/**
 * Storage Type Definitions
 * 
 * Defines serialized versions of runtime types for localStorage persistence.
 * 
 * Strategy: unknown → guard → migrate (legacy/no-version support) → convert (string→Date)
 * 
 * Stored types:
 * - All Date fields are ISO strings
 * - Include optional version? field for future migrations
 * - Match runtime type shapes exactly (no restructuring)
 * 
 * Runtime types:
 * - Date fields are Date objects
 * - Used throughout the application
 */

import type { SavedResume } from '../../domains/career/types';
import type { JobInfo } from '../../domains/jobs/types';

// ============================================================================
// Stored Types (as persisted in localStorage)
// ============================================================================

/**
 * Stored version of SavedResume
 * Runtime: SavedResume (from domains/career/types.ts)
 */
export interface StoredResume {
  id: string;
  fileName: string;
  // file?: File; // Never persisted, omitted from stored shape
  textParams: string;
  uploadDate: string; // ISO string
  version?: number; // For future migrations
}

/**
 * Stored version of JobInfo
 * Runtime: JobInfo (from domains/jobs/types.ts)
 */
export interface StoredJobInfo {
  id?: string;
  title: string;
  company: string;
  description: string;
  companyUrl?: string;
  sourceUrl?: string;
  dateAdded?: string; // ISO string
  contextName?: string;
  linkedResumeId?: string;
  outputs?: unknown; // JobOutputs can contain complex nested structures
  version?: number; // For future migrations
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for StoredResume
 */
export function isStoredResume(data: unknown): data is StoredResume {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.fileName === 'string' &&
    typeof obj.textParams === 'string' &&
    typeof obj.uploadDate === 'string' &&
    (obj.version === undefined || typeof obj.version === 'number')
  );
}

/**
 * Type guard for StoredJobInfo
 */
export function isStoredJobInfo(data: unknown): data is StoredJobInfo {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.title === 'string' &&
    typeof obj.company === 'string' &&
    typeof obj.description === 'string' &&
    (obj.id === undefined || typeof obj.id === 'string') &&
    (obj.companyUrl === undefined || typeof obj.companyUrl === 'string') &&
    (obj.sourceUrl === undefined || typeof obj.sourceUrl === 'string') &&
    (obj.dateAdded === undefined || typeof obj.dateAdded === 'string') &&
    (obj.contextName === undefined || typeof obj.contextName === 'string') &&
    (obj.linkedResumeId === undefined || typeof obj.linkedResumeId === 'string') &&
    (obj.version === undefined || typeof obj.version === 'number')
  );
}

// ============================================================================
// Conversion Helpers (Stored → Runtime)
// ============================================================================

/**
 * Convert StoredResume to SavedResume (runtime type)
 */
export function toResume(stored: StoredResume): SavedResume {
  return {
    id: stored.id,
    fileName: stored.fileName,
    textParams: stored.textParams,
    uploadDate: new Date(stored.uploadDate)
    // file is not restored (it wasn't persisted)
  };
}

/**
 * Convert StoredJobInfo to JobInfo (runtime type)
 */
export function toJobInfo(stored: StoredJobInfo): JobInfo {
  return {
    ...stored,
    dateAdded: stored.dateAdded ? new Date(stored.dateAdded) : undefined,
    outputs: stored.outputs as JobInfo['outputs'] // Trust that outputs were persisted correctly
  };
}

// ============================================================================
// Migration Helpers (for legacy data without version field)
// ============================================================================

/**
 * Migrate legacy resume data (no version) to current StoredResume format
 * Returns null if data is invalid
 */
export function migrateResumeData(data: unknown): StoredResume | null {
  // If already v1, return as-is
  if (isStoredResume(data)) {
    return data;
  }
  
  // Try to migrate legacy format (no version field)
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;
  
  // Check for required legacy fields
  if (
    typeof obj.id === 'string' &&
    typeof obj.fileName === 'string' &&
    typeof obj.textParams === 'string' &&
    typeof obj.uploadDate === 'string'
  ) {
    return {
      id: obj.id,
      fileName: obj.fileName,
      textParams: obj.textParams,
      uploadDate: obj.uploadDate,
      version: 1
    };
  }
  
  return null;
}

/**
 * Migrate legacy job data (no version) to current StoredJobInfo format
 * Returns null if data is invalid
 */
export function migrateJobData(data: unknown): StoredJobInfo | null {
  // If already v1, return as-is
  if (isStoredJobInfo(data)) {
    return data;
  }
  
  // Try to migrate legacy format (no version field)
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;
  
  // Check for required legacy fields
  if (
    typeof obj.title === 'string' &&
    typeof obj.company === 'string' &&
    typeof obj.description === 'string'
  ) {
    return {
      title: obj.title,
      company: obj.company,
      description: obj.description,
      id: typeof obj.id === 'string' ? obj.id : undefined,
      companyUrl: typeof obj.companyUrl === 'string' ? obj.companyUrl : undefined,
      sourceUrl: typeof obj.sourceUrl === 'string' ? obj.sourceUrl : undefined,
      dateAdded: typeof obj.dateAdded === 'string' ? obj.dateAdded : undefined,
      contextName: typeof obj.contextName === 'string' ? obj.contextName : undefined,
      linkedResumeId: typeof obj.linkedResumeId === 'string' ? obj.linkedResumeId : undefined,
      outputs: obj.outputs,
      version: 1
    };
  }
  
  return null;
}

/**
 * Parse unknown data into SavedResume (safe, returns null on failure)
 */
export function parseStoredResume(data: unknown): SavedResume | null {
  try {
    const migrated = migrateResumeData(data);
    if (!migrated) return null;
    return toResume(migrated);
  } catch {
    return null;
  }
}

/**
 * Parse unknown data into JobInfo (safe, returns null on failure)
 */
export function parseStoredJobInfo(data: unknown): JobInfo | null {
  try {
    const migrated = migrateJobData(data);
    if (!migrated) return null;
    return toJobInfo(migrated);
  } catch {
    return null;
  }
}

