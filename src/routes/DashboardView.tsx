/**
 * DashboardView.tsx - Dashboard Route Wrapper
 * 
 * This component wraps the Dashboard component and provides it with data from hooks.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { useCareerContext } from '../../domains/career/hooks/useCareerContext';
import { useJobApplications } from '../../domains/jobs/hooks/useJobApplications';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { createSnapshot } from '../../domains/jobs/controllers/JobSnapshotController';
import { AppStatus } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
import * as GeminiService from '../../domains/intelligence/services/gemini';
import { SavedResume } from '../../types';

const DashboardView: React.FC = () => {
    const navigate = useNavigate();

    const {
        resumes,
        activeResumeId,
        userProfile,
        addResume: addResumeToContext,
        selectResume: handleSelectResume,
        deleteResume: handleDeleteResume,
        updateProfile: setUserProfile,
    } = useCareerContext();

    const {
        jobs,
        activeJobId,
        deleteJob: handleDeleteJob,
        updateJobOutputs,
        setActiveJobId
    } = useJobApplications();

    const appState = useWorkspaceStore((s) => ({
        status: s.status,
        error: s.error,
        resumeText: s.resumeText,
        research: s.research,
        analysis: s.analysis,
        coverLetter: s.coverLetter,
        linkedIn: s.linkedIn,
        interviewPrep: s.interviewPrep
    }));

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

    const handleAddResume = async (file: File) => {
        setStatus(AppStatus.PARSING_RESUME);
        try {
            const base64 = await fileToBase64(file);
            const text = await GeminiService.extractResumeText(base64);

            const newResume: SavedResume = {
                id: crypto.randomUUID(),
                fileName: file.name,
                file: file,
                textParams: text,
                uploadDate: new Date()
            };

            addResumeToContext(newResume);
            setStatus(AppStatus.IDLE);
            setResumeText(text);
        } catch (e) {
            setStatus(AppStatus.ERROR);
        }
    };

    const handleSelectStrategy = (jobId: string) => {
        // Save current workspace state to the OLD job
        if (activeJobId) {
            const snapshot = createSnapshot(appState);
            updateJobOutputs(activeJobId, snapshot);
        }

        // Hydrate workspace from the NEW job
        const targetJob = jobs.find(j => j.id === jobId);
        const { hydrateFromJob } = require('../../domains/jobs/controllers/JobSnapshotController');
        const hydratedState = hydrateFromJob(targetJob, appState.linkedIn.input);

        // Apply hydrated state to workspace store
        if (hydratedState.status) setStatus(hydratedState.status);
        if (hydratedState.resumeText !== undefined) setResumeText(hydratedState.resumeText);
        if (hydratedState.research !== undefined) setResearch(hydratedState.research);
        if (hydratedState.analysis !== undefined) setAnalysis(hydratedState.analysis);
        if (hydratedState.coverLetter) updateCoverLetter(hydratedState.coverLetter);
        if (hydratedState.linkedIn) updateLinkedIn(hydratedState.linkedIn);
        if (hydratedState.interviewPrep) updateInterviewPrep(hydratedState.interviewPrep);
        setStatus(AppStatus.IDLE);

        // Ensure we are using the current resume
        if (resumes.length > 0) {
            handleSelectResume(resumes[0].id);
        }

        setActiveJobId(jobId);
    };

    const handleDeleteJobWithWorkspaceClear = (id: string) => {
        const wasActive = activeJobId === id;
        handleDeleteJob(id);
        if (wasActive) {
            clearWorkspaceStore(appState.linkedIn.input);
        }
    };

    const handleNavigateToApp = () => {
        navigate('/app');
    };

    return (
        <Dashboard
            jobs={jobs}
            resumes={resumes}
            userProfile={userProfile}
            activeJobId={activeJobId}
            activeResumeId={activeResumeId}
            onSelectStrategy={handleSelectStrategy}
            onDeleteJob={handleDeleteJobWithWorkspaceClear}
            onDeleteResume={handleDeleteResume}
            onAddResume={handleAddResume}
            onUpdateProfile={setUserProfile}
            onNavigateToApp={handleNavigateToApp}
        />
    );
};

export default DashboardView;
