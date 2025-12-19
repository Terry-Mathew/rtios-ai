import React, { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../stores/workspaceStore';
import CoverLetterDisplay from '../components/features/cover-letter/CoverLetterDisplay';
import * as AIOrchestrator from '../../domains/intelligence/services/orchestrator';
import { ToneType } from '../../types';
import type { SavedResume, JobInfo, UserProfile } from '../../types';

interface CoverLetterFeatureProps {
    currentResume: SavedResume | null;
    currentJob: JobInfo;
    userProfile: UserProfile;
    activeJobId: string | null;
    onUpdateJobOutputs: (jobId: string, updates: import('../../domains/jobs/types').JobOutputsUpdate) => void;
}

export const CoverLetterFeature: React.FC<CoverLetterFeatureProps> = ({
    currentResume,
    currentJob,
    userProfile,
    activeJobId,
    onUpdateJobOutputs
}) => {
    // Get workspace state with useShallow
    const { coverLetter, research } = useWorkspaceStore(
        useShallow((s) => ({
            coverLetter: s.coverLetter,
            research: s.research
        }))
    );

    // Get workspace actions
    const { updateCoverLetter } = useWorkspaceStore();

    const handleRegenerateCoverLetter = async (tone: ToneType) => {
        if (!currentResume || !research) return;

        updateCoverLetter({ isGenerating: true, tone });

        try {
            // Use orchestrator for cover letter regeneration
            const newContent = await AIOrchestrator.regenerateCoverLetter(
                currentResume.textParams,
                currentJob,
                research,
                tone,
                userProfile
            );

            const updatedCoverLetter = { content: newContent, isGenerating: false, tone };

            updateCoverLetter(updatedCoverLetter);

            // Update History
            if (activeJobId) {
                onUpdateJobOutputs(activeJobId, { coverLetter: updatedCoverLetter });
            }

        } catch (e) {
            console.error(e);
            updateCoverLetter({ isGenerating: false });
        }
    };

    const updateCoverLetterContent = useCallback((text: string) => {
        updateCoverLetter({ content: text });
    }, [updateCoverLetter]);

    return (
        <CoverLetterDisplay
            state={coverLetter}
            onUpdateContent={updateCoverLetterContent}
            onRegenerate={handleRegenerateCoverLetter}
        />
    );
};
