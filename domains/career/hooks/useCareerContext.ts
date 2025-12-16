/**
 * useCareerContext Hook
 * 
 * Manages CareerContext domain state:
 * - Resume library (single resume only)
 * - User profile (portfolio URL, LinkedIn URL)
 * - Persistence (load/save to localStorage)
 * 
 * Responsibilities replaced from App.tsx:
 * 1. resumes state
 * 2. activeResumeId state
 * 3. userProfile state
 * 4. handleSelectResume
 * 5. handleDeleteResume
 * 6. setUserProfile (updateProfile)
 * 7. Load from storage on mount
 * 8. Save to storage on change
 * 
 * Note: Resume upload orchestration (AI text extraction) remains in App.tsx
 * per dependency rules. This hook provides addResume() for storage only.
 */

import { useState, useCallback, useEffect } from 'react';
import type { SavedResume, UserProfile } from '../types';
import { loadCareerData, saveCareerData } from '../services/careerStorage';

export interface UseCareerContextReturn {
  // State
  resumes: SavedResume[];
  activeResumeId: string | null;
  userProfile: UserProfile;
  currentResume: SavedResume | undefined;
  
  // Actions
  addResume: (resume: SavedResume) => void;
  selectResume: (id: string) => void;
  deleteResume: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  
  // For backward compatibility during migration
  setResumes: React.Dispatch<React.SetStateAction<SavedResume[]>>;
  setActiveResumeId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DEFAULT_PROFILE: UserProfile = {
  activeResumeId: null,
  portfolioUrl: '',
  linkedinUrl: ''
};

export function useCareerContext(): UseCareerContextReturn {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Derived: Current resume (by ID or default to first - single resume enforcement)
  const currentResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  // --- Persistence Effects ---

  // Load on mount
  useEffect(() => {
    const loaded = loadCareerData();
    if (loaded) {
      setResumes(loaded.resumes);
      setUserProfile(loaded.userProfile);
      
      // Restore active resume from profile preference or default to first
      if (loaded.userProfile.activeResumeId) {
        const exists = loaded.resumes.find(r => r.id === loaded.userProfile.activeResumeId);
        if (exists) {
          setActiveResumeId(exists.id);
        } else if (loaded.resumes.length > 0) {
          setActiveResumeId(loaded.resumes[0].id);
        }
      } else if (loaded.resumes.length > 0) {
        setActiveResumeId(loaded.resumes[0].id);
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    saveCareerData(resumes, userProfile);
  }, [resumes, userProfile]);

  // --- Actions ---

  /**
   * Add a new resume (enforces single resume only)
   * Note: Call this AFTER text extraction is complete
   */
  const addResume = useCallback((resume: SavedResume) => {
    // ENFORCE SINGLE RESUME: Replace existing resume array with new one
    setResumes([resume]);
    setActiveResumeId(resume.id);
    setUserProfile(prev => ({ ...prev, activeResumeId: resume.id }));
  }, []);

  /**
   * Select a resume as active
   */
  const selectResume = useCallback((id: string) => {
    setActiveResumeId(id);
    setUserProfile(prev => ({ ...prev, activeResumeId: id }));
  }, []);

  /**
   * Delete a resume
   */
  const deleteResume = useCallback((id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    if (activeResumeId === id) {
      setActiveResumeId(null);
    }
  }, [activeResumeId]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  return {
    // State
    resumes,
    activeResumeId,
    userProfile,
    currentResume,
    
    // Actions
    addResume,
    selectResume,
    deleteResume,
    updateProfile,
    
    // For backward compatibility
    setResumes,
    setActiveResumeId
  };
}

