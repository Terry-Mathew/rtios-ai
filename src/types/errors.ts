/**
 * Error Type Definitions
 * 
 * Shared error types, guards, and normalization helpers for safe error handling.
 * Use these to convert `unknown` catch blocks into typed Error objects.
 */

/**
 * Minimal error-like interface for objects that have a message
 */
export interface ErrorLike {
  message: string;
  stack?: string;
  name?: string;
}

/**
 * Type guard: is this value an Error instance?
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard: does this value have error-like shape?
 */
export function isErrorLike(value: unknown): value is ErrorLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

/**
 * Convert unknown value to Error (safe normalization)
 */
export function toError(value: unknown): Error {
  // Already an Error
  if (isError(value)) {
    return value;
  }
  
  // Error-like object
  if (isErrorLike(value)) {
    const error = new Error(value.message);
    if (value.stack) error.stack = value.stack;
    if (value.name) error.name = value.name;
    return error;
  }
  
  // String
  if (typeof value === 'string') {
    return new Error(value);
  }
  
  // Fallback: try to stringify
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error('Unknown error');
  }
}

/**
 * Extract error message from unknown value (safe)
 */
export function getErrorMessage(value: unknown): string {
  if (isError(value)) {
    return value.message;
  }
  
  if (isErrorLike(value)) {
    return value.message;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  try {
    return JSON.stringify(value);
  } catch {
    return 'Unknown error';
  }
}

