import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Info, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { getBuildInfo, formatBuildInfo } from '../utils/buildInfo';

export default function SettingsPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const buildInfo = getBuildInfo();

  const handleSignOut = async () => {
    try {
      await clear();
      queryClient.clear();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your authentication and session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain Information
          </CardTitle>
          <CardDescription>Understanding the platform's domain naming rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <p className="text-sm">
              When publishing your app, you may be prompted to choose a custom domain name. This is{' '}
              <strong>optional</strong> — your app will work perfectly on the default URL provided by the platform.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold">Domain Slug Rules:</p>
              <ul className="text-sm space-y-1 list-disc list-inside ml-2">
                <li>Must be between <strong>5 and 50 characters</strong></li>
                <li>Can only contain <strong>letters</strong> (A-Z, a-z), <strong>numbers</strong> (0-9), and <strong>hyphens</strong> (-)</li>
                <li>No spaces, special characters, or punctuation marks allowed</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-semibold">Examples:</p>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <div className="flex-1">
                    <code className="text-xs bg-background px-2 py-1 rounded">rock-punk-metal-social-app</code>
                    <p className="text-xs text-muted-foreground mt-1">Valid: uses letters, numbers, and hyphens</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <div className="flex-1">
                    <code className="text-xs bg-background px-2 py-1 rounded">metalhead-community-2026</code>
                    <p className="text-xs text-muted-foreground mt-1">Valid: includes numbers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <div className="flex-1">
                    <code className="text-xs bg-background px-2 py-1 rounded">21+-rock/punk/metal-social-app</code>
                    <p className="text-xs text-muted-foreground mt-1">Invalid: contains '+', '/', and other special characters</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <div className="flex-1">
                    <code className="text-xs bg-background px-2 py-1 rounded">rock app</code>
                    <p className="text-xs text-muted-foreground mt-1">Invalid: contains spaces</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <div className="flex-1">
                    <code className="text-xs bg-background px-2 py-1 rounded">app</code>
                    <p className="text-xs text-muted-foreground mt-1">Invalid: too short (less than 5 characters)</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              <strong>Note:</strong> Your display name in the app follows the same rules to ensure consistency across the platform.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Build Information
          </CardTitle>
          <CardDescription>Current deployment version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-mono">{buildInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build Time:</span>
              <span className="font-mono">{new Date(buildInfo.timestamp).toLocaleString()}</span>
            </div>
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Build ID: {formatBuildInfo(buildInfo)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
