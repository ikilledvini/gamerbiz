CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TYPE public.publish_status AS ENUM ('draft', 'published', 'hidden');

CREATE TABLE public.talents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  stage_name text NOT NULL,
  username text,
  category text NOT NULL DEFAULT 'Multigame',
  city text,
  bio text,
  image_url text,
  media_kit_url text,
  status public.publish_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.talents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talents TO authenticated;
GRANT ALL ON public.talents TO service_role;
ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published talents"
ON public.talents FOR SELECT TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admins can read all talents"
ON public.talents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert talents"
ON public.talents FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update talents"
ON public.talents FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete talents"
ON public.talents FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_talents_updated_at
BEFORE UPDATE ON public.talents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.talents (slug, stage_name, category, status, sort_order) VALUES
('nofaxu', 'Nofaxu', 'Minecraft', 'published', 1),
('thalera', 'Thalera', 'Mangá/Anime + Pokémon', 'published', 2),
('frogman1', 'Frogman1', 'PUBG', 'published', 3),
('speed', 'Speed', 'Mortal Kombat', 'published', 4),
('ralisco', 'Ralisco', 'Arena Breakout', 'draft', 5),
('bladexzd', 'Bladexzd', 'Call of Duty', 'published', 6),
('legacyz1n', 'legacyz1n', 'Call of Duty + Counter-Strike 2', 'published', 7),
('dubblez', 'Dubblez', 'Call of Duty + Valorant', 'published', 8),
('chicoimitador', 'chicoimitador', 'Counter-Strike 2', 'published', 9),
('vitto', 'Vitto', 'Counter-Strike 2', 'published', 10),
('vett', 'Vett', 'Point Blank', 'published', 11),
('osuperwil', 'OsuperWil', 'Valorant', 'published', 12),
('revmpt', 'Revmpt', 'Valorant', 'published', 13),
('lubu', 'LuBu', 'Marvel Rivals', 'published', 14),
('colosso', 'Colosso', 'Marvel Rivals + Multigame', 'published', 15),
('nitrao', 'Nitrao', 'Overwatch + Marvel Rivals', 'published', 16),
('calura9', 'CALURA9', 'Dead by Daylight', 'published', 17),
('cerealforme', 'CerealForMe', 'Dead by Daylight', 'published', 18),
('darkmoonknit', 'darkmoonknit', 'Dead by Daylight', 'published', 19),
('breitnerro', 'Breitnerro', 'League of Legends', 'published', 20),
('nimayumii', 'NiMayumii', 'League of Legends + Just Chatting', 'published', 21),
('claritysnicket', 'ClaritySnicket', 'League of Legends + Wild Rift', 'draft', 22),
('isabrittis', 'IsaBrittis', 'Anime/Geek + League of Legends', 'published', 23),
('starshimas', 'StarShimas', 'Brawl Stars', 'published', 24),
('daniel-gallante', 'Daniel_Gallante', 'Diablo', 'published', 25),
('bennettarcontepyro', 'bennettarcontepyro', 'Genshin Impact', 'draft', 26),
('beletz', 'Beletz', 'Roblox', 'published', 27),
('raydiva', 'RayDiva', 'Roblox', 'published', 28),
('joaopdzin', 'JoaoPdzin', 'Roblox + Brawl Stars', 'published', 29),
('celinett', 'Celinett', 'GTA V + Minecraft', 'published', 30),
('lucroft', 'LuCroft', 'GTA V + Red Dead Redemption', 'published', 31),
('spok', 'Spok', 'Minecraft + Roblox', 'draft', 32),
('fbarreto', 'fbarreto', 'EAFC', 'published', 33),
('giann', 'giann', 'Rocket League', 'draft', 34),
('jatozord', 'jatozord', 'Rocket League', 'published', 35),
('nxghtt', 'nxghtt', 'Rocket League', 'published', 36),
('ciber', 'Ciber', 'Rocket League + Brawl Stars', 'published', 37),
('dobz', 'DobZ', 'Teamfight Tactics', 'published', 38),
('magnumofspades', 'MagnumOfSpades', 'Don''t Starve', 'published', 39),
('chonky', 'Chonky', 'Multigame', 'published', 40),
('oilaris', 'oiLaris', 'Multigame', 'published', 41),
('biagomez', 'BiaGomez', 'Multigame + Counter-Strike 2', 'published', 42),
('spiderkong', 'SpiderKong', 'Multigame + EAFC', 'published', 43),
('panettoni', 'Panettoni', 'Multigame + Pokémon', 'published', 44),
('nivyzera', 'Nivyzera', 'Multigame + Valorant', 'published', 45),
('geopasch', 'GeoPasch', 'Multigame', 'published', 46),
('teteia', 'Tetéia', 'Multigame', 'published', 47);