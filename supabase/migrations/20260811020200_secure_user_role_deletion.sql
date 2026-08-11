DELETE FROM public.user_roles
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users
  WHERE auth.users.id = public.user_roles.user_id
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

COMMENT ON CONSTRAINT user_roles_user_id_fkey ON public.user_roles IS
  'Removes application roles automatically when the Supabase Auth user is deleted.';
