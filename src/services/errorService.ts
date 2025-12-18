export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    jobId?: string;
    resumeId?: string;
    [key: string]: any;
}

export interface ErrorServiceReturn {
    logError: (error: Error, context?: ErrorContext) => void;
    handleError: (error: Error, context?: ErrorContext) => string;
    isNetworkError: (error: Error) => boolean;
    isAuthError: (error: Error) => boolean;
    isValidationError: (error: Error) => boolean;
}

class ErrorService implements ErrorServiceReturn {
    // Log error to console or external service
    logError(error: Error, context?: ErrorContext) {
        const timestamp = new Date().toISOString();
        const errorLog = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp,
            userAgent: navigator.userAgent,
        };

        if (import.meta.env.DEV) {
            console.groupCollapsed(`[ErrorService] ${error.message}`);
            console.error(error);
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
    handleError(error: Error, context?: ErrorContext): string {
        this.logError(error, context);

        if (this.isNetworkError(error)) {
            return "Connection issue. Please check your internet and try again.";
        }

        if (this.isAuthError(error)) {
            return "Your session has expired. Please log in again.";
        }

        if (this.isValidationError(error)) {
            // Often validation errors might have specific messages we want to show
            return error.message || "Please check your input and try again.";
        }

        if (this.isAIError(error)) {
            return "AI service temporarily unavailable. Please try again in a moment.";
        }

        if (this.isFileUploadError(error)) {
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
