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

GRANT SELECT ON public.profiles, public.creator_talent_access TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles, public.creator_talent_access TO authenticated;
GRANT ALL ON public.profiles, public.creator_talent_access TO service_role;

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