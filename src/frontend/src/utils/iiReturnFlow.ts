/**
 * Detects if the current URL is an Internet Identity return/callback URL
 */
export function isInternetIdentityReturnUrl(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const url = window.location.href;
  const hash = window.location.hash;
  
  // Check for common Internet Identity callback patterns
  const hasIICallback = url.includes('/callback') || 
                        url.includes('id.ai/callback') ||
                        hash.includes('state=') ||
                        hash.includes('code=') ||
                        url.includes('#authorize');
  
  return hasIICallback;
}
