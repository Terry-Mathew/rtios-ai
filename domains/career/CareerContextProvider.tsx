/**
 * CareerContextProvider - Global Context Provider for Career State
 * 
 * Wraps the app to ensure single instance of career state (resumes + profile).
 * Fixes the issue where Dashboard and AppView had separate state instances.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SavedResume, UserProfile } from './types';
import { loadCareerData, saveCareerData } from './services/careerStorage';

// Define the context shape
export interface CareerContextValue {
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
    syncFromStorage: () => void; // NEW: Reload from localStorage

    // For backward compatibility
    setResumes: React.Dispatch<React.SetStateAction<SavedResume[]>>;
    setActiveResumeId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DEFAULT_PROFILE: UserProfile = {
    activeResumeId: null,
    portfolioUrl: '',
    linkedinUrl: ''
};

// Create the context
const CareerContext = createContext<CareerContextValue | null>(null);

// Provider component
export const CareerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

    // Derived: Current resume
    const currentResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

    // Load from storage on mount
    useEffect(() => {
        const loaded = loadCareerData();
        if (loaded) {
            setResumes(loaded.resumes);
            setUserProfile(loaded.userProfile);

            // Restore active resume
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

    // Save to storage on change
    useEffect(() => {
        saveCareerData(resumes, userProfile);
    }, [resumes, userProfile]);

    // NEW: Sync from storage function
    const syncFromStorage = useCallback(() => {
        const loaded = loadCareerData();
        if (loaded) {
            setResumes(loaded.resumes);
            setUserProfile(loaded.userProfile);

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

    // Actions
    const addResume = useCallback((resume: SavedResume) => {
        setResumes([resume]); // Single resume enforcement
        setActiveResumeId(resume.id);
        setUserProfile(prev => ({ ...prev, activeResumeId: resume.id }));
    }, []);

    const selectResume = useCallback((id: string) => {
        setActiveResumeId(id);
        setUserProfile(prev => ({ ...prev, activeResumeId: id }));
    }, []);

    const deleteResume = useCallback((id: string) => {
        setResumes(prev => prev.filter(r => r.id !== id));
        if (activeResumeId === id) {
            setActiveResumeId(null);
        }
    }, [activeResumeId]);

    const updateProfile = useCallback((profile: UserProfile) => {
        setUserProfile(profile);
    }, []);

    const value: CareerContextValue = {
        resumes,
        activeResumeId,
        userProfile,
        currentResume,
        addResume,
        selectResume,
        deleteResume,
        updateProfile,
        syncFromStorage,
        setResumes,
        setActiveResumeId
    };

    return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
};

// Hook to use the context
export const useCareerContext = (): CareerContextValue => {
    const context = useContext(CareerContext);
    if (!context) {
        throw new Error('useCareerContext must be used within CareerContextProvider');
    }
    return context;
};
