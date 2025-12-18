/**
 * useJobManagement Hook
 * 
 * Consolidates all job management logic from route components:
 * - Job CRUD operations (add, delete, select)
 * - Workspace synchronization (snapshot/hydrate)
 * - Job switching with automatic state preservation
 * 
 * This hook eliminates duplicate logic between AppView and DashboardView
 * and provides a single source of truth for job management operations.
 */

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useJobApplications } from '../../domains/jobs/hooks/useJobApplications';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { createSnapshot, hydrateFromJob } from '../../domains/jobs/controllers/JobSnapshotController';
import { AppStatus } from '../../types';
import type { JobInfo } from '../../types';

interface UseJobManagementReturn {
    // Data
    jobs: JobInfo[];
    activeJobId: string | null;
    currentJob: JobInfo;

    // Actions
    addJob: (job: JobInfo) => void;
    selectJob: (jobId: string) => void;
    deleteJob: (jobId: string) => void;
    deleteJobWithWorkspaceClear: (jobId: string) => void;
    snapshotCurrentJob: () => void;
    addNewJobStrategy: () => void;

    // Low-level operations
    updateJobOutputs: (jobId: string, outputs: any) => void;
    setActiveJobId: (id: string | null) => void;
    setJobs: React.Dispatch<React.SetStateAction<JobInfo[]>>;
}

export const useJobManagement = (): UseJobManagementReturn => {
    // Get job domain state
    const {
        jobs,
        activeJobId,
        addJob: addJobToApplications,
        deleteJob: handleDeleteJob,
        updateJobOutputs,
        setActiveJobId,
        setJobs
    } = useJobApplications();

    // Get workspace state and actions (using useShallow to prevent infinite re-renders)
    const appState = useWorkspaceStore(useShallow((s) => ({
        status: s.status,
        error: s.error,
        resumeText: s.resumeText,
        research: s.research,
        analysis: s.analysis,
        coverLetter: s.coverLetter,
        linkedIn: s.linkedIn,
        interviewPrep: s.interviewPrep
    })));

    const {
        setStatus,
        setResumeText,
        setResearch,
        setAnalysis,
        updateCoverLetter,
        updateLinkedIn,
        updateInterviewPrep,
        clearWorkspace: clearWorkspaceStore
    } = useWorkspaceStore();

    // Derived data
    const currentJob = jobs.find(j => j.id === activeJobId) || {
        id: '',
        title: '',
        company: '',
        description: '',
        companyUrl: ''
    };

    // Snapshot current workspace to active job
    const snapshotCurrentJob = useCallback(() => {
        if (!activeJobId) return;
        const snapshot = createSnapshot(appState);
        updateJobOutputs(activeJobId, snapshot);
    }, [activeJobId, updateJobOutputs]);

    // Add new job (snapshots current first)
    const addJob = useCallback((job: JobInfo) => {
        if (activeJobId) snapshotCurrentJob();
        addJobToApplications(job);
        clearWorkspaceStore(appState.linkedIn.input);
        setStatus(AppStatus.IDLE);
    }, [activeJobId, snapshotCurrentJob, addJobToApplications, clearWorkspaceStore, setStatus]);

    // Select/switch to different job
    const selectJob = useCallback((jobId: string) => {
        // 1. Snapshot current job
        if (activeJobId) {
            const snapshot = createSnapshot(appState);
            updateJobOutputs(activeJobId, snapshot);
        }

        // 2. Hydrate from target job
        const targetJob = jobs.find(j => j.id === jobId);
        const hydratedState = hydrateFromJob(targetJob, appState.linkedIn.input);

        // 3. Apply to workspace store
        if (hydratedState.status) setStatus(hydratedState.status);
        if (hydratedState.resumeText !== undefined) setResumeText(hydratedState.resumeText);
        if (hydratedState.research !== undefined) setResearch(hydratedState.research);
        if (hydratedState.analysis !== undefined) setAnalysis(hydratedState.analysis);
        if (hydratedState.coverLetter) updateCoverLetter(hydratedState.coverLetter);
        if (hydratedState.linkedIn) updateLinkedIn(hydratedState.linkedIn);
        if (hydratedState.interviewPrep) updateInterviewPrep(hydratedState.interviewPrep);
        setStatus(AppStatus.IDLE);

        // 4. Set as active
        setActiveJobId(jobId);
    }, [
        activeJobId,
        jobs,
        updateJobOutputs,
        setStatus,
        setResumeText,
        setResearch,
        setAnalysis,
        updateCoverLetter,
        updateLinkedIn,
        updateInterviewPrep,
        setActiveJobId
    ]);

    // Delete job (simple)
    const deleteJob = useCallback((jobId: string) => {
        handleDeleteJob(jobId);
    }, [handleDeleteJob]);

    // Delete job with workspace clear
    const deleteJobWithWorkspaceClear = useCallback((jobId: string) => {
        const wasActive = activeJobId === jobId;
        handleDeleteJob(jobId);
        if (wasActive) {
            clearWorkspaceStore(appState.linkedIn.input);
        }
    }, [activeJobId, handleDeleteJob, clearWorkspaceStore]);

    // Add new job strategy (clears workspace)
    const addNewJobStrategy = useCallback(() => {
        if (activeJobId) snapshotCurrentJob();
        setActiveJobId(null);
        clearWorkspaceStore(appState.linkedIn.input);
        setStatus(AppStatus.IDLE);
    }, [activeJobId, snapshotCurrentJob, setActiveJobId, clearWorkspaceStore, setStatus]);

    return {
        // Data
        jobs,
        activeJobId,
        currentJob,

        // Actions
        addJob,
        selectJob,
        deleteJob,
        deleteJobWithWorkspaceClear,
        snapshotCurrentJob,
        addNewJobStrategy,

        // Low-level
        updateJobOutputs,
        setActiveJobId,
        setJobs
    };
};
