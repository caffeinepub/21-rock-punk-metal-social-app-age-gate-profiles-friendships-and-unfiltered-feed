import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetFriends, useGetPendingRequests } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import FriendsList from '../components/friends/FriendsList';
import FriendRequestsPanel from '../components/friends/FriendRequestsPanel';

export default function FriendsPage() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal()?.toString() || '';
  const { data: friends, isLoading: friendsLoading } = useGetFriends(currentUserPrincipal);
  const { data: pendingRequests, isLoading: requestsLoading } = useGetPendingRequests();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            My Friends {friends && `(${friends.length})`}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests {pendingRequests && `(${pendingRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {friendsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <FriendsList friends={friends || []} />
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {requestsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <FriendRequestsPanel requests={pendingRequests || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
