import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../stores/workspaceStore';
import InterviewPrepDisplay from '../../components/InterviewPrepDisplay';
import * as AIOrchestrator from '../../domains/intelligence/services/orchestrator';
import type { SavedResume, JobInfo } from '../../types';

interface InterviewPrepFeatureProps {
    currentResume: SavedResume | null;
    currentJob: JobInfo;
    activeJobId: string | null;
    onUpdateJobOutputs: (jobId: string, updates: any) => void;
}

export const InterviewPrepFeature: React.FC<InterviewPrepFeatureProps> = ({
    currentResume,
    currentJob,
    activeJobId,
    onUpdateJobOutputs
}) => {
    // Get state with useShallow (CRITICAL - prevents infinite loops)
    const interviewPrep = useWorkspaceStore(
        useShallow((s) => s.interviewPrep)
    );

    // Get actions
    const { updateInterviewPrep } = useWorkspaceStore();

    const handleGenerateInterviewQuestions = async () => {
        if (!currentResume) return;

        updateInterviewPrep({ isGenerating: true });

        try {
            const existingQuestions = interviewPrep.questions.map(q => q.question);

            const newQuestions = await AIOrchestrator.generateInterview(
                currentResume.textParams,
                currentJob,
                existingQuestions
            );

            const updatedInterviewPrep = {
                questions: [...interviewPrep.questions, ...newQuestions],
                isGenerating: false
            };

            updateInterviewPrep(updatedInterviewPrep);

            // Update job history
            if (activeJobId) {
                onUpdateJobOutputs(activeJobId, {
                    interviewPrep: updatedInterviewPrep
                });
            }
        } catch (e) {
            console.error(e);
            updateInterviewPrep({ isGenerating: false });
        }
    };

    return (
        <InterviewPrepDisplay
            state={interviewPrep}
            jobInfo={currentJob}
            onGenerateMore={handleGenerateInterviewQuestions}
            canGenerate={!!currentResume}
        />
    );
};
