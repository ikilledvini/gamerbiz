CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.creator_talent_access (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  talent_id uuid NOT NULL UNIQUE REFERENCES public.talents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_connections
  ADD COLUMN IF NOT EXISTS connection_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS connected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS connected_at timestamptz;

DO $$
BEGIN
  ALTER TABLE public.social_connections
    ADD CONSTRAINT social_connections_status_check
    CHECK (connection_status IN ('disconnected', 'pending', 'connected', 'error'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

UPDATE public.social_connections
SET connection_status = CASE
  WHEN last_synced_at IS NOT NULL THEN 'connected'
  WHEN profile_url IS NOT NULL AND profile_url <> '' THEN 'pending'
  ELSE 'disconnected'
END;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
      updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

INSERT INTO public.profiles (user_id, email, display_name)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name')
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = now();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_talent_access_updated_at ON public.creator_talent_access;
CREATE TRIGGER update_creator_talent_access_updated_at
BEFORE UPDATE ON public.creator_talent_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_talent_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Creators can read their own access" ON public.creator_talent_access;
CREATE POLICY "Creators can read their own access"
ON public.creator_talent_access FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage creator access" ON public.creator_talent_access;
CREATE POLICY "Admins can manage creator access"
ON public.creator_talent_access FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all user roles" ON public.user_roles;
CREATE POLICY "Admins can read all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Creators can read their assigned talent" ON public.talents;
CREATE POLICY "Creators can read their assigned talent"
ON public.talents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.creator_talent_access
    WHERE creator_talent_access.talent_id = talents.id
      AND creator_talent_access.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Creators can read their social connections" ON public.social_connections;
CREATE POLICY "Creators can read their social connections"
ON public.social_connections FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.creator_talent_access
    WHERE creator_talent_access.talent_id = social_connections.talent_id
      AND creator_talent_access.user_id = auth.uid()
  )
);

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
    talent_id,
    platform,
    profile_url,
    handle,
    sync_enabled,
    connection_status,
    connected_at
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

CREATE OR REPLACE FUNCTION public.creator_upsert_social_connection(
  p_platform public.social_platform,
  p_profile_url text,
  p_handle text DEFAULT NULL
)
RETURNS public.social_connections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_talent_id uuid;
  v_connection public.social_connections;
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

  IF p_profile_url IS NULL OR p_profile_url !~* '^https?://' THEN
    RAISE EXCEPTION 'A valid profile URL is required';
  END IF;

  UPDATE public.talents
  SET youtube_url = CASE WHEN p_platform = 'youtube' THEN trim(p_profile_url) ELSE youtube_url END,
      instagram_url = CASE WHEN p_platform = 'instagram' THEN trim(p_profile_url) ELSE instagram_url END,
      tiktok_url = CASE WHEN p_platform = 'tiktok' THEN trim(p_profile_url) ELSE tiktok_url END,
      twitch_url = CASE WHEN p_platform = 'twitch' THEN trim(p_profile_url) ELSE twitch_url END,
      twitter_url = CASE WHEN p_platform = 'twitter' THEN trim(p_profile_url) ELSE twitter_url END,
      updated_at = now()
  WHERE id = v_talent_id;

  INSERT INTO public.social_connections (
    talent_id,
    platform,
    profile_url,
    handle,
    sync_enabled,
    connection_status,
    connected_by,
    connected_at,
    last_sync_error
  )
  VALUES (
    v_talent_id,
    p_platform,
    trim(p_profile_url),
    NULLIF(trim(BOTH '@' FROM COALESCE(p_handle, '')), ''),
    true,
    'pending',
    auth.uid(),
    now(),
    NULL
  )
  ON CONFLICT (talent_id, platform) DO UPDATE
  SET profile_url = EXCLUDED.profile_url,
      handle = COALESCE(EXCLUDED.handle, public.social_connections.handle),
      sync_enabled = true,
      connection_status = 'pending',
      connected_by = auth.uid(),
      connected_at = now(),
      last_sync_error = NULL,
      updated_at = now()
  RETURNING * INTO v_connection;

  RETURN v_connection;
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

GRANT SELECT ON public.profiles, public.creator_talent_access TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles, public.creator_talent_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_creator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_creator_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.creator_upsert_social_connection(public.social_platform, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.creator_disconnect_social_connection(public.social_platform) TO authenticated;
REVOKE ALL ON FUNCTION public.sync_talent_social_connection(uuid, public.social_platform, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_talent_social_connections_trigger() FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.profiles, public.creator_talent_access TO service_role;

COMMENT ON TABLE public.profiles IS
  'Application profile mirror for Supabase Auth users, used for admin assignment and creator access.';

COMMENT ON TABLE public.creator_talent_access IS
  'One-to-one assignment between a creator login and the Media Kit they can connect accounts to.';
