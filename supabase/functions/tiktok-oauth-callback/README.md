# TikTok OAuth

The creator portal uses TikTok Login Kit for Web and the Display API.

Required Supabase Edge Function secrets:

- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `APP_URL`: public site origin used after the callback, for example
  `https://example.com`.
- `TIKTOK_REDIRECT_URI` (optional): defaults to
  `https://<SUPABASE_PROJECT>.supabase.co/functions/v1/tiktok-oauth-callback`.

Register the exact callback URL above in the TikTok Login Kit settings. Enable
the scopes `user.info.basic`, `user.info.profile`, `user.info.stats`, and
`video.list` for the Sandbox app.

Deploy `tiktok-oauth-start`, `tiktok-oauth-callback`, and
`sync-social-metrics` after applying the database migrations.
