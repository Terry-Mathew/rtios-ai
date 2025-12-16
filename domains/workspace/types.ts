/**
 * Workspace Domain Types
 * 
 * Owns: Transient UI state (derived, execution-only)
 * Invariant: Must not own persistent state, must be derivable/hydrated
 * 
 * NOTE: Workspace is DERIVED STATE, not an owning domain.
 * These types represent transient UI state that is reconstructed
 * from JobApplications outputs when switching contexts.
 */

import type { SavedResume } from '../career/types';
import type { JobInfo } from '../jobs/types';
import type { 
  ResearchResult, 
  AnalysisResult, 
  ToneType, 
  LinkedInMessageInput,
  InterviewQuestion 
} from '../intelligence/types';

// Re-export ToneType for convenience (used in CoverLetterState)
export { ToneType } from '../intelligence/types';

export interface CoverLetterState {
  content: string;
  isGenerating: boolean;
  tone: ToneType;
}

export interface LinkedInState {
  input: LinkedInMessageInput;
  generatedMessage: string;
  isGenerating: boolean;
}

export interface InterviewPrepState {
  questions: InterviewQuestion[];
  isGenerating: boolean;
}

export interface LibraryState {
  resumes: SavedResume[];
  jobs: JobInfo[];
}

export enum AppStatus {
  IDLE = 'idle',
  PARSING_RESUME = 'parsing_resume',
  PARSING_JOB_LINK = 'parsing_job_link',
  RESEARCHING = 'researching',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type View = 'landing' | 'app' | 'dashboard' | 'pricing' | 'terms' | 'privacy' | 'cookie' | 'about';

export interface AppState {
  status: AppStatus;
  error?: string;
  library: LibraryState;
  activeJobId: string | null;
  resumeText: string;
  research: ResearchResult | null;
  analysis: AnalysisResult | null;
  coverLetter: CoverLetterState;
  linkedIn: LinkedInState;
  interviewPrep: InterviewPrepState;
}

