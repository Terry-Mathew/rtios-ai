import React from 'react';
import { useAppStore } from '../../stores/appStore';
import InputForm from '../../../components/InputForm';
import ResumeAnalysisDisplay from '../../../components/ResumeAnalysisDisplay';
import CompanyResearchDisplay from '../../../components/CompanyResearchDisplay';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { SavedResume, UserProfile, JobInfo, AppStatus } from '../../../types';

interface RightSidebarProps {
    // Resume/Profile data
    resumes: SavedResume[];
    activeResumeId: string | null;
    userProfile: UserProfile;
    onAddResume: (file: File) => Promise<void>;
    onSelectResume: (id: string) => void;
    onDeleteResume: (id: string) => void;
    onUpdateProfile: (profile: UserProfile) => void;

    // Job data
    jobs: JobInfo[];
    activeJobId: string | null;
    onAddJob: (job: JobInfo) => void;
    onSelectJob: (id: string) => void;
    onDeleteJob: (id: string) => void;

    // Actions
    onGenerate: () => Promise<void>;
    appStatus: AppStatus;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    resumes,
    activeResumeId,
    userProfile,
    onAddResume,
    onSelectResume,
    onDeleteResume,
    onUpdateProfile,
    jobs,
    activeJobId,
    onAddJob,
    onSelectJob,
    onDeleteJob,
    onGenerate,
    appStatus
}) => {
    // Get tab state from appStore
    const activeSidebarTab = useAppStore((s) => s.activeSidebarTab);
    const setActiveSidebarTab = useAppStore((s) => s.setActiveSidebarTab);

    // Get workspace data for display components (use useShallow)
    const { research, analysis } = useWorkspaceStore(
        useShallow((s) => ({
            research: s.research,
            analysis: s.analysis
        }))
    );

    return (
        <aside className="w-[400px] xl:w-[35%] max-w-[600px] bg-surface-elevated border-l border-white/5 flex flex-col shrink-0 transition-all duration-300">

            {/* Sidebar Tabs */}
            <div className="flex items-center border-b border-white/5">
                <button
                    onClick={() => setActiveSidebarTab('input')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
            ${activeSidebarTab === 'input'
                            ? 'text-text-primary border-b border-accent bg-white/5'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Workspace
                </button>
                <button
                    onClick={() => setActiveSidebarTab('analysis')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
            ${activeSidebarTab === 'analysis'
                            ? 'text-text-primary border-b border-accent bg-white/5'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Analysis
                </button>
                <button
                    onClick={() => setActiveSidebarTab('research')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
            ${activeSidebarTab === 'research'
                            ? 'text-text-primary border-b border-accent bg-white/5'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Intel
                </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className={`h-full ${activeSidebarTab === 'input' ? 'block' : 'hidden'}`}>
                    <InputForm
                        resumes={resumes}
                        activeResumeId={activeResumeId}
                        onAddResume={onAddResume}
                        onSelectResume={onSelectResume}
                        onDeleteResume={onDeleteResume}
                        userProfile={userProfile}
                        onUpdateProfile={onUpdateProfile}
                        jobs={jobs}
                        activeJobId={activeJobId}
                        onAddJob={onAddJob}
                        onSelectJob={onSelectJob}
                        onDeleteJob={onDeleteJob}
                        onGenerate={onGenerate}
                        appStatus={appStatus}
                    />
                </div>
                <div className={`h-full ${activeSidebarTab === 'analysis' ? 'block' : 'hidden'}`}>
                    <ResumeAnalysisDisplay analysis={analysis} />
                </div>
                <div className={`h-full ${activeSidebarTab === 'research' ? 'block' : 'hidden'}`}>
                    <CompanyResearchDisplay research={research} />
                </div>
            </div>

        </aside>
    );
};
