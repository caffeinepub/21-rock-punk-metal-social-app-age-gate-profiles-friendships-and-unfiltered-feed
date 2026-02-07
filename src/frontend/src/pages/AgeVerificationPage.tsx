import { useState } from 'react';
import { useVerifyAgeAndCreateProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { validateDisplayName, getDisplayNameRules } from '../utils/validation';
import type { UserProfile } from '../backend';

const MAX_DISPLAY_NAME_LENGTH = 50;

export default function AgeVerificationPage() {
  const [displayName, setDisplayName] = useState('');
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const verifyMutation = useVerifyAgeAndCreateProfile();

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    
    // Clear error when user starts typing
    if (displayNameError && value.length > 0) {
      setDisplayNameError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setDisplayNameError('Please enter a display name');
      toast.error('Please enter a display name');
      return;
    }

    // Validate display name
    const validation = validateDisplayName(displayName.trim());
    if (!validation.isValid) {
      setDisplayNameError(validation.error);
      toast.error(validation.error);
      return;
    }

    if (!isAgeVerified) {
      toast.error('You must confirm you are 21 or older');
      return;
    }

    const profile: UserProfile = {
      displayName: displayName.trim(),
      bio: '',
      favoriteGenres: [],
      favoriteBands: [],
      isAgeVerified: true,
    };

    try {
      await verifyMutation.mutateAsync(profile);
      toast.success('Welcome to MetalHead!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const validation = validateDisplayName(displayName.trim());
  const isDisplayNameValid = displayName.trim().length > 0 && validation.isValid;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20">
            <img
              src="/assets/generated/logo.dim_512x512.png"
              alt="MetalHead Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Age Verification Required</CardTitle>
          <CardDescription>
            This platform is for adults 21+ only. Please confirm your age to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Enter your name"
                maxLength={MAX_DISPLAY_NAME_LENGTH}
                required
                className={displayNameError ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {getDisplayNameRules()}
              </p>
              {displayNameError && (
                <p className="text-xs text-destructive">{displayNameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {displayName.length} / {MAX_DISPLAY_NAME_LENGTH}
              </p>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                id="ageVerification"
                checked={isAgeVerified}
                onCheckedChange={(checked) => setIsAgeVerified(checked === true)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="ageVerification"
                  className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am 21 years of age or older
                </Label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you certify that you meet the age requirement.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verifyMutation.isPending || !isDisplayNameValid || !isAgeVerified}
            >
              {verifyMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating Profile...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
