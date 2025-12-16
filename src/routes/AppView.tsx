/**
 * AppView.tsx - Main Application View Component
 * 
 * This component contains the main app layout (NavigationSidebar + Features + RightSidebar).
 * Extracted from App.tsx to support React Router v6 integration.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../stores/appStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { NavigationSidebar } from '../components/layout/NavigationSidebar';
import { RightSidebar } from '../components/layout/RightSidebar';
import { CoverLetterFeature } from '../features/CoverLetterFeature';
import { LinkedInFeature } from '../features/LinkedInFeature';
import { InterviewPrepFeature } from '../features/InterviewPrepFeature';
import ContextSwitcher from '../../components/ContextSwitcher';
import { useCareerContext } from '../../domains/career/hooks/useCareerContext';
import { useJobApplications } from '../../domains/jobs/hooks/useJobApplications';
import { createSnapshot } from '../../domains/jobs/controllers/JobSnapshotController';
import { AppStatus, SavedResume, JobInfo, ToneType } from '../../types';
import { Layout } from 'lucide-react';
import { fileToBase64 } from '../../utils/fileUtils';
import * as GeminiService from '../../domains/intelligence/services/gemini';

const AppView: React.FC = () => {
    const navigate = useNavigate();

    // --- Navigation State from appStore ---
    const activeModule = useAppStore((s) => s.activeModule);
    const setActiveModule = useAppStore((s) => s.setActiveModule);
    const activeSidebarTab = useAppStore((s) => s.activeSidebarTab);
    const setActiveSidebarTab = useAppStore((s) => s.setActiveSidebarTab);

    // --- Domain Hooks (with built-in persistence) ---
    const {
        resumes,
        activeResumeId,
        userProfile,
        currentResume,
        addResume: addResumeToContext,
        selectResume: handleSelectResume,
        deleteResume: handleDeleteResume,
        updateProfile: setUserProfile,
        setResumes,
        setActiveResumeId
    } = useCareerContext();

    const {
        jobs,
        activeJobId,
        addJob: addJobToApplications,
        deleteJob: handleDeleteJob,
        updateJobOutputs,
        setJobs,
        setActiveJobId
    } = useJobApplications();

    // Derived Active Data
    const currentJob = jobs.find(j => j.id === activeJobId) || {
        title: '',
        company: '',
        description: '',
        companyUrl: ''
    };

    // --- Workspace State from workspaceStore ---
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
        setError,
        setResumeText,
        setResearch,
        setAnalysis,
        updateCoverLetter,
        updateLinkedIn,
        updateInterviewPrep,
        clearWorkspace: clearWorkspaceStore
    } = useWorkspaceStore();

    // --- Helper: Sync Current AppState to Active Job History ---
    const snapshotCurrentStateToJob = useCallback((jobIdToUpdate: string | null) => {
        if (!jobIdToUpdate) return;

        // Use controller to create snapshot
        const snapshot = createSnapshot(appState);
        updateJobOutputs(jobIdToUpdate, snapshot);
    }, [appState, updateJobOutputs]);

    // --- Library Handlers ---
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

            // Use hook method (handles single resume enforcement + persistence)
            addResumeToContext(newResume);
            setStatus(AppStatus.IDLE);
            setResumeText(text);
        } catch (e) {
            handleError("Failed to upload and parse resume.");
        }
    };

    const handleAddJob = (job: JobInfo) => {
        // If we are currently on another job, snapshot it first
        if (activeJobId) snapshotCurrentStateToJob(activeJobId);

        // Use hook method (handles ID generation + persistence)
        addJobToApplications(job);

        // Reset workspace for new job (using store action)
        clearWorkspaceStore(appState.linkedIn.input);
        setStatus(AppStatus.IDLE);
    };

    const handleSelectStrategy = (jobId: string) => {
        // 1. Save current workspace state to the OLD job (using controller)
        if (activeJobId) {
            const snapshot = createSnapshot(appState);
            updateJobOutputs(activeJobId, snapshot);
        }

        // 2. Hydrate workspace from the NEW job (using controller)
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

        // Ensure we are using the current resume (legacy support for linkedResumeId)
        if (resumes.length > 0) {
            handleSelectResume(resumes[0].id);
        }

        setActiveJobId(jobId);
    };

    const handleAddNewStrategy = () => {
        setActiveSidebarTab('input');
        // Snapshot before clearing
        if (activeJobId) snapshotCurrentStateToJob(activeJobId);
        setActiveJobId(null);

        // Clear workspace (using store action)
        clearWorkspaceStore(appState.linkedIn.input);
        setStatus(AppStatus.IDLE);
    };

    const handleDeleteJobWithWorkspaceClear = (id: string) => {
        const wasActive = activeJobId === id;
        handleDeleteJob(id);
        if (wasActive) {
            // Clear workspace (using store action)
            clearWorkspaceStore(appState.linkedIn.input);
        }
    };

    const handleError = (message: string) => {
        setStatus(AppStatus.ERROR);
        setError(message);
    };

    const handleGenerate = async () => {
        if (!currentResume || !currentJob.title) return;

        setResumeText(currentResume.textParams);
        setStatus(AppStatus.RESEARCHING);
        setError(undefined);

        try {
            // 1. Parallel: Research & Analysis
            const researchPromise = GeminiService.researchCompany(currentJob.company, currentJob.companyUrl);
            const analysisPromise = GeminiService.analyzeResume(currentResume.textParams, currentJob, { portfolio: userProfile.portfolioUrl, linkedin: userProfile.linkedinUrl });

            const [researchResult, analysisResult] = await Promise.all([researchPromise, analysisPromise]);

            setResearch(researchResult);
            setAnalysis(analysisResult);
            setStatus(AppStatus.GENERATING);

            // 2. Generate Cover Letter (Default Action)
            const coverLetterText = await GeminiService.generateCoverLetter(
                currentResume.textParams,
                currentJob,
                researchResult,
                ToneType.PROFESSIONAL,
                { portfolio: userProfile.portfolioUrl, linkedin: userProfile.linkedinUrl }
            );

            const newCoverLetterState = {
                content: coverLetterText,
                tone: ToneType.PROFESSIONAL,
                isGenerating: false
            };

            setStatus(AppStatus.COMPLETED);
            updateCoverLetter(newCoverLetterState);

            // Update History
            if (activeJobId) {
                setJobs(prev => prev.map(j => j.id === activeJobId ? {
                    ...j,
                    outputs: {
                        ...j.outputs,
                        research: researchResult,
                        analysis: analysisResult,
                        coverLetter: newCoverLetterState
                    }
                } : j));
            }

            // Switch Sidebar to Analysis on completion
            setActiveSidebarTab('analysis');

        } catch (e: any) {
            handleError(e.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="flex h-screen bg-surface-base text-text-primary overflow-hidden">
            {/* 1. Left Navigation Sidebar (Vertical) */}
            <NavigationSidebar
                onLogoClick={() => navigate('/')}
                onSnapshotBeforeDashboard={() => {
                    if (activeJobId) snapshotCurrentStateToJob(activeJobId);
                }}
            />

            {/* 2. Main Content Area (Flexible) */}
            <main className="flex-1 flex flex-col bg-surface-base relative border-r border-white/5 min-w-0 overflow-hidden">
                {/* Global Context Switcher */}
                <ContextSwitcher
                    jobs={jobs}
                    activeJobId={activeJobId}
                    resumes={resumes}
                    activeResumeId={activeResumeId}
                    onSelectStrategy={handleSelectStrategy}
                    onAddNew={handleAddNewStrategy}
                />

                {/* Loading Overlay */}
                {(appState.status === AppStatus.PARSING_RESUME || appState.status === AppStatus.RESEARCHING || appState.status === AppStatus.ANALYZING || appState.status === AppStatus.GENERATING) && (
                    <div className="absolute inset-0 bg-surface-base/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-r-2 border-white/20 rounded-full animate-spin [animation-direction:reverse]"></div>
                            </div>
                            <div className="font-interstate text-xs font-bold text-accent uppercase tracking-[0.2em] animate-pulse">
                                {appState.status === AppStatus.PARSING_RESUME && "Ingesting Profile Data..."}
                                {appState.status === AppStatus.RESEARCHING && "Running Market Intelligence..."}
                                {appState.status === AppStatus.ANALYZING && "Calculating Fit Score..."}
                                {appState.status === AppStatus.GENERATING && "Synthesizing Draft..."}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {appState.status === AppStatus.IDLE && activeModule !== 'linkedin' && !activeJobId && !activeResumeId && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none mt-20">
                        <Layout className="w-24 h-24 text-text-secondary mb-4" />
                        <h1 className="font-tiempos text-3xl text-text-primary">Rtios AI</h1>
                        <p className="font-interstate text-sm text-text-secondary mt-2">Executive Intelligence Suite</p>
                    </div>
                )}

                {/* Module Render */}
                <>
                    <div className={`h-full flex flex-col ${activeModule === 'coverLetter' ? 'block' : 'hidden'}`}>
                        <CoverLetterFeature
                            currentResume={currentResume}
                            currentJob={currentJob}
                            userProfile={userProfile}
                            activeJobId={activeJobId}
                            onUpdateJobOutputs={updateJobOutputs}
                        />
                    </div>
                    <div className={`h-full flex flex-col ${activeModule === 'linkedin' ? 'block' : 'hidden'}`}>
                        <LinkedInFeature
                            currentResume={currentResume}
                            currentJob={currentJob}
                            activeJobId={activeJobId}
                            onUpdateJobOutputs={updateJobOutputs}
                        />
                    </div>
                    <div className={`h-full flex flex-col ${activeModule === 'interview' ? 'block' : 'hidden'}`}>
                        <InterviewPrepFeature
                            currentResume={currentResume}
                            currentJob={currentJob}
                            activeJobId={activeJobId}
                            onUpdateJobOutputs={updateJobOutputs}
                        />
                    </div>
                </>
            </main>

            {/* 3. Right Sidebar (Context & Intelligence) */}
            <RightSidebar
                resumes={resumes}
                activeResumeId={activeResumeId}
                userProfile={userProfile}
                onAddResume={handleAddResume}
                onSelectResume={handleSelectResume}
                onDeleteResume={handleDeleteResume}
                onUpdateProfile={setUserProfile}
                jobs={jobs}
                activeJobId={activeJobId}
                onAddJob={handleAddJob}
                onSelectJob={handleSelectStrategy}
                onDeleteJob={handleDeleteJobWithWorkspaceClear}
                onGenerate={handleGenerate}
                appStatus={appState.status}
            />
        </div>
    );
};

export default AppView;
