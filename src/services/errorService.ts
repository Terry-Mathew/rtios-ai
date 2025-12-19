export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    jobId?: string;
    resumeId?: string;
    [key: string]: unknown; // Changed from any to unknown for type safety
}

export interface ErrorServiceReturn {
    logError: (error: unknown, context?: ErrorContext) => void;
    handleError: (error: unknown, context?: ErrorContext) => string;
    isNetworkError: (error: Error) => boolean;
    isAuthError: (error: Error) => boolean;
    isValidationError: (error: Error) => boolean;
}

class ErrorService implements ErrorServiceReturn {
    // Log error to console or external service
    logError(error: unknown, context?: ErrorContext) {
        // Normalize unknown to Error for consistent logging
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        
        const timestamp = new Date().toISOString();
        const errorLog = {
            message: normalizedError.message,
            stack: normalizedError.stack,
            context,
            timestamp,
            userAgent: navigator.userAgent,
        };

        if (import.meta.env.DEV) {
            console.groupCollapsed(`[ErrorService] ${normalizedError.message}`);
            console.error(normalizedError);
            console.info('Context:', context);
            console.groupEnd();
        } else {
            // In production, we would send this to Sentry or similar
            // console.error(JSON.stringify(errorLog)); 
            // Placeholder for production logging
            console.error('[PROD ERROR]', errorLog);
        }
    }

    // Handle error and return user-friendly message
    handleError(error: unknown, context?: ErrorContext): string {
        this.logError(error, context);

        // Normalize to Error for type checking
        const normalizedError = error instanceof Error ? error : new Error(String(error));

        if (this.isNetworkError(normalizedError)) {
            return "Connection issue. Please check your internet and try again.";
        }

        if (this.isAuthError(normalizedError)) {
            return "Your session has expired. Please log in again.";
        }

        if (this.isValidationError(normalizedError)) {
            // Often validation errors might have specific messages we want to show
            return normalizedError.message || "Please check your input and try again.";
        }

        if (this.isAIError(normalizedError)) {
            return "AI service temporarily unavailable. Please try again in a moment.";
        }

        if (this.isFileUploadError(normalizedError)) {
            return "Could not read file. Please ensure it's a valid format.";
        }

        // Default catch-all
        return "Something went wrong. Please try again.";
    }

    isNetworkError(error: Error): boolean {
        return (
            error.message.includes('Network Error') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('timeout')
        );
    }

    isAuthError(error: Error): boolean {
        return (
            error.message.includes('401') ||
            error.message.includes('403') ||
            error.message.includes('unauthorized') ||
            error.message.includes('forbidden')
        );
    }

    isValidationError(error: Error): boolean {
        return (
            error.message.toLowerCase().includes('validation') ||
            error.message.toLowerCase().includes('invalid')
        );
    }

    isAIError(error: Error): boolean {
        return (
            error.message.includes('429') || // Rate limit
            error.message.includes('503') || // Service unavailable
            error.message.toLowerCase().includes('gemini') ||
            error.message.toLowerCase().includes('ai')
        );
    }

    isFileUploadError(error: Error): boolean {
        return (
            error.message.toLowerCase().includes('file') ||
            error.message.toLowerCase().includes('upload') ||
            error.message.toLowerCase().includes('parsing')
        );
    }
}

export const errorService = new ErrorService();
