import { useGetProfile } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Principal } from '@dfinity/principal';
import { getGenreLabel } from '../../lib/genres';

interface FriendsListProps {
  friends: Principal[];
}

function FriendCard({ friendPrincipal }: { friendPrincipal: Principal }) {
  const { data: profile, isLoading } = useGetProfile(friendPrincipal.toString());

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback>
              <img src="/assets/generated/default-avatar.dim_256x256.png" alt="Avatar" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{profile.displayName}</h3>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            {profile.favoriteGenres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.favoriteGenres.slice(0, 3).map((genre, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {getGenreLabel(genre)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FriendsList({ friends }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No friends yet. Start connecting with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {friends.map((friend) => (
        <FriendCard key={friend.toString()} friendPrincipal={friend} />
      ))}
    </div>
  );
}
