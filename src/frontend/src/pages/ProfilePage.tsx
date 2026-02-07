import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useUpdateProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';
import { GENRE_OPTIONS, getGenreLabel } from '../lib/genres';
import { validateDisplayName, getDisplayNameRules } from '../utils/validation';
import type { Genre, UserProfile } from '../backend';

const MAX_DISPLAY_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 200;
const MAX_LOCATION_LENGTH = 100;
const MAX_BAND_NAME_LENGTH = 100;
const MAX_FAVORITE_BANDS = 20;

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [favoriteBands, setFavoriteBands] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setLocation(profile.location || '');
      setAvatarUrl(profile.avatarUrl || '');
      setSelectedGenres(profile.favoriteGenres);
      setFavoriteBands(profile.favoriteBands.join('\n'));
    }
  }, [profile]);

  const handleGenreToggle = (genre: Genre) => {
    setSelectedGenres((prev) => {
      const exists = prev.some((g) => JSON.stringify(g) === JSON.stringify(genre));
      if (exists) {
        return prev.filter((g) => JSON.stringify(g) !== JSON.stringify(genre));
      } else {
        return [...prev, genre];
      }
    });
  };

  const isGenreSelected = (genre: Genre) => {
    return selectedGenres.some((g) => JSON.stringify(g) === JSON.stringify(genre));
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    
    // Clear error when user starts typing
    if (displayNameError && value.length > 0) {
      setDisplayNameError(undefined);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setDisplayNameError('Display name is required');
      toast.error('Display name is required');
      return;
    }

    // Validate display name
    const validation = validateDisplayName(displayName.trim());
    if (!validation.isValid) {
      setDisplayNameError(validation.error);
      toast.error(validation.error);
      return;
    }

    if (bio.length > MAX_BIO_LENGTH) {
      toast.error(`Bio is too long (max ${MAX_BIO_LENGTH} characters)`);
      return;
    }

    if (location.length > MAX_LOCATION_LENGTH) {
      toast.error(`Location is too long (max ${MAX_LOCATION_LENGTH} characters)`);
      return;
    }

    const bandsArray = favoriteBands
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (bandsArray.length > MAX_FAVORITE_BANDS) {
      toast.error(`Too many bands (max ${MAX_FAVORITE_BANDS})`);
      return;
    }

    const tooLongBand = bandsArray.find((b) => b.length > MAX_BAND_NAME_LENGTH);
    if (tooLongBand) {
      toast.error(`Band name "${tooLongBand.substring(0, 20)}..." is too long (max ${MAX_BAND_NAME_LENGTH} characters)`);
      return;
    }

    const updatedProfile: UserProfile = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      location: location.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      favoriteGenres: selectedGenres,
      favoriteBands: bandsArray,
      isAgeVerified: true,
    };

    try {
      await updateProfileMutation.mutateAsync(updatedProfile);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setLocation(profile.location || '');
      setAvatarUrl(profile.avatarUrl || '');
      setSelectedGenres(profile.favoriteGenres);
      setFavoriteBands(profile.favoriteBands.join('\n'));
      setDisplayNameError(undefined);
    }
    setIsEditing(false);
  };

  const validation = validateDisplayName(displayName.trim());
  const isDisplayNameValid = displayName.trim().length > 0 && validation.isValid;
  const canSave = isDisplayNameValid && !updateProfileMutation.isPending;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Profile</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={!canSave}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={updateProfileMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || profile.avatarUrl} />
              <AvatarFallback>
                <img src="/assets/generated/default-avatar.dim_256x256.png" alt="Avatar" />
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <div className="flex-1">
                <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            {isEditing ? (
              <>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  maxLength={MAX_DISPLAY_NAME_LENGTH}
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
              </>
            ) : (
              <p className="text-lg font-bold">{profile.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={MAX_BIO_LENGTH}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length} / {MAX_BIO_LENGTH}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">{profile.bio || 'No bio yet'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State/Country"
                  maxLength={MAX_LOCATION_LENGTH}
                />
                <p className="text-xs text-muted-foreground">
                  {location.length} / {MAX_LOCATION_LENGTH}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">{profile.location || 'Not specified'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Favorite Genres</Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GENRE_OPTIONS.map((genreOption) => (
                  <div key={JSON.stringify(genreOption.value)} className="flex items-center space-x-2">
                    <Checkbox
                      id={JSON.stringify(genreOption.value)}
                      checked={isGenreSelected(genreOption.value)}
                      onCheckedChange={() => handleGenreToggle(genreOption.value)}
                    />
                    <Label
                      htmlFor={JSON.stringify(genreOption.value)}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {genreOption.label}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGenres.length > 0 ? (
                  profile.favoriteGenres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {getGenreLabel(genre)}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground">No genres selected</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteBands">Favorite Bands (one per line)</Label>
            {isEditing ? (
              <>
                <Textarea
                  id="favoriteBands"
                  value={favoriteBands}
                  onChange={(e) => setFavoriteBands(e.target.value)}
                  rows={5}
                  placeholder="Metallica&#10;Iron Maiden&#10;Black Sabbath"
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {favoriteBands.split('\n').filter((b) => b.trim().length > 0).length} /{' '}
                  {MAX_FAVORITE_BANDS} bands
                </p>
              </>
            ) : (
              <div className="space-y-1">
                {profile.favoriteBands.length > 0 ? (
                  profile.favoriteBands.map((band, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      • {band}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">No bands listed</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
