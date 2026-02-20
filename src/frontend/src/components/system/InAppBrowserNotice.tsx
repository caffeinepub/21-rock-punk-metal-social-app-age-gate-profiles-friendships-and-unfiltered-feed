import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { getInAppBrowserName, getExternalBrowserInstructions } from '../../utils/inAppBrowser';
import { copyCurrentUrl, openInExternalBrowser } from '../../utils/externalBrowserActions';

interface InAppBrowserNoticeProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function InAppBrowserNotice({ onDismiss, showDismiss = true }: InAppBrowserNoticeProps) {
  const [showManualCopy, setShowManualCopy] = useState(false);
  const browserName = getInAppBrowserName();
  const instructions = getExternalBrowserInstructions();

  const handleCopy = async () => {
    const success = await copyCurrentUrl();
    if (!success) {
      setShowManualCopy(true);
    }
  };

  const handleOpenExternal = () => {
    openInExternalBrowser();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-xl">Browser Compatibility Issue</CardTitle>
              <CardDescription className="mt-2">
                Login may not work in {browserName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle className="text-sm font-semibold">Why is this happening?</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              {browserName} blocks secure login windows that this app requires. 
              To log in successfully, you need to open this app in your phone's regular browser 
              (Chrome, Safari, Firefox, etc.).
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm font-semibold">How to fix this:</p>
            <ol className="space-y-2 text-sm">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-bold text-primary">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-semibold">Quick actions:</p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleOpenExternal} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue in your browser
              </Button>
              <Button onClick={handleCopy} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy app link
              </Button>
            </div>
          </div>

          {showManualCopy && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Copy the link manually:
              </p>
              <Input
                readOnly
                value={window.location.origin}
                className="font-mono text-xs"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          )}

          {showDismiss && onDismiss && (
            <div className="pt-2 border-t border-border">
              <Button 
                onClick={onDismiss} 
                variant="ghost" 
                className="w-full text-muted-foreground"
              >
                Continue anyway (not recommended)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
