import { useGatewayStatus, useManualRetry } from '../../hooks/useGatewayStatus';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export function NetworkStatusIndicator() {
  const { state, consecutiveFailures, usingFallback } = useGatewayStatus();
  const manualRetry = useManualRetry();

  // Don't show indicator if everything is normal
  if (state === 'normal' && !usingFallback) {
    return null;
  }

  const getStatusConfig = () => {
    switch (state) {
      case 'failed':
        return {
          icon: WifiOff,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Connection Failed',
          description: `Gateway connection failed (${consecutiveFailures} attempts). Click to retry.`,
        };
      case 'fallback':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Using Fallback',
          description: 'Using alternative gateway due to connection issues.',
        };
      default:
        return {
          icon: Wifi,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Connected',
          description: 'Gateway connection is normal.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative ${config.bgColor}`}
            onClick={state === 'failed' ? manualRetry : undefined}
            disabled={state !== 'failed'}
          >
            <Icon className={`h-4 w-4 ${config.color}`} />
            {state === 'failed' && (
              <RefreshCw className="h-3 w-3 absolute bottom-0 right-0 text-destructive" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            {state === 'failed' && (
              <p className="text-xs text-muted-foreground mt-2">
                Click to retry connection
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
