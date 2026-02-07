import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import AgeVerificationPage from './pages/AgeVerificationPage';
import AppShell from './components/layout/AppShell';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state during initialization
  if (isInitializing || (isAuthenticated && profileLoading && !isFetched)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Not authenticated: show landing page
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LandingPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated but not age verified: show age verification
  if (!userProfile || !userProfile.isAgeVerified) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AgeVerificationPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated and age verified: show main app
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppShell />
      <Toaster />
    </ThemeProvider>
  );
}
