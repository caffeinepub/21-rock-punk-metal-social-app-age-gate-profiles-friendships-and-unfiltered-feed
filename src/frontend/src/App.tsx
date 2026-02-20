import { useEffect } from 'react';
import { useGetCallerProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LandingPage from './pages/LandingPage';
import { AppShell } from './components/layout/AppShell';
import AgeVerificationPage from './pages/AgeVerificationPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import InAppBrowserNotice from './components/system/InAppBrowserNotice';
import { CacheClearingModal } from './components/system/CacheClearingModal';
import { isInAppBrowser } from './utils/inAppBrowser';
import { isInternetIdentityReturnUrl } from './utils/iiReturnFlow';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerProfile();

  const showInAppBrowserNotice = isInAppBrowser() && !isInternetIdentityReturnUrl();

  // Check if current path is /delete-account - show this page publicly before any auth checks
  const isDeleteAccountPage = window.location.pathname === '/delete-account' || window.location.pathname === '/delete-account/';

  useEffect(() => {
    if (showInAppBrowserNotice) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showInAppBrowserNotice]);

  // Show in-app browser notice only if NOT on delete-account page
  if (showInAppBrowserNotice && !isDeleteAccountPage) {
    return <InAppBrowserNotice />;
  }

  // Show delete account page publicly regardless of auth state (Google Play requirement)
  if (isDeleteAccountPage) {
    return <DeleteAccountPage />;
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!identity) {
    return <LandingPage />;
  }

  // Authenticated but profile loading
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Authenticated but no profile - show age verification
  const showProfileSetup = !profileLoading && isFetched && profile === null;
  if (showProfileSetup) {
    return <AgeVerificationPage />;
  }

  // Authenticated with profile - show main app
  return (
    <>
      <AppShell />
      <CacheClearingModal />
    </>
  );
}

export default App;
