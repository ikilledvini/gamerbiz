# Social metrics sync

This Edge Function synchronizes public YouTube channel statistics into
`public.social_connections` and appends a historical snapshot after every successful run.

## Required secrets

- `YOUTUBE_API_KEY`: a server-side key with YouTube Data API v3 enabled.
- `SOCIAL_SYNC_SECRET`: a long random value used only by the scheduler.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: provided by Supabase at runtime.

Never expose `YOUTUBE_API_KEY`, `SOCIAL_SYNC_SECRET`, or the service-role key in a `VITE_*`
variable or in browser code.

## Request

Send a `POST` request with either the scheduler secret:

```text
x-sync-secret: <SOCIAL_SYNC_SECRET>
```

or an authenticated Supabase bearer token belonging to an administrator. The admin dashboard uses
the bearer-token option so the scheduler secret never reaches the browser.

The response reports how many connections succeeded or failed. A failed account stores a short
error message in `last_sync_error` without interrupting the remaining accounts.
