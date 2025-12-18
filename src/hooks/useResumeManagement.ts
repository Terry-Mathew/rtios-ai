/**
 * useResumeManagement Hook
 * 
 * Consolidates all resume management logic from route components:
 * - Resume CRUD operations (add, delete, select)
 * - Profile updates (portfolio URL, LinkedIn URL)
 * - Workspace synchronization (resumeText)
 * 
 * This hook eliminates duplicate logic between AppView and DashboardView
 * and provides a single source of truth for resume management operations.
 */

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCareerContext } from '../../domains/career/hooks/useCareerContext';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { fileToBase64 } from '../../utils/fileUtils';
import * as GeminiService from '../../domains/intelligence/services/gemini';
import { AppStatus } from '../../types';
import type { SavedResume, UserProfile } from '../../domains/career/types';
import { errorService } from '../services/errorService';
import { useToastStore } from '../stores/toastStore';

interface UseResumeManagementReturn {
    // Data
    resumes: SavedResume[];
    activeResumeId: string | null;
    currentResume: SavedResume | undefined;
    userProfile: UserProfile;

    // Actions
    addResume: (file: File) => Promise<void>;
    selectResume: (id: string) => void;
    deleteResume: (id: string) => void;
    updateProfile: (profile: UserProfile) => void;
    syncFromStorage: () => void; // NEW: Reload from localStorage
}

export const useResumeManagement = (): UseResumeManagementReturn => {
    // Get career domain state
    const {
        resumes,
        activeResumeId,
        userProfile,
        currentResume,
        addResume: addResumeToContext,
        selectResume: handleSelectResume,
        deleteResume: handleDeleteResume,
        updateProfile: setUserProfile,
        syncFromStorage, // NEW: Sync function from context
    } = useCareerContext();

    // Get workspace state (use useShallow to prevent infinite re-renders)
    const { status } = useWorkspaceStore(useShallow((s) => ({
        status: s.status
    })));

    // Get workspace actions
    const { setStatus, setResumeText } = useWorkspaceStore();

    /**
     * Add a new resume with parsing
     * Handles: file → base64 → AI text extraction → context update
     */
    const addResume = useCallback(async (file: File) => {
        setStatus(AppStatus.PARSING_RESUME);
        try {
            const base64 = await fileToBase64(file);
            const text = await GeminiService.extractResumeText(base64);

            if (!text || text.trim().length === 0) {
                throw new Error("Failed to parse resume text. The AI service might be overloaded.");
            }

            const newResume: SavedResume = {
                id: crypto.randomUUID(),
                fileName: file.name,
                file: file,
                textParams: text,
                uploadDate: new Date()
            };

            // Use career context method (handles single resume enforcement + persistence)
            addResumeToContext(newResume);
            setStatus(AppStatus.IDLE);
            setResumeText(text); // Update workspace store with text

            useToastStore.getState().addToast({ type: 'success', message: 'Resume uploaded and parsed successfully' });
        } catch (e) {
            const message = errorService.handleError(e as Error, {
                component: 'useResumeManagement',
                action: 'addResume',
                fileName: file.name
            });
            setStatus(AppStatus.ERROR);
            useToastStore.getState().addToast({ type: 'error', message });
            // Re-throw so UI can react if needed, or swallow? 
            // Swallowing here as we handled UI feedback via toast/status
        }
    }, [addResumeToContext, setStatus, setResumeText]);

    /**
     * Select a resume as active (simple passthrough)
     */
    const selectResume = useCallback((id: string) => {
        try {
            handleSelectResume(id);
        } catch (error) {
            const message = errorService.handleError(error as Error, {
                component: 'useResumeManagement',
                action: 'selectResume',
                resumeId: id
            });
            useToastStore.getState().addToast({ type: 'error', message });
        }
    }, [handleSelectResume]);

    /**
     * Delete a resume (simple passthrough)
     */
    const deleteResume = useCallback((id: string) => {
        try {
            handleDeleteResume(id);
            useToastStore.getState().addToast({ type: 'success', message: 'Resume deleted' });
        } catch (error) {
            const message = errorService.handleError(error as Error, {
                component: 'useResumeManagement',
                action: 'deleteResume',
                resumeId: id
            });
            useToastStore.getState().addToast({ type: 'error', message });
        }
    }, [handleDeleteResume]);

    /**
     * Update user profile (simple passthrough)
     */
    const updateProfile = useCallback((profile: UserProfile) => {
        setUserProfile(profile);
    }, [setUserProfile]);

    return {
        // Data
        resumes,
        activeResumeId,
        currentResume,
        userProfile,

        // Actions
        addResume,
        selectResume,
        deleteResume,
        updateProfile,
        syncFromStorage // NEW: Pass through sync function
    };
};
