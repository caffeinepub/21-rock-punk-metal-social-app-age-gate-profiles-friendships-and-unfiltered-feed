/**
 * Device detection utilities for providing platform-specific instructions
 */

export type DeviceType = 'android-tablet' | 'android-phone' | 'ios-tablet' | 'ios-phone' | 'desktop';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';

/**
 * Detects the user's device type
 */
export function detectDeviceType(): DeviceType {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isTablet = /tablet|ipad/.test(userAgent) || (isAndroid && !/mobile/.test(userAgent));

  if (isAndroid) {
    return isTablet ? 'android-tablet' : 'android-phone';
  }

  if (isIOS) {
    return isTablet ? 'ios-tablet' : 'ios-phone';
  }

  return 'desktop';
}

/**
 * Detects the user's browser
 */
export function detectBrowser(): BrowserType {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/edg/.test(userAgent)) return 'edge';
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return 'chrome';
  if (/firefox/.test(userAgent)) return 'firefox';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'safari';

  return 'other';
}

/**
 * Gets device-specific cache clearing instructions
 */
export function getCacheClearingInstructions(deviceType?: DeviceType, browser?: BrowserType): string[] {
  const device = deviceType || detectDeviceType();
  const browserType = browser || detectBrowser();

  switch (device) {
    case 'android-tablet':
    case 'android-phone':
      if (browserType === 'chrome') {
        return [
          'Open Chrome menu (three dots in top-right)',
          'Tap "Settings"',
          'Tap "Privacy and security"',
          'Tap "Clear browsing data"',
          'Select "Cached images and files"',
          'Tap "Clear data"',
          'Return to this page and refresh',
        ];
      }
      if (browserType === 'firefox') {
        return [
          'Open Firefox menu (three dots)',
          'Tap "Settings"',
          'Tap "Delete browsing data"',
          'Select "Cache"',
          'Tap "Delete browsing data"',
          'Return to this page and refresh',
        ];
      }
      return [
        'Open your browser settings',
        'Find "Privacy" or "Clear browsing data"',
        'Clear cached images and files',
        'Return to this page and refresh',
      ];

    case 'ios-tablet':
    case 'ios-phone':
      if (browserType === 'safari') {
        return [
          'Open Settings app',
          'Scroll down and tap "Safari"',
          'Tap "Clear History and Website Data"',
          'Confirm by tapping "Clear History and Data"',
          'Return to Safari and reload this page',
        ];
      }
      return [
        'Open your browser settings',
        'Find "Clear browsing data" or similar',
        'Clear cache and reload the page',
      ];

    case 'desktop':
      if (browserType === 'chrome' || browserType === 'edge') {
        return [
          'Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)',
          'Select "Cached images and files"',
          'Click "Clear data"',
          'Reload this page',
        ];
      }
      if (browserType === 'firefox') {
        return [
          'Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)',
          'Select "Cache"',
          'Click "Clear Now"',
          'Reload this page',
        ];
      }
      if (browserType === 'safari') {
        return [
          'Open Safari menu → Preferences',
          'Go to "Privacy" tab',
          'Click "Manage Website Data"',
          'Click "Remove All"',
          'Reload this page',
        ];
      }
      return [
        'Open browser settings',
        'Find "Clear browsing data" or "Privacy"',
        'Clear cached images and files',
        'Reload this page',
      ];

    default:
      return [
        'Open your browser settings',
        'Clear cached data',
        'Reload this page',
      ];
  }
}

/**
 * Gets a friendly device name for display
 */
export function getDeviceName(deviceType?: DeviceType): string {
  const device = deviceType || detectDeviceType();

  switch (device) {
    case 'android-tablet':
      return 'Android Tablet';
    case 'android-phone':
      return 'Android Phone';
    case 'ios-tablet':
      return 'iPad';
    case 'ios-phone':
      return 'iPhone';
    case 'desktop':
      return 'Desktop';
    default:
      return 'Device';
  }
}
