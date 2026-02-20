/**
 * Gateway fallback utilities for handling ICP gateway resolution errors
 * Provides automatic retry logic with alternative gateway URLs
 */

export interface GatewayError {
  isGatewayError: boolean;
  originalError: unknown;
  message: string;
}

/**
 * Detects if an error is a gateway resolution error
 */
export function isGatewayResolutionError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : errorString;

  const gatewayErrorPatterns = [
    'canister id not resolved',
    'canister not found',
    'gateway could not determine',
    'domain not recognized',
    'cannot resolve',
    'replica error',
    'boundary node',
    'http gateway error',
    'failed to fetch',
    'network error',
  ];

  return gatewayErrorPatterns.some((pattern) => 
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );
}

/**
 * Builds an alternative gateway URL using raw.icp0.io
 */
export function buildAlternativeGatewayUrl(originalUrl?: string): string | null {
  if (!originalUrl) {
    // Try to extract from current window location
    const hostname = window.location.hostname;
    if (hostname.includes('.icp0.io')) {
      return hostname.replace('.icp0.io', '.raw.icp0.io');
    }
    return null;
  }

  // Replace .icp0.io with .raw.icp0.io
  return originalUrl.replace('.icp0.io', '.raw.icp0.io');
}

/**
 * Logs gateway errors for debugging
 */
export function logGatewayError(error: unknown, context: string): void {
  console.error(`[Gateway Error - ${context}]`, {
    error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
};

/**
 * Calculates exponential backoff delay
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Wraps an async function with retry logic for gateway errors
 */
export async function retryWithGatewayFallback<T>(
  fn: () => Promise<T>,
  context: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (isGatewayResolutionError(error)) {
        logGatewayError(error, `${context} (attempt ${attempt + 1}/${retryConfig.maxAttempts})`);

        // If not the last attempt, wait before retrying
        if (attempt < retryConfig.maxAttempts - 1) {
          const delay = calculateBackoffDelay(attempt, retryConfig);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // If it's not a gateway error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError;
}

/**
 * Analyzes error and returns user-friendly message
 */
export function getGatewayErrorMessage(error: unknown): string {
  if (!isGatewayResolutionError(error)) {
    return 'An unexpected error occurred';
  }

  return 'Unable to connect to the Internet Computer gateway. This is usually temporary. Please try again in a few moments.';
}
