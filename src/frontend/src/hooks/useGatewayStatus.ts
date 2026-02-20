import { create } from 'zustand';
import { isGatewayResolutionError } from '../utils/gatewayFallback';

export type GatewayState = 'normal' | 'fallback' | 'failed';

interface GatewayStatusStore {
  state: GatewayState;
  consecutiveFailures: number;
  lastErrorTimestamp: number | null;
  retryCount: number;
  usingFallback: boolean;
  
  // Actions
  recordSuccess: () => void;
  recordFailure: (error: unknown) => void;
  recordFallbackUsage: () => void;
  resetFailures: () => void;
  incrementRetry: () => void;
  resetRetry: () => void;
}

export const useGatewayStatus = create<GatewayStatusStore>((set) => ({
  state: 'normal',
  consecutiveFailures: 0,
  lastErrorTimestamp: null,
  retryCount: 0,
  usingFallback: false,

  recordSuccess: () =>
    set({
      state: 'normal',
      consecutiveFailures: 0,
      lastErrorTimestamp: null,
      usingFallback: false,
    }),

  recordFailure: (error: unknown) =>
    set((state) => {
      if (!isGatewayResolutionError(error)) {
        return state;
      }

      const newFailures = state.consecutiveFailures + 1;
      return {
        consecutiveFailures: newFailures,
        lastErrorTimestamp: Date.now(),
        state: newFailures >= 3 ? 'failed' : 'normal',
      };
    }),

  recordFallbackUsage: () =>
    set({
      state: 'fallback',
      usingFallback: true,
    }),

  resetFailures: () =>
    set({
      consecutiveFailures: 0,
      lastErrorTimestamp: null,
    }),

  incrementRetry: () =>
    set((state) => ({
      retryCount: state.retryCount + 1,
    })),

  resetRetry: () =>
    set({
      retryCount: 0,
    }),
}));

/**
 * Hook to manually trigger a retry
 */
export function useManualRetry() {
  const { resetFailures, resetRetry } = useGatewayStatus();

  return () => {
    resetFailures();
    resetRetry();
    // Force a page reload to retry actor initialization
    window.location.reload();
  };
}
