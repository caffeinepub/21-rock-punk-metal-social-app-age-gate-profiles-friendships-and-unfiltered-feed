/**
 * Shared validation helpers for display names and other user inputs.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const MIN_DISPLAY_NAME_LENGTH = 5;
const MAX_DISPLAY_NAME_LENGTH = 50;

/**
 * Validates a display name according to platform rules:
 * - Length: 5-50 characters
 * - Allowed characters: letters (A-Z, a-z), numbers (0-9), hyphens (-)
 * - No spaces, special characters, or punctuation
 */
export function validateDisplayName(name: string): ValidationResult {
  // Check length
  if (name.length < MIN_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`,
    };
  }

  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Display name must be no more than ${MAX_DISPLAY_NAME_LENGTH} characters`,
    };
  }

  // Check for invalid characters
  const validCharPattern = /^[A-Za-z0-9-]+$/;
  if (!validCharPattern.test(name)) {
    // Find the first invalid character for a helpful error message
    const invalidChar = name.split('').find((char) => !/[A-Za-z0-9-]/.test(char));
    return {
      isValid: false,
      error: `Display name contains invalid character: '${invalidChar}'. Only letters, numbers, and hyphens are allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Returns a user-friendly description of display name rules.
 */
export function getDisplayNameRules(): string {
  return `5-50 characters; letters, numbers, and hyphens only`;
}
