-- Social profiles and metrics must be created by official OAuth callbacks.
-- Keep the legacy function for migration compatibility, but make it unreachable
-- from browser sessions and authenticated users.
REVOKE ALL ON FUNCTION public.creator_upsert_social_connection(
  public.social_platform,
  text,
  text
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.creator_upsert_social_connection(
  public.social_platform,
  text,
  text
) FROM anon;

REVOKE ALL ON FUNCTION public.creator_upsert_social_connection(
  public.social_platform,
  text,
  text
) FROM authenticated;
