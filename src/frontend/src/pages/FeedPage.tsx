import { useState } from 'react';
import { useGetFeed } from '../hooks/useQueries';
import PostComposer from '../components/feed/PostComposer';
import PostCard from '../components/feed/PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { data: posts, isLoading } = useGetFeed();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-2">The Pit</h1>
        <p className="text-muted-foreground">Unfiltered thoughts from the community</p>
      </div>

      <PostComposer />

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id.toString()} post={post} />)
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. Be the first to share something!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
