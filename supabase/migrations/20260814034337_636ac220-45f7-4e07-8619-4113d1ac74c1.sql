CREATE OR REPLACE FUNCTION public.sync_talent_social_connection(
  p_talent_id uuid,
  p_platform public.social_platform,
  p_profile_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_profile_url IS NULL OR trim(p_profile_url) = '' THEN
    UPDATE public.social_connections
    SET profile_url = NULL,
        handle = NULL,
        external_account_id = NULL,
        sync_enabled = false,
        current_metrics = '{}'::jsonb,
        last_synced_at = NULL,
        last_sync_error = NULL,
        connection_status = 'disconnected',
        connected_at = NULL,
        updated_at = now()
    WHERE talent_id = p_talent_id AND platform = p_platform;
    RETURN;
  END IF;

  INSERT INTO public.social_connections (
    talent_id, platform, profile_url, handle, sync_enabled, connection_status, connected_at
  )
  VALUES (
    p_talent_id,
    p_platform,
    trim(p_profile_url),
    NULLIF(trim(BOTH '@' FROM regexp_replace(split_part(trim(p_profile_url), '?', 1), '^.*/', '')), ''),
    true,
    'pending',
    now()
  )
  ON CONFLICT (talent_id, platform) DO UPDATE
  SET profile_url = EXCLUDED.profile_url,
      handle = COALESCE(public.social_connections.handle, EXCLUDED.handle),
      sync_enabled = true,
      connection_status = CASE
        WHEN public.social_connections.profile_url IS DISTINCT FROM EXCLUDED.profile_url THEN 'pending'
        ELSE public.social_connections.connection_status
      END,
      connected_at = COALESCE(public.social_connections.connected_at, now()),
      last_sync_error = CASE
        WHEN public.social_connections.profile_url IS DISTINCT FROM EXCLUDED.profile_url THEN NULL
        ELSE public.social_connections.last_sync_error
      END,
      updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_talent_social_connections_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'youtube', NEW.youtube_url);
    PERFORM public.sync_talent_social_connection(NEW.id, 'instagram', NEW.instagram_url);
    PERFORM public.sync_talent_social_connection(NEW.id, 'tiktok', NEW.tiktok_url);
    PERFORM public.sync_talent_social_connection(NEW.id, 'twitch', NEW.twitch_url);
    PERFORM public.sync_talent_social_connection(NEW.id, 'twitter', NEW.twitter_url);
    RETURN NEW;
  END IF;

  IF NEW.youtube_url IS DISTINCT FROM OLD.youtube_url THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'youtube', NEW.youtube_url);
  END IF;
  IF NEW.instagram_url IS DISTINCT FROM OLD.instagram_url THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'instagram', NEW.instagram_url);
  END IF;
  IF NEW.tiktok_url IS DISTINCT FROM OLD.tiktok_url THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'tiktok', NEW.tiktok_url);
  END IF;
  IF NEW.twitch_url IS DISTINCT FROM OLD.twitch_url THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'twitch', NEW.twitch_url);
  END IF;
  IF NEW.twitter_url IS DISTINCT FROM OLD.twitter_url THEN
    PERFORM public.sync_talent_social_connection(NEW.id, 'twitter', NEW.twitter_url);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_talent_social_connections ON public.talents;
DROP TRIGGER IF EXISTS sync_talent_social_connections_insert ON public.talents;
DROP TRIGGER IF EXISTS sync_talent_social_connections_update ON public.talents;

CREATE TRIGGER sync_talent_social_connections_insert
AFTER INSERT ON public.talents
FOR EACH ROW EXECUTE FUNCTION public.sync_talent_social_connections_trigger();

CREATE TRIGGER sync_talent_social_connections_update
AFTER UPDATE OF youtube_url, instagram_url, tiktok_url, twitch_url, twitter_url
ON public.talents
FOR EACH ROW EXECUTE FUNCTION public.sync_talent_social_connections_trigger();

CREATE OR REPLACE FUNCTION public.admin_assign_creator(
  p_user_id uuid,
  p_talent_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.talents WHERE id = p_talent_id) THEN
    RAISE EXCEPTION 'Talent not found';
  END IF;

  DELETE FROM public.creator_talent_access
  WHERE talent_id = p_talent_id AND user_id <> p_user_id;

  INSERT INTO public.creator_talent_access (user_id, talent_id)
  VALUES (p_user_id, p_talent_id)
  ON CONFLICT (user_id) DO UPDATE
  SET talent_id = EXCLUDED.talent_id,
      updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'creator')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_creator_access(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  DELETE FROM public.creator_talent_access WHERE user_id = p_user_id;
  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = 'creator';
END;
$$;

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

  UPDATE public.social_connections
  SET profile_url = NULL,
      handle = NULL,
      external_account_id = NULL,
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

REVOKE ALL ON FUNCTION public.sync_talent_social_connection(uuid, public.social_platform, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_talent_social_connections_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_assign_creator(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_remove_creator_access(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.creator_disconnect_social_connection(public.social_platform) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_assign_creator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_creator_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.creator_disconnect_social_connection(public.social_platform) TO authenticated;

DELETE FROM public.user_roles
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = public.user_roles.user_id
);

DO $$
BEGIN
  ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET must_change_password = true,
    updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = profiles.user_id AND user_roles.role = 'creator'
);

CREATE OR REPLACE FUNCTION public.complete_first_password_change()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'creator') THEN
    RAISE EXCEPTION 'Creator access required';
  END IF;

  UPDATE public.profiles
  SET must_change_password = false,
      updated_at = now()
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Creator profile not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_first_password_change() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_first_password_change() TO authenticated;