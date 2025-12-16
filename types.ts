/**
 * Root Types - Re-exports from Domain Types
 * 
 * This file re-exports all types from domain-specific type files
 * for backward compatibility. New code should import directly from
 * the appropriate domain:
 * 
 * - Career types: import from './domains/career/types'
 * - Job types: import from './domains/jobs/types'
 * - Intelligence types: import from './domains/intelligence/types'
 * - Workspace types: import from './domains/workspace/types'
 */

// Career Domain
export type { SavedResume, UserProfile } from './domains/career/types';

// Jobs Domain
export type { JobInfo, JobOutputs } from './domains/jobs/types';

// Intelligence Domain
export { 
  ToneType,
  CONNECTION_CONTEXTS,
  MESSAGE_INTENTS 
} from './domains/intelligence/types';
export type { 
  ResearchResult, 
  AnalysisResult, 
  InterviewQuestion,
  ConnectionStatus,
  LinkedInTone,
  LinkedInMessageInput
} from './domains/intelligence/types';

// Workspace Domain
export { AppStatus } from './domains/workspace/types';
export type { 
  AppState, 
  View, 
  LibraryState,
  CoverLetterState, 
  LinkedInState, 
  InterviewPrepState 
} from './domains/workspace/types';
