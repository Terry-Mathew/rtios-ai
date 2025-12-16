
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
      const { file, ...rest } = r;
      return rest;
    });

    const data: StorageData = {
      resumes: serializableResumes,
      jobs,
      userProfile
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Rtios AI: Failed to save to local storage (Quota might be exceeded).", error);
  }
};

export const loadFromStorage = (): StorageData | null => {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return null;

    const data = JSON.parse(dataStr);

    // Revive Date objects from ISO strings
    if (data.resumes) {
      data.resumes = data.resumes.map((r: any) => ({
        ...r,
        uploadDate: new Date(r.uploadDate)
      }));
    }

    if (data.jobs) {
      data.jobs = data.jobs.map((j: any) => ({
        ...j,
        dateAdded: j.dateAdded ? new Date(j.dateAdded) : new Date(),
        // Ensure outputs structure exists if missing (migration safety)
        outputs: j.outputs || {}
      }));
    }

    return data as StorageData;
  } catch (error) {
    console.error("Rtios AI: Failed to load from local storage.", error);
    return null;
  }
};
