/**
 * JobApplications Domain - Storage Adapter
 * 
 * Handles persistence for jobs.
 * Uses shared storage key for backward compatibility.
 * 
 * Migration: Uses unknown-first parsing with type guards and supports legacy data (no version field)
 */

import type { JobInfo } from '../types';
import type { SavedResume, UserProfile } from '../../career/types';
import { parseStoredJobInfo, parseStoredResume } from '../../../src/types/storage';

const STORAGE_KEY = 'rtios_local_data_v1';

interface StorageData {
  resumes: SavedResume[];
  jobs: JobInfo[];
  userProfile: UserProfile;
}

/**
 * Load jobs data from storage
 */
export function loadJobsData(): JobInfo[] {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];

    // Parse as unknown first
    const data = JSON.parse(dataStr) as unknown;
    
    // Validate structure
    if (typeof data !== 'object' || data === null) {
      console.warn("JobStorage: Invalid storage data format.");
      return [];
    }
    
    const storageData = data as Record<string, unknown>;

    // Parse jobs with type-safe migration (handles legacy + versioned data)
    const jobsArray = Array.isArray(storageData.jobs) ? storageData.jobs : [];
    const jobs = jobsArray
      .map(j => parseStoredJobInfo(j))
      .filter((j): j is JobInfo => j !== null)
      .map(j => ({
        ...j,
        // Ensure outputs structure exists
        outputs: j.outputs || {}
      }));

    return jobs;
  } catch (err: unknown) {
    console.error("JobStorage: Failed to load from storage.", err);
    return [];
  }
}

/**
 * Save jobs data to storage
 * Preserves existing career data (resumes + profile)
 */
export function saveJobsData(jobs: JobInfo[]): void {
  try {
    // Load existing data to preserve career data
    const existing = localStorage.getItem(STORAGE_KEY);
    let existingResumes: SavedResume[] = [];
    let existingUserProfile: UserProfile = { activeResumeId: null, portfolioUrl: '', linkedinUrl: '' };
    
    if (existing) {
      // Parse as unknown first (same pattern as load functions)
      const data = JSON.parse(existing) as unknown;
      
      // Validate structure
      if (typeof data === 'object' && data !== null) {
        const storageData = data as Record<string, unknown>;
        
        // Safely extract and validate resumes array
        const resumesArray = Array.isArray(storageData.resumes) ? storageData.resumes : [];
        existingResumes = resumesArray
          .map(r => parseStoredResume(r))
          .filter((r): r is SavedResume => r !== null);
        
        // Safely extract userProfile
        if (typeof storageData.userProfile === 'object' && storageData.userProfile !== null) {
          const profile = storageData.userProfile as Partial<UserProfile>;
          existingUserProfile = {
            activeResumeId: null,
            portfolioUrl: '',
            linkedinUrl: '',
            ...profile
          };
        }
      }
    }

    const data: StorageData = {
      resumes: existingResumes,
      jobs,
      userProfile: existingUserProfile
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err: unknown) {
    console.warn("JobStorage: Failed to save to storage (Quota might be exceeded).", err);
  }
}

