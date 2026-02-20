import { useState, useEffect } from 'react';
import { useGetCallerProfile, useUpdateProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import type { UserProfile, Genre } from '../backend';
import { GENRE_OPTIONS } from '../lib/genres';
import { validateDisplayName } from '../utils/validation';
import { ClearFavoriteBandsConfirmDialog } from '../components/profile/ClearFavoriteBandsConfirmDialog';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteBands, setFavoriteBands] = useState('');
  const [initialFavoriteBands, setInitialFavoriteBands] = useState('');
  const [showClearBandsDialog, setShowClearBandsDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setLocation(profile.location || '');
      setSelectedGenres(
        profile.favoriteGenres.map((g) =>
          typeof g === 'object' && '__kind__' in g ? g.__kind__ : 'other'
        )
      );
      const bandsText = profile.favoriteBands.join(', ');
      setFavoriteBands(bandsText);
      setInitialFavoriteBands(bandsText);
    }
  }, [profile]);

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    const validation = validateDisplayName(value);
    setDisplayNameError(validation.isValid ? '' : (validation.error || ''));
  };

  const handleGenreToggle = (genreKey: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreKey)
        ? prev.filter((g) => g !== genreKey)
        : [...prev, genreKey]
    );
  };

  const handleSave = async () => {
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      setDisplayNameError(validation.error || 'Invalid display name');
      return;
    }

    const bandsArray = favoriteBands
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (initialFavoriteBands.trim() !== '' && bandsArray.length === 0) {
      setShowClearBandsDialog(true);
      return;
    }

    await performSave(bandsArray);
  };

  const performSave = async (bandsArray: string[]) => {
    const genres: Genre[] = selectedGenres.map((key) => {
      if (key === 'other') {
        return { __kind__: 'other', other: 'Other' };
      }
      return { __kind__: key, [key]: null } as Genre;
    });

    const updatedProfile: UserProfile = {
      displayName,
      bio,
      location: location || undefined,
      favoriteGenres: genres,
      favoriteBands: bandsArray,
      avatarUrl: profile?.avatarUrl,
      isAgeVerified: true,
    };

    try {
      await updateProfile.mutateAsync(updatedProfile);
      setInitialFavoriteBands(favoriteBands);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  const handleConfirmClearBands = async () => {
    setShowClearBandsDialog(false);
    await performSave([]);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentBandCount = initialFavoriteBands
    .split(',')
    .filter((b) => b.trim().length > 0).length;

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Your display name"
              />
              {displayNameError && (
                <p className="text-sm text-destructive">{displayNameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label>Favorite Genres</Label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const genreKey = genre.value.__kind__;
                  return (
                    <Button
                      key={genreKey}
                      type="button"
                      variant={
                        selectedGenres.includes(genreKey)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handleGenreToggle(genreKey)}
                    >
                      {genre.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteBands">
                Favorite Bands (comma-separated)
              </Label>
              <Textarea
                id="favoriteBands"
                value={favoriteBands}
                onChange={(e) => setFavoriteBands(e.target.value)}
                placeholder="Metallica, Iron Maiden, Black Sabbath"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending || !!displayNameError}
              className="w-full"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <ClearFavoriteBandsConfirmDialog
        open={showClearBandsDialog}
        onOpenChange={setShowClearBandsDialog}
        onConfirm={handleConfirmClearBands}
        bandCount={currentBandCount}
      />
    </>
  );
}
