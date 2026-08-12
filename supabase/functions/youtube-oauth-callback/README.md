# YouTube OAuth

The creator portal uses the Google server-side OAuth flow with read-only YouTube
and YouTube Analytics scopes. Configure these values in the Supabase project
before testing:

- `GOOGLE_YOUTUBE_CLIENT_ID`: OAuth 2.0 Web application client ID.
- `GOOGLE_YOUTUBE_CLIENT_SECRET`: OAuth client secret.
- `APP_URL`: public Gamerbiz URL (for example, the Lovable production URL).
- `GOOGLE_YOUTUBE_REDIRECT_URI` (optional): defaults to
  `https://<SUPABASE_PROJECT>.supabase.co/functions/v1/youtube-oauth-callback`.

In Google Cloud, enable **YouTube Data API v3** and **YouTube Analytics API**,
then add the callback URL above to the OAuth client's authorized redirect URIs.
The consent screen requests:

- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/yt-analytics.readonly`

While the consent screen is in testing, every creator Google account must be
listed as a test user. Analytics syncs the last 28 complete days and keeps the
basic channel metrics working if an existing token still needs to be
reauthorized with the Analytics scope.

Deploy the migration and callback function before publishing the frontend. The
frontend also needs the public `VITE_GOOGLE_YOUTUBE_CLIENT_ID` value so it can
build the authorization URL; this value is not a secret.
