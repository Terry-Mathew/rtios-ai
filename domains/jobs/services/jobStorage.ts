/**
 * JobApplications Domain - Storage Adapter
 * 
 * Handles persistence for jobs.
 * Uses shared storage key for backward compatibility.
 */

import type { JobInfo } from '../types';
import type { SavedResume, UserProfile } from '../../career/types';

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

    const data = JSON.parse(dataStr) as StorageData;

    // Revive Date objects and ensure outputs structure exists
    const jobs = data.jobs?.map((j: any) => ({
      ...j,
      dateAdded: j.dateAdded ? new Date(j.dateAdded) : new Date(),
      outputs: j.outputs || {}
    })) || [];

    return jobs;
  } catch (error) {
    console.error("JobStorage: Failed to load from storage.", error);
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
    const existingData: StorageData = existing ? JSON.parse(existing) : { 
      resumes: [], 
      jobs: [], 
      userProfile: { activeResumeId: null } 
    };

    const data: StorageData = {
      resumes: existingData.resumes || [],
      jobs,
      userProfile: existingData.userProfile || { activeResumeId: null }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("JobStorage: Failed to save to storage (Quota might be exceeded).", error);
  }
}

