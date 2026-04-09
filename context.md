# Progress Context

## 2026-04-08
- Investigated form confirmation email flow across frontend and Supabase Edge Functions.
- Verified `send-consultancy-confirmation` is deployed and responds successfully in live checks.
- Verified `send-studio-dispatch-confirmation` endpoint returns `NOT_FOUND` in live checks, confirming deployment gap.
- Implemented code fallback in `src/integrations/supabase/studio_dispatch.ts`: if studio dispatch function call fails, app now calls `send-consultancy-confirmation` so users still get confirmation emails.
- Updated confirmation copy in `supabase/functions/send-consultancy-confirmation/index.ts` to:
  - "Team Babel Designs has received your application and will reach out to you shortly."
- Attempted to deploy `send-studio-dispatch-confirmation`, but deployment is currently blocked by Supabase API `401 Unauthorized` with the available access token.
- Build verification completed successfully via `npm run build`.
- Received a fresh Supabase access token from user and retried function deployments.
- Deployed `send-studio-dispatch-confirmation` successfully (`ACTIVE`, version `1`).
- Deployed updated `send-consultancy-confirmation` successfully (`ACTIVE`, version `10`).
- Verified both live endpoints now return success:
  - `send-studio-dispatch-confirmation`
  - `send-consultancy-confirmation`
- Reproduced user-facing error `"Request saved, but confirmation email could not be sent."` by testing with a non-owner recipient (`example@gmail.com`) on `send-consultancy-confirmation`.
- Confirmed behavior difference: owner mailbox succeeds, external mailbox fails, indicating current Resend configuration is likely restricted (test-mode style behavior).
- Verified email-related Supabase secrets exist (`RESEND_API_KEY`, `CONSULTANCY_CONFIRMATION_FROM_EMAIL`, etc.), so failure is likely provider/account-level permission rather than missing secret.
- Updated Supabase secrets with user-provided Resend API key and standardized sender settings:
  - `RESEND_API_KEY`
  - `CONSULTANCY_CONFIRMATION_FROM_EMAIL`
  - `STUDIO_DISPATCH_FROM_EMAIL`
  - `CONSULTANCY_CONFIRMATION_REPLY_TO`
  - `STUDIO_DISPATCH_REPLY_TO`
- Redeployed:
  - `send-consultancy-confirmation`
  - `send-studio-dispatch-confirmation`
- Retested with external recipient (`example@gmail.com`): both functions still return `"Failed to send confirmation email."`.
- Conclusion remains provider-level sending restriction for external recipients (likely due to unverified sending domain on Resend).

## 2026-04-09
- Updated Philosophy chapter images in `src/pages/Philosophy.tsx`:
  - Chapter 1 now uses `phylosophy_ch1.jpg`
  - Chapter 2 now uses `phylosophy_ch2.jpg`
  - Chapter 3 now uses `phylosophy_ch3.jpg`
- Verified project builds successfully after image replacement using `npm run build`.
- Replaced Philosophy hero image import in `src/pages/Philosophy.tsx` from `babelphilosophy.jpeg` to `main_phylosophy.jpg` (new file present in project root).
- Verified build success after hero image replacement using `npm run build`.
