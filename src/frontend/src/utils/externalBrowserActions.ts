import { toast } from 'sonner';

/**
 * Attempts to copy the current URL to clipboard
 */
export async function copyCurrentUrl(): Promise<boolean> {
  const url = window.location.origin;
  
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success('App link copied to clipboard');
      return true;
    } else {
      throw new Error('Clipboard API not available');
    }
  } catch (error) {
    console.error('Copy error:', error);
    toast.error('Failed to copy link automatically');
    return false;
  }
}

/**
 * Best-effort attempt to open the current URL in an external browser
 */
export function openInExternalBrowser(): void {
  const url = window.location.origin;
  
  try {
    // Try to open in a new window/tab (may be blocked by in-app browser)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
      toast.success('Opening in your browser...');
    } else {
      // If blocked, show instructions
      toast.error('Please use the menu to open in your browser');
    }
  } catch (error) {
    console.error('External browser open error:', error);
    toast.error('Please use the menu to open in your browser');
  }
}
