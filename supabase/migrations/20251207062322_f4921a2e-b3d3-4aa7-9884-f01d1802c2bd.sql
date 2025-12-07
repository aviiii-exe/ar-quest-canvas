-- Fix critical security issues: Restrict overly permissive RLS policies

-- 1. Profiles: Allow only authenticated users to view (for leaderboard)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles 
  FOR SELECT TO authenticated USING (true);

-- 2. Passport stamps: Users can only view their own stamps
DROP POLICY IF EXISTS "Anyone can view passport stamps" ON passport_stamps;
CREATE POLICY "Users can view own stamps" ON passport_stamps 
  FOR SELECT USING (auth.uid() = user_id);

-- 3. User achievements: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view user achievements" ON user_achievements;
CREATE POLICY "Authenticated users can view achievements" ON user_achievements 
  FOR SELECT TO authenticated USING (true);

-- 4. Challenge progress: Users can only view their own
DROP POLICY IF EXISTS "Anyone can view challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can view own challenge progress" ON user_challenge_progress 
  FOR SELECT USING (auth.uid() = user_id);