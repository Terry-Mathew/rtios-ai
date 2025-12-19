/**
 * Gemini API Response Type Definitions
 * 
 * Minimal interfaces for Gemini API response shapes used in the application.
 * These types are used to safely narrow unknown API responses without using `any`.
 */

/**
 * Grounding web reference (from Gemini grounding metadata)
 */
export interface GroundingWeb {
  title?: string;
  uri?: string;
}

/**
 * Grounding chunk (from Gemini grounding metadata)
 */
export interface GroundingChunk {
  web?: GroundingWeb;
}

/**
 * Type guard for GroundingChunk
 */
export function isGroundingChunk(data: unknown): data is GroundingChunk {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  
  // web is optional, but if present must be an object
  if (obj.web !== undefined) {
    if (typeof obj.web !== 'object' || obj.web === null) return false;
    const web = obj.web as Record<string, unknown>;
    
    // title and uri are optional strings
    if (web.title !== undefined && typeof web.title !== 'string') return false;
    if (web.uri !== undefined && typeof web.uri !== 'string') return false;
  }
  
  return true;
}

/**
 * Extract web sources from grounding chunks safely
 */
export function extractWebSources(chunks: unknown[]): Array<{ title: string; uri: string }> {
  const sources: Array<{ title: string; uri: string }> = [];
  
  for (const chunk of chunks) {
    if (!isGroundingChunk(chunk)) continue;
    if (!chunk.web) continue;
    
    const { title, uri } = chunk.web;
    if (title && uri) {
      sources.push({ title, uri });
    }
  }
  
  return sources;
}

