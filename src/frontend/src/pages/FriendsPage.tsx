import { useGetFriends, useGetPendingRequests } from '../hooks/useQueries';
import FriendsList from '../components/friends/FriendsList';
import FriendRequestsPanel from '../components/friends/FriendRequestsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function FriendsPage() {
  const { data: friends, isLoading: friendsLoading } = useGetFriends();
  const { data: pendingRequests, isLoading: requestsLoading } = useGetPendingRequests();

  if (friendsLoading || requestsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-2">Friends</h1>
        <p className="text-muted-foreground">Connect with your tribe</p>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            Friends ({friends?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList friends={friends || []} />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <FriendRequestsPanel requests={pendingRequests || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
