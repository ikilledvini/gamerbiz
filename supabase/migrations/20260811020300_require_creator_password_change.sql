ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET must_change_password = true,
    updated_at = now()
WHERE EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'creator'
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

GRANT EXECUTE ON FUNCTION public.complete_first_password_change() TO authenticated;

COMMENT ON COLUMN public.profiles.must_change_password IS
  'Forces creator accounts to replace a temporary password before opening their portal.';
