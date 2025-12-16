/**
 * Career Domain - Storage Adapter
 * 
 * Handles persistence for resumes and user profile.
 * Uses shared storage key for backward compatibility.
 */

import type { SavedResume, UserProfile } from '../types';
import type { JobInfo } from '../../jobs/types';

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

    const data = JSON.parse(dataStr) as StorageData;

    // Revive Date objects from ISO strings
    const resumes = data.resumes?.map((r: any) => ({
      ...r,
      uploadDate: new Date(r.uploadDate)
    })) || [];

    const userProfile = data.userProfile || {
      activeResumeId: null,
      portfolioUrl: '',
      linkedinUrl: ''
    };

    return { resumes, userProfile };
  } catch (error) {
    console.error("CareerStorage: Failed to load from storage.", error);
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
    const existingData: StorageData = existing ? JSON.parse(existing) : { resumes: [], jobs: [], userProfile: {} };

    // Strip File objects to prevent circular refs, quota issues, and serialization errors
    const serializableResumes = resumes.map(r => {
      const { file, ...rest } = r;
      return rest;
    });

    const data: StorageData = {
      resumes: serializableResumes,
      jobs: existingData.jobs || [],
      userProfile
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("CareerStorage: Failed to save to storage (Quota might be exceeded).", error);
  }
}

