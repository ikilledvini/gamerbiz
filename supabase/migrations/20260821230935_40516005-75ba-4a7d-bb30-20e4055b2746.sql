CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  cover_image_alt text,
  category text NOT NULL DEFAULT 'Gamerbiz',
  author_name text NOT NULL DEFAULT 'Gamerbiz',
  status public.publish_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 999,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_public_order_idx
ON public.blog_posts (status, sort_order, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can read all blog posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;