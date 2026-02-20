/**
 * Detects if the app is running inside a Facebook/Messenger/Instagram in-app browser
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent || '';
  
  // Check for Facebook/Messenger/Instagram in-app browsers
  const isFacebookBrowser = /\bFB[\w_]+\//i.test(userAgent) || /\bFBAV\//i.test(userAgent);
  const isMessengerBrowser = /\bFBAN\/MessengerForiOS/i.test(userAgent) || /\bFB_IAB\/MESSENGER/i.test(userAgent) || /\bMessenger\//i.test(userAgent);
  const isInstagramBrowser = /\bInstagram/i.test(userAgent);
  
  return isFacebookBrowser || isMessengerBrowser || isInstagramBrowser;
}

/**
 * Returns the name of the detected in-app browser
 */
export function getInAppBrowserName(): string {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'in-app browser';
  }

  const userAgent = window.navigator.userAgent || '';
  
  if (/\bMessenger\//i.test(userAgent) || /\bFBAN\/MessengerForiOS/i.test(userAgent) || /\bFB_IAB\/MESSENGER/i.test(userAgent)) {
    return 'Facebook Messenger';
  }
  
  if (/\bInstagram/i.test(userAgent)) {
    return 'Instagram';
  }
  
  if (/\bFB[\w_]+\//i.test(userAgent) || /\bFBAV\//i.test(userAgent)) {
    return 'Facebook';
  }
  
  return 'in-app browser';
}

/**
 * Returns step-by-step instructions for opening in external browser
 */
export function getExternalBrowserInstructions(): string[] {
  const browserName = getInAppBrowserName();
  
  if (browserName === 'Facebook Messenger') {
    return [
      'Tap the three dots (⋯) menu in the top right corner',
      'Select "Open in browser" or "Open in Chrome/Safari"',
      'The app will open in your phone\'s default browser'
    ];
  }
  
  if (browserName === 'Instagram') {
    return [
      'Tap the three dots (⋯) menu in the top right corner',
      'Select "Open in browser" or "Open in external browser"',
      'The app will open in your phone\'s default browser'
    ];
  }
  
  // Generic Facebook or other in-app browser
  return [
    'Tap the menu icon (usually three dots or lines)',
    'Look for "Open in browser" or "Open in external browser"',
    'Select your preferred browser (Chrome, Safari, etc.)'
  ];
}
