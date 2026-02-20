import { useEffect, useState } from 'react';
import { useGatewayStatus } from '../../hooks/useGatewayStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { getCacheClearingInstructions, getDeviceName, detectDeviceType, detectBrowser } from '../../utils/deviceDetection';
import { AlertCircle, ExternalLink, Wifi } from 'lucide-react';

const MODAL_SHOWN_KEY = 'metalhead-cache-modal-shown';
const FAILURE_THRESHOLD = 3;

export function CacheClearingModal() {
  const { consecutiveFailures, state } = useGatewayStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    // Check if we've already shown the modal this session
    const shownThisSession = sessionStorage.getItem(MODAL_SHOWN_KEY);
    if (shownThisSession) {
      setHasShownThisSession(true);
      return;
    }

    // Show modal if we've hit the failure threshold
    if (consecutiveFailures >= FAILURE_THRESHOLD && state === 'failed' && !hasShownThisSession) {
      setIsOpen(true);
      setHasShownThisSession(true);
      sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
    }
  }, [consecutiveFailures, state, hasShownThisSession]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTryAlternativeGateway = () => {
    // Try to switch to raw.icp0.io
    const currentUrl = window.location.href;
    const alternativeUrl = currentUrl.replace('.icp0.io', '.raw.icp0.io');
    if (alternativeUrl !== currentUrl) {
      window.location.href = alternativeUrl;
    } else {
      handleClose();
    }
  };

  const handleSwitchNetwork = () => {
    handleClose();
    alert('Try switching between WiFi and mobile data, then reload the page.');
  };

  const deviceType = detectDeviceType();
  const browser = detectBrowser();
  const instructions = getCacheClearingInstructions(deviceType, browser);
  const deviceName = getDeviceName(deviceType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Connection Issues Detected
          </DialogTitle>
          <DialogDescription>
            We're having trouble connecting to the Internet Computer gateway. This is usually temporary and can often be fixed by clearing your browser cache.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              Your app data is safe. This is a temporary connection issue with the gateway servers.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-2">Clear Cache on {deviceName}:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {instructions.map((instruction, index) => (
                <li key={index} className="text-muted-foreground">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Other Solutions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Try switching between WiFi and mobile data</li>
              <li>Wait a few minutes and try again</li>
              <li>Use a different browser</li>
              <li>Restart your device</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleTryAlternativeGateway}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Try Alternative Gateway
          </Button>
          <Button
            variant="outline"
            onClick={handleSwitchNetwork}
          >
            Switch Network
          </Button>
          <Button onClick={handleClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
