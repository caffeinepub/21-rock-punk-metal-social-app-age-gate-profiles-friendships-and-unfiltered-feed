import { useRespondToFriendRequest, useGetProfile } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { FriendRequest } from '../../backend';

interface FriendRequestsPanelProps {
  requests: FriendRequest[];
}

function RequestCard({ request }: { request: FriendRequest }) {
  const { data: profile } = useGetProfile(request.from.toString());
  const respondMutation = useRespondToFriendRequest();

  const handleRespond = async (accept: boolean) => {
    try {
      await respondMutation.mutateAsync({ from: request.from, accept });
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to request');
    }
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatarUrl} />
            <AvatarFallback>
              <img src="/assets/generated/default-avatar.dim_256x256.png" alt="Avatar" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-bold">{profile?.displayName || 'Anonymous'}</p>
            <p className="text-sm text-muted-foreground">wants to connect</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleRespond(true)}
              disabled={respondMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRespond(false)}
              disabled={respondMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FriendRequestsPanel({ requests }: FriendRequestsPanelProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No pending friend requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request, idx) => (
        <RequestCard key={`${request.from.toString()}-${idx}`} request={request} />
      ))}
    </div>
  );
}
