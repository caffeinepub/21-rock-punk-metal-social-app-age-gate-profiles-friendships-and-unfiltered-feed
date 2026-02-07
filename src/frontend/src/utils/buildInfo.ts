// Build information utility for deployment verification
export interface BuildInfo {
  timestamp: string;
  version: string;
}

export function getBuildInfo(): BuildInfo {
  // Use environment variables if available, otherwise use compile-time defaults
  const buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString();
  const buildVersion = import.meta.env.VITE_BUILD_VERSION || 'dev';

  return {
    timestamp: buildTimestamp,
    version: buildVersion,
  };
}

export function formatBuildInfo(info: BuildInfo): string {
  const date = new Date(info.timestamp);
  const formattedDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `v${info.version} (${formattedDate})`;
}
