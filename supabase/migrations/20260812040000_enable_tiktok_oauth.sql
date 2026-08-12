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
