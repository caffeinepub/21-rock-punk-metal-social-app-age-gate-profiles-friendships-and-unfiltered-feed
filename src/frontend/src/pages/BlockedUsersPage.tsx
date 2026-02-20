import { useGetBlockedUsers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BlockedUserRow } from '../components/blocks/BlockedUserRow';
import { Ban } from 'lucide-react';

export function BlockedUsersPage() {
  const { data: blockedUsers = [], isLoading } = useGetBlockedUsers();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Blocked Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading blocked users...
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't blocked anyone yet.
            </div>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((blockedPrincipal) => (
                <BlockedUserRow
                  key={blockedPrincipal.toString()}
                  blockedPrincipal={blockedPrincipal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
