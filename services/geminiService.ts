/**
 * Backward Compatibility Re-export
 * 
 * This file re-exports from the new domain location.
 * New code should import directly from:
 *   import * as GeminiService from './domains/intelligence/services/gemini';
 * 
 * @deprecated Import from './domains/intelligence/services/gemini' instead
 */

export {
  extractResumeText,
  researchCompany,
  analyzeResume,
  generateCoverLetter,
  generateLinkedInMessage,
  generateInterviewQuestions,
  extractJobFromUrl
} from '../domains/intelligence/services/gemini';
