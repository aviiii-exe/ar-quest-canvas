-- Create app_role enum for user roles (security)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    sites_visited INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Heritage sites table
CREATE TABLE public.heritage_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category TEXT DEFAULT 'temple',
    xp_reward INTEGER DEFAULT 100,
    difficulty TEXT DEFAULT 'easy',
    historical_period TEXT,
    best_time_to_visit TEXT,
    estimated_duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.heritage_sites ENABLE ROW LEVEL SECURITY;

-- Achievements/Badges table
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'trophy',
    category TEXT DEFAULT 'exploration',
    xp_reward INTEGER DEFAULT 50,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER DEFAULT 1,
    rarity TEXT DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- User achievements (earned badges)
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Digital passport stamps (site visits)
CREATE TABLE public.passport_stamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.heritage_sites(id) ON DELETE CASCADE NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    photo_url TEXT,
    notes TEXT,
    UNIQUE (user_id, site_id)
);

ALTER TABLE public.passport_stamps ENABLE ROW LEVEL SECURITY;

-- Daily challenges table
CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 50,
    challenge_type TEXT NOT NULL,
    target_value INTEGER DEFAULT 1,
    active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- User challenge progress
CREATE TABLE public.user_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles: users can read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Profiles: users can read all profiles (for leaderboard), update own
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Heritage sites: everyone can read
CREATE POLICY "Anyone can view heritage sites"
ON public.heritage_sites FOR SELECT
TO authenticated
USING (true);

-- Achievements: everyone can read
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
TO authenticated
USING (true);

-- User achievements: users can read all (for comparison), insert own
CREATE POLICY "Anyone can view user achievements"
ON public.user_achievements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own achievements"
ON public.user_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Passport stamps: users can read all (for social), manage own
CREATE POLICY "Anyone can view passport stamps"
ON public.passport_stamps FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own stamps"
ON public.passport_stamps FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stamps"
ON public.passport_stamps FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Daily challenges: everyone can read
CREATE POLICY "Anyone can view daily challenges"
ON public.daily_challenges FOR SELECT
TO authenticated
USING (true);

-- User challenge progress: users can read all, manage own
CREATE POLICY "Anyone can view challenge progress"
ON public.user_challenge_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own challenge progress"
ON public.user_challenge_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
ON public.user_challenge_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username', 'Explorer')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_heritage_sites_updated_at
  BEFORE UPDATE ON public.heritage_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;