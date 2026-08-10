CREATE TYPE public.lead_kind AS ENUM ('brand', 'creator');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'archived');

CREATE TABLE public.lead_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.lead_kind NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  company text,
  whatsapp text,
  message text,
  creator_type text,
  profiles text,
  subject text,
  locale text NOT NULL DEFAULT 'pt-BR',
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_submissions_required_fields CHECK (
    (kind = 'brand' AND company IS NOT NULL AND message IS NOT NULL)
    OR
    (kind = 'creator' AND creator_type IS NOT NULL AND profiles IS NOT NULL)
  )
);

CREATE INDEX lead_submissions_status_created_at_idx
  ON public.lead_submissions (status, created_at DESC);

ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create lead submissions"
  ON public.lead_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "Admins can read lead submissions"
  ON public.lead_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lead submissions"
  ON public.lead_submissions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lead submissions"
  ON public.lead_submissions
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT ON public.lead_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.lead_submissions TO authenticated;

COMMENT ON TABLE public.lead_submissions IS
  'Contact and creator application submissions from the Gamerbiz website.';
