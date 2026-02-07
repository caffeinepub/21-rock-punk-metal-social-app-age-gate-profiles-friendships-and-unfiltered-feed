import { useState } from 'react';
import { useLikePost, useDeletePost, useGetProfile, useSendFriendRequest, useGetFriends } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Trash2, Flag, UserPlus } from 'lucide-react';
import { formatTimestamp } from '../../lib/time';
import { toast } from 'sonner';
import type { FeedPost } from '../../backend';
import ReportDialog from '../report/ReportDialog';
import { Principal } from '@dfinity/principal';

interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const likePostMutation = useLikePost();
  const deletePostMutation = useDeletePost();
  const sendFriendRequestMutation = useSendFriendRequest();
  const { data: authorProfile } = useGetProfile(post.author.toString());
  const { data: friends } = useGetFriends();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isAuthor = currentUserPrincipal === post.author.toString();
  const hasLiked = post.likes.some(
    (p) => p.toString() === currentUserPrincipal
  );

  const isFriend = friends?.some(
    (friendPrincipal) => friendPrincipal.toString() === post.author.toString()
  );

  const handleLike = async () => {
    if (hasLiked) {
      toast.info('You already liked this post');
      return;
    }

    try {
      await likePostMutation.mutateAsync(post.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequestMutation.mutateAsync(post.author);
      toast.success('Friend request sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send friend request');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={authorProfile?.avatarUrl} />
              <AvatarFallback>
                <img src="/assets/generated/default-avatar.dim_256x256.png" alt="Avatar" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold">
                    {authorProfile?.displayName || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(post.timestamp)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!isAuthor && !isFriend && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSendFriendRequest}
                      disabled={sendFriendRequestMutation.isPending}
                      className="h-8 w-8"
                      title="Send friend request"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={deletePostMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReportDialogOpen(true)}
                    className="h-8 w-8"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="whitespace-pre-wrap break-words mb-4">{post.content}</p>

              <div className="flex items-center gap-4">
                <Button
                  variant={hasLiked ? 'default' : 'ghost'}
                  size="sm"
                  onClick={handleLike}
                  disabled={likePostMutation.isPending || hasLiked}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {post.likes.length}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportedPost={post.id}
        reportedUser={null}
      />
    </>
  );
}
