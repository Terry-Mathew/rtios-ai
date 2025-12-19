/**
 * Storage Utilities
 * 
 * Legacy storage utilities. New code should use domain-specific storage adapters:
 * - domains/career/services/careerStorage.ts
 * - domains/jobs/services/jobStorage.ts
 * 
 * Migration: Uses unknown-first parsing with type guards
 */

import { JobInfo, SavedResume, UserProfile } from '../types';

const STORAGE_KEY = 'rtios_local_data_v1';

export interface StorageData {
  resumes: SavedResume[];
  jobs: JobInfo[];
  userProfile: UserProfile;
}

export const saveToStorage = (resumes: SavedResume[], jobs: JobInfo[], userProfile: UserProfile) => {
  try {
    // Strip File objects to prevent circular refs, quota issues, and serialization errors
    // We rely on textParams for the logic
    const serializableResumes = resumes.map(r => {
      const { file: _file, ...rest } = r; // Unused: prefix with _ to fix lint
      return rest;
    });

    const data: StorageData = {
      resumes: serializableResumes,
      jobs,
      userProfile
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err: unknown) {
    console.warn("Rtios AI: Failed to save to local storage (Quota might be exceeded).", err);
  }
};

export const loadFromStorage = (): StorageData | null => {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return null;

    // Parse as unknown first
    const data = JSON.parse(dataStr) as unknown;
    
    // Validate structure
    if (typeof data !== 'object' || data === null) {
      console.warn("StorageUtils: Invalid storage data format.");
      return null;
    }
    
    const storageData = data as Record<string, unknown>;
    
    // Build validated StorageData
    const result: StorageData = {
      resumes: [],
      jobs: [],
      userProfile: { activeResumeId: null }
    };

    // Revive Date objects from ISO strings (unknown-first parsing)
    if (Array.isArray(storageData.resumes)) {
      result.resumes = storageData.resumes
        .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
        .map(r => ({
          id: typeof r.id === 'string' ? r.id : '',
          fileName: typeof r.fileName === 'string' ? r.fileName : '',
          textParams: typeof r.textParams === 'string' ? r.textParams : '',
          uploadDate: typeof r.uploadDate === 'string' ? new Date(r.uploadDate) : new Date()
        } as SavedResume));
    }

    if (Array.isArray(storageData.jobs)) {
      result.jobs = storageData.jobs
        .filter((j): j is Record<string, unknown> => typeof j === 'object' && j !== null)
        .map(j => ({
          id: typeof j.id === 'string' ? j.id : undefined,
          title: typeof j.title === 'string' ? j.title : '',
          company: typeof j.company === 'string' ? j.company : '',
          description: typeof j.description === 'string' ? j.description : '',
          companyUrl: typeof j.companyUrl === 'string' ? j.companyUrl : undefined,
          sourceUrl: typeof j.sourceUrl === 'string' ? j.sourceUrl : undefined,
          dateAdded: typeof j.dateAdded === 'string' ? new Date(j.dateAdded) : new Date(),
          contextName: typeof j.contextName === 'string' ? j.contextName : undefined,
          linkedResumeId: typeof j.linkedResumeId === 'string' ? j.linkedResumeId : undefined,
          outputs: typeof j.outputs === 'object' && j.outputs !== null ? j.outputs as JobInfo['outputs'] : {}
        } as JobInfo));
    }

    if (typeof storageData.userProfile === 'object' && storageData.userProfile !== null) {
      const up = storageData.userProfile as Record<string, unknown>;
      result.userProfile = {
        activeResumeId: typeof up.activeResumeId === 'string' ? up.activeResumeId : null,
        portfolioUrl: typeof up.portfolioUrl === 'string' ? up.portfolioUrl : undefined,
        linkedinUrl: typeof up.linkedinUrl === 'string' ? up.linkedinUrl : undefined
      };
    }

    return result;
  } catch (err: unknown) {
    console.error("Rtios AI: Failed to load from local storage.", err);
    return null;
  }
};
