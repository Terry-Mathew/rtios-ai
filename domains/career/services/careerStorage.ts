/**
 * Career Domain - Storage Adapter
 * 
 * Handles persistence for resumes and user profile.
 * Uses shared storage key for backward compatibility.
 * 
 * Migration: Uses unknown-first parsing with type guards and supports legacy data (no version field)
 */

import type { SavedResume, UserProfile } from '../types';
import type { JobInfo } from '../../jobs/types';
import { parseStoredResume } from '../../../src/types/storage';

const STORAGE_KEY = 'rtios_local_data_v1';

interface StorageData {
  resumes: SavedResume[];
  jobs: JobInfo[];
  userProfile: UserProfile;
}

/**
 * Load career data (resumes + profile) from storage
 */
export function loadCareerData(): { resumes: SavedResume[]; userProfile: UserProfile } | null {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return null;

    // Parse as unknown first
    const data = JSON.parse(dataStr) as unknown;
    
    // Validate structure
    if (typeof data !== 'object' || data === null) {
      console.warn("CareerStorage: Invalid storage data format.");
      return null;
    }
    
    const storageData = data as Record<string, unknown>;

    // Parse resumes with type-safe migration (handles legacy + versioned data)
    const resumesArray = Array.isArray(storageData.resumes) ? storageData.resumes : [];
    const resumes = resumesArray
      .map(r => parseStoredResume(r))
      .filter((r): r is SavedResume => r !== null);

    const userProfile: UserProfile = {
      activeResumeId: null,
      portfolioUrl: '',
      linkedinUrl: '',
      ...(typeof storageData.userProfile === 'object' && storageData.userProfile !== null 
        ? (storageData.userProfile as Partial<UserProfile>) 
        : {})
    };

    return { resumes, userProfile };
  } catch (err: unknown) {
    console.error("CareerStorage: Failed to load from storage.", err);
    return null;
  }
}

/**
 * Save career data (resumes + profile) to storage
 * Preserves existing jobs data
 */
export function saveCareerData(resumes: SavedResume[], userProfile: UserProfile): void {
  try {
    // Load existing data to preserve jobs
    const existing = localStorage.getItem(STORAGE_KEY);
    const existingData: StorageData = existing ? JSON.parse(existing) as StorageData : { resumes: [], jobs: [], userProfile: {} };

    // Strip File objects to prevent circular refs, quota issues, and serialization errors
    const serializableResumes = resumes.map(r => {
      const { file: _file, ...rest } = r; // Unused: prefix with _ to fix lint
      return rest;
    });

    const data: StorageData = {
      resumes: serializableResumes,
      jobs: existingData.jobs || [],
      userProfile
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err: unknown) {
    console.warn("CareerStorage: Failed to save to storage (Quota might be exceeded).", err);
  }
}

