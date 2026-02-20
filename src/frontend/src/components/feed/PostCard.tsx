import { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  useLikePost,
  useDeletePost,
  useSendFriendRequest,
  useBlockUser,
  useUnblockUser,
  useGetBlockedUsers,
} from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Heart, Trash2, UserPlus, Flag, Ban, UserCheck } from 'lucide-react';
import { formatRelativeTime } from '../../lib/time';
import type { FeedPost } from '../../backend';
import ReportDialog from '../report/ReportDialog';
import { toast } from 'sonner';

interface PostCardProps {
  post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { data: blockedUsers = [] } = useGetBlockedUsers();
  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const sendFriendRequest = useSendFriendRequest();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal();
  const isOwnPost =
    currentUserPrincipal?.toString() === post.author.toString();
  const hasLiked = currentUserPrincipal
    ? post.likes.some(
        (p) => p.toString() === currentUserPrincipal.toString()
      )
    : false;

  const isBlocked = blockedUsers.some(
    (blockedPrincipal) => blockedPrincipal.toString() === post.author.toString()
  );

  const handleLike = async () => {
    try {
      await likePost.mutateAsync(post.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to like post';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete post';
      toast.error(message);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest.mutateAsync(post.author);
      toast.success('Friend request sent');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send friend request';
      toast.error(message);
    }
  };

  const handleBlock = async () => {
    if (
      !confirm(
        `Are you sure you want to block this user? You will no longer see their posts.`
      )
    )
      return;
    try {
      await blockUser.mutateAsync(post.author);
      toast.success('User blocked');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to block user';
      toast.error(message);
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser.mutateAsync(post.author);
      toast.success('User unblocked');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to unblock user';
      toast.error(message);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {post.author.toString().slice(0, 8)}...
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeTime(Number(post.timestamp) / 1_000_000)}
                </p>
              </div>
              {isOwnPost && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-base whitespace-pre-wrap break-words">
              {post.content}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likePost.isPending || hasLiked}
                className="gap-2"
              >
                <Heart
                  className={`h-4 w-4 ${hasLiked ? 'fill-primary text-primary' : ''}`}
                />
                <span>{post.likes.length}</span>
              </Button>

              {!isOwnPost && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendFriendRequest}
                    disabled={sendFriendRequest.isPending}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Friend</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReportDialog(true)}
                    className="gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span className="hidden sm:inline">Report</span>
                  </Button>

                  {isBlocked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnblock}
                      disabled={unblockUser.isPending}
                      className="gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Unblock user</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBlock}
                      disabled={blockUser.isPending}
                      className="gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      <span className="hidden sm:inline">Block user</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportedUser={post.author}
        reportedPost={post.id}
      />
    </>
  );
}
