import { Principal } from '@icp-sdk/core/principal';
import { useGetProfile, useUnblockUser } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface BlockedUserRowProps {
  blockedPrincipal: Principal;
}

export function BlockedUserRow({ blockedPrincipal }: BlockedUserRowProps) {
  const principalString = blockedPrincipal.toString();
  const { data: profile } = useGetProfile(principalString);
  const unblockUser = useUnblockUser();

  const handleUnblock = async () => {
    try {
      await unblockUser.mutateAsync(blockedPrincipal);
      toast.success('User unblocked');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to unblock user';
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {profile?.displayName || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {principalString.slice(0, 16)}...
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnblock}
            disabled={unblockUser.isPending}
            className="gap-2 shrink-0"
          >
            <UserCheck className="h-4 w-4" />
            Unblock
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
