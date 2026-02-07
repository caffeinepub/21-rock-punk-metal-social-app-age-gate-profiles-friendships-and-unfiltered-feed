import { useState } from 'react';
import { useCreatePost } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const MAX_POST_LENGTH = 500;

export default function PostComposer() {
  const [content, setContent] = useState('');
  const createPostMutation = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Post cannot be empty');
      return;
    }

    if (content.length > MAX_POST_LENGTH) {
      toast.error(`Post is too long (max ${MAX_POST_LENGTH} characters)`);
      return;
    }

    try {
      await createPostMutation.mutateAsync(content.trim());
      setContent('');
      toast.success('Post created!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Speak your truth..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={MAX_POST_LENGTH}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {content.length} / {MAX_POST_LENGTH}
            </span>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || !content.trim()}
            >
              {createPostMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
