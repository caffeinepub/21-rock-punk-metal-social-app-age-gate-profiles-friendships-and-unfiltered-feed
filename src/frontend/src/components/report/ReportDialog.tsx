import { useState } from 'react';
import { useReportContent } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Principal } from '@dfinity/principal';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedPost: bigint | null;
  reportedUser: Principal | null;
}

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate Speech',
  'Violence',
  'Illegal Content',
  'Other',
];

const MAX_DETAILS_LENGTH = 150;

export default function ReportDialog({
  open,
  onOpenChange,
  reportedPost,
  reportedUser,
}: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const reportMutation = useReportContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (details.length > MAX_DETAILS_LENGTH) {
      toast.error(`Details are too long (max ${MAX_DETAILS_LENGTH} characters)`);
      return;
    }

    const fullReason = details ? `${reason}: ${details}` : reason;

    try {
      await reportMutation.mutateAsync({
        reportedUser,
        reportedPost,
        reason: fullReason,
      });
      toast.success('Report submitted. Thank you for helping keep the community safe.');
      setReason('');
      setDetails('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !reportMutation.isPending) {
      setReason('');
      setDetails('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide more context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={MAX_DETAILS_LENGTH}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {details.length} / {MAX_DETAILS_LENGTH}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={reportMutation.isPending || !reason}>
              {reportMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
