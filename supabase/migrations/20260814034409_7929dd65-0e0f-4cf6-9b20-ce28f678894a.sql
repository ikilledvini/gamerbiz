ALTER TABLE public.social_connections
  ADD COLUMN IF NOT EXISTS connection_method text NOT NULL DEFAULT 'manual';

DO $$
BEGIN
  ALTER TABLE public.social_connections
    ADD CONSTRAINT social_connections_method_check
    CHECK (connection_method IN ('manual', 'oauth'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.social_oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_id uuid NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_oauth_states_expires_idx
  ON public.social_oauth_states (expires_at);

ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.social_oauth_states TO authenticated;
GRANT ALL ON public.social_oauth_states TO service_role;

DROP POLICY IF EXISTS "Creators can create their OAuth states" ON public.social_oauth_states;
CREATE POLICY "Creators can create their OAuth states"
  ON public.social_oauth_states
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND platform IN ('youtube', 'tiktok')
    AND EXISTS (
      SELECT 1
      FROM public.creator_talent_access
      WHERE creator_talent_access.user_id = auth.uid()
        AND creator_talent_access.talent_id = social_oauth_states.talent_id
    )
  );

CREATE TABLE IF NOT EXISTS public.social_oauth_tokens (
  connection_id uuid PRIMARY KEY REFERENCES public.social_connections(id) ON DELETE CASCADE,
  provider text NOT NULL,
  refresh_token text NOT NULL,
  access_token text,
  access_token_expires_at timestamptz,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_oauth_tokens ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.social_oauth_tokens TO service_role;

DROP TRIGGER IF EXISTS update_social_oauth_tokens_updated_at ON public.social_oauth_tokens;
CREATE TRIGGER update_social_oauth_tokens_updated_at
BEFORE UPDATE ON public.social_oauth_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.creator_disconnect_social_connection(
  p_platform public.social_platform
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_talent_id uuid;
  v_connection_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'creator') THEN
    RAISE EXCEPTION 'Creator access required';
  END IF;

  SELECT talent_id INTO v_talent_id
  FROM public.creator_talent_access
  WHERE user_id = auth.uid();

  IF v_talent_id IS NULL THEN
    RAISE EXCEPTION 'No Media Kit is assigned to this user';
  END IF;

  UPDATE public.talents
  SET youtube_url = CASE WHEN p_platform = 'youtube' THEN NULL ELSE youtube_url END,
      instagram_url = CASE WHEN p_platform = 'instagram' THEN NULL ELSE instagram_url END,
      tiktok_url = CASE WHEN p_platform = 'tiktok' THEN NULL ELSE tiktok_url END,
      twitch_url = CASE WHEN p_platform = 'twitch' THEN NULL ELSE twitch_url END,
      twitter_url = CASE WHEN p_platform = 'twitter' THEN NULL ELSE twitter_url END,
      updated_at = now()
  WHERE id = v_talent_id;

  SELECT id INTO v_connection_id
  FROM public.social_connections
  WHERE talent_id = v_talent_id AND platform = p_platform;

  DELETE FROM public.social_oauth_tokens
  WHERE connection_id = v_connection_id;

  UPDATE public.social_connections
  SET profile_url = NULL,
      handle = NULL,
      external_account_id = NULL,
      connection_method = 'manual',
      sync_enabled = false,
      current_metrics = '{}'::jsonb,
      last_synced_at = NULL,
      last_sync_error = NULL,
      connection_status = 'disconnected',
      connected_by = auth.uid(),
      connected_at = NULL,
      updated_at = now()
  WHERE talent_id = v_talent_id AND platform = p_platform;
END;
$$;

REVOKE ALL ON FUNCTION public.creator_disconnect_social_connection(public.social_platform) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.creator_disconnect_social_connection(public.social_platform) TO authenticated;