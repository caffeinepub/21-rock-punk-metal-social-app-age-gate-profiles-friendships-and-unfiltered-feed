# Specification

## Summary
**Goal:** Improve MetalHead Underground's resilience to ICP gateway connectivity issues by implementing automatic fallback mechanisms and user-friendly error handling.

**Planned changes:**
- Add automatic retry logic with alternative ICP gateway URLs (raw.icp0.io) when primary gateway fails with canister resolution errors
- Implement a network status indicator in the app header showing gateway connectivity status (green/yellow/red) with manual retry button
- Add a helpful modal that appears after 3 consecutive gateway failures, suggesting cache clearing steps specific to the user's device

**User-visible outcome:** Users experience fewer interruptions from gateway errors, with automatic recovery attempts, clear visibility into connection status, and helpful troubleshooting guidance when issues persist.
