/**
 * Normalizes backend errors into user-friendly messages.
 * Strips internal stack traces and implementation details.
 */

export function normalizeBackendError(error: unknown): Error {
  const errorMessage = extractErrorMessage(error);
  
  // Rate limiting errors
  if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('too many requests')) {
    return new Error('Too many requests. Please wait a moment and try again.');
  }
  
  // Blocking errors
  if (errorMessage.includes('user is blocked') || errorMessage.includes('Cannot interact')) {
    return new Error('This action is not available because one of you has blocked the other.');
  }
  if (errorMessage.includes('Cannot view profile: user is blocked')) {
    return new Error('You cannot view this profile.');
  }
  if (errorMessage.includes('Cannot view posts: user is blocked')) {
    return new Error('You cannot view posts from this user.');
  }
  if (errorMessage.includes('Cannot view friends: user is blocked')) {
    return new Error('You cannot view this user\'s friends.');
  }
  if (errorMessage.includes('Cannot like post: user is blocked')) {
    return new Error('You cannot like this post.');
  }
  if (errorMessage.includes('Cannot send friend request: user is blocked')) {
    return new Error('You cannot send a friend request to this user.');
  }
  if (errorMessage.includes('Cannot respond to friend request: user is blocked')) {
    return new Error('You cannot respond to this friend request.');
  }
  
  // Validation errors - display name
  if (errorMessage.includes('Display name must be between')) {
    return new Error('Display name must be between 5 and 50 characters.');
  }
  if (errorMessage.includes('Display name contains invalid character')) {
    // Extract the specific error message from backend
    const match = errorMessage.match(/Display name contains invalid character: '(.+?)'\. Allowed characters: (.+)/);
    if (match) {
      return new Error(`Display name contains invalid character: '${match[1]}'. Only letters, numbers, and hyphens are allowed.`);
    }
    return new Error('Display name contains invalid characters. Only letters, numbers, and hyphens are allowed.');
  }
  if (errorMessage.includes('Display name is too long')) {
    return new Error('Display name is too long. Please use a shorter name (max 50 characters).');
  }
  if (errorMessage.includes('Display name cannot be empty')) {
    return new Error('Display name is required.');
  }
  
  // Validation errors - bio
  if (errorMessage.includes('Bio is too long')) {
    return new Error('Bio is too long. Please shorten your bio.');
  }
  
  // Validation errors - post content
  if (errorMessage.includes('Content is too long')) {
    return new Error('Post content is too long. Please shorten your message.');
  }
  if (errorMessage.includes('Content cannot be empty')) {
    return new Error('Post content cannot be empty.');
  }
  
  // Validation errors - genres and bands
  if (errorMessage.includes('Too many favorite genres')) {
    return new Error('Too many favorite genres selected. Please select fewer genres.');
  }
  if (errorMessage.includes('Too many favorite bands')) {
    return new Error('Too many favorite bands listed. Please reduce the number.');
  }
  if (errorMessage.includes('Genre text is too long')) {
    return new Error('Custom genre name is too long.');
  }
  if (errorMessage.includes('Band name is too long')) {
    return new Error('One or more band names are too long. Please shorten them.');
  }
  
  // Validation errors - location and avatar
  if (errorMessage.includes('Location is too long')) {
    return new Error('Location is too long. Please use a shorter location.');
  }
  if (errorMessage.includes('Avatar URL is too long')) {
    return new Error('Avatar URL is too long.');
  }
  
  // Validation errors - report
  if (errorMessage.includes('Reason is too long')) {
    return new Error('Report reason is too long. Please be more concise.');
  }
  if (errorMessage.includes('Reason cannot be empty')) {
    return new Error('Report reason is required.');
  }
  
  // Authorization errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Age verification required')) {
    return new Error('You do not have permission to perform this action.');
  }
  
  // Already exists/duplicate errors
  if (errorMessage.includes('Profile already exists')) {
    return new Error('Profile already exists.');
  }
  if (errorMessage.includes('Post already liked')) {
    return new Error('You already liked this post.');
  }
  
  // Not found errors
  if (errorMessage.includes('does not exist')) {
    return new Error('The requested item was not found.');
  }
  
  // Generic fallback - strip stack traces and internal details
  if (errorMessage.length > 0) {
    // Remove stack traces and internal implementation details
    const cleanMessage = errorMessage
      .split('\n')[0] // Take only first line
      .replace(/^Error:\s*/i, '') // Remove "Error:" prefix
      .replace(/\s*at\s+.*$/i, '') // Remove "at ..." stack info
      .trim();
    
    if (cleanMessage.length > 0 && cleanMessage.length < 200) {
      return new Error(cleanMessage);
    }
  }
  
  // Ultimate fallback
  return new Error('An error occurred. Please try again.');
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle various error object shapes
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    if ('toString' in error && typeof error.toString === 'function') {
      return error.toString();
    }
  }
  
  return '';
}
