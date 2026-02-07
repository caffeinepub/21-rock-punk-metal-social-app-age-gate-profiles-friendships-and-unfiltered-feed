# Specification

## Summary
**Goal:** Clarify the optional custom-domain prompt and enforce consistent 5–50 character, letters/numbers/hyphens-only rules for domain slugs and user display names across the app.

**Planned changes:**
- Add a short in-app English explanation near the custom-domain prompt stating it is optional, the 5–50 character requirement, and that only letters, numbers, and hyphens are allowed; include at least one valid and one invalid example.
- Add backend validation for `UserProfile.displayName` to require 5–50 characters (inclusive) and allow only A–Z, a–z, 0–9, and `-`, rejecting invalid values with clear English error messages across create and update/save flows.
- Add matching frontend validation and inline guidance for display name on the Age Verification (profile creation) screen and the Profile edit screen; prevent submission/save when invalid and show clear English error messages.

**User-visible outcome:** Users see a clear explanation of the optional custom-domain naming rules, and they can only create or save a profile display name that is 5–50 characters using letters, numbers, and hyphens, with immediate inline feedback and clear backend errors when invalid.
