import { useGetFeed } from '../hooks/useQueries';
import PostComposer from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';

export default function FeedPage() {
  const { data: posts, isLoading } = useGetFeed();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <PostComposer />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
}
