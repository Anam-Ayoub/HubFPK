-- HUBFPK CLEAN REINSTALL SCRIPT
-- This will delete existing tables and recreate them correctly

-- 1. CLEAN UP (Drop in order of dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. PROFILES (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  thread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. THREADS
CREATE TABLE threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- Supports Markdown
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tag TEXT DEFAULT 'Discussion', -- Question, Discussion, Ressource, Annonce
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. POSTS (Replies & Nested Comments)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- For 1-level nesting
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. VOTES
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- ID of post or thread
  target_type TEXT CHECK (target_type IN ('post', 'thread')),
  value INTEGER CHECK (value IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_id) -- One vote per user per item
);

-- 7. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reply', 'vote'
  reference_id UUID NOT NULL, -- ID of the post/thread
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INITIAL CATEGORIES
INSERT INTO categories (name, slug, description, icon) VALUES
('Informatique', 'informatique', 'Développement, réseaux et IA', 'Code'),
('Mathématiques', 'mathematiques', 'Algèbre, Analyse et Probabilités', 'Sigma'),
('Économie', 'economie', 'Gestion, Marketing et Finance', 'TrendingUp'),
('Langues', 'langues', 'Français, Anglais et Communication', 'Languages'),
('Sciences', 'sciences', 'Physique, Chimie et Biologie', 'Beaker'),
('Vie étudiante', 'vie-etudiante', 'Clubs, événements et sorties', 'Users'),
('Annonces', 'annonces', 'Communications officielles de la FPK', 'Megaphone');

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Threads" ON threads FOR SELECT USING (true);
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read Votes" ON votes FOR SELECT USING (true);

-- AUTHENTICATED WRITE POLICIES
CREATE POLICY "Auth Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Auth Create Thread" ON threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth Update Own Thread" ON threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth Create Post" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth Vote" ON votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Auth Notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- 10. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, split_part(new.email, '@', 1), COALESCE(new.raw_user_meta_data->>'avatar_url', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
