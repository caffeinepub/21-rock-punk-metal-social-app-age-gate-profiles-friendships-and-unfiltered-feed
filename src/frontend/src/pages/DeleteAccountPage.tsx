import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteOwnAccount } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, LogIn, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteAccountPage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const deleteAccount = useDeleteOwnAccount();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success('Your account has been deleted');
      
      // Sign out and clear all cached data
      await clear();
      queryClient.clear();
      
      // Redirect to home
      window.location.href = '/';
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with home link */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleGoHome}>
            <Home className="mr-2 h-4 w-4" />
            Back to MetalHead Underground
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-black mb-2">Delete Your Account</h1>
          <p className="text-muted-foreground">
            Permanently remove your MetalHead Underground account and all associated data
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: This action cannot be undone</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Deleting your account will permanently remove:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Your profile information (display name, bio, avatar)</li>
              <li>All posts you've created</li>
              <li>Your friend connections and friend requests</li>
              <li>Your block list</li>
              <li>All reports you've submitted</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>How to Delete Your Account</CardTitle>
            <CardDescription>
              Follow these steps to permanently delete your MetalHead Underground account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Sign in to your account</p>
                  <p className="text-sm text-muted-foreground">
                    You must be signed in with Internet Identity to delete your account
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Review what will be deleted</p>
                  <p className="text-sm text-muted-foreground">
                    Carefully review the list of data that will be permanently removed
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Confirm deletion</p>
                  <p className="text-sm text-muted-foreground">
                    Click the delete button and confirm your decision in the dialog
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Account deleted immediately</p>
                  <p className="text-sm text-muted-foreground">
                    Your account and all data are removed instantly. You'll be signed out and redirected to the home page.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You need to sign in before you can delete your account.
                  </p>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    size="lg"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoggingIn ? 'Signing in...' : 'Sign in to continue'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You are signed in. Click the button below to permanently delete your account.
                  </p>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={deleteAccount.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteAccount.isPending ? 'Deleting...' : 'Delete my account'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about account deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">What data is deleted?</p>
              <p className="text-muted-foreground">
                All your personal data is permanently deleted from our servers, including your profile, display name, bio, avatar, all posts you've created, friend connections, friend requests, block list, and any reports you've submitted.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Can I recover my account after deletion?</p>
              <p className="text-muted-foreground">
                No. Account deletion is permanent and cannot be undone. Once deleted, your data cannot be recovered. You will need to create a new account if you want to use MetalHead Underground again.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">How long does deletion take?</p>
              <p className="text-muted-foreground">
                Your account is deleted immediately when you confirm the deletion. You will be signed out automatically and redirected to the home page. There is no waiting period.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">What happens to my posts and interactions?</p>
              <p className="text-muted-foreground">
                All posts you've created are permanently deleted. Any likes, comments, or interactions you've made are also removed from the system.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Do I need to delete my account to delete my data?</p>
              <p className="text-muted-foreground">
                Yes. Currently, the only way to delete your data is to delete your entire account. This removes all your information from our servers.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Need more help?</p>
              <p className="text-muted-foreground">
                If you have questions or concerns about account deletion, please contact us at darkstagecontactofficial@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <p className="font-semibold text-foreground">
                All of the following will be permanently deleted:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li>Your profile and personal information</li>
                <li>All posts you've created</li>
                <li>Your friend connections</li>
                <li>Your block list</li>
                <li>All reports you've submitted</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccount.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Yes, delete my account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
