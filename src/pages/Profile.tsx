import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useHeritageSites, usePassportStamps } from '@/hooks/useHeritageSites';
import { useUserAchievements } from '@/hooks/useAchievements';
import { FloatingNav } from '@/components/layout/FloatingNav';
import { XPProgress } from '@/components/gamification/XPProgress';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { PassportTab } from '@/components/profile/PassportTab';
import { AchievementsTab } from '@/components/profile/AchievementsTab';
import { HistoryTab } from '@/components/profile/HistoryTab';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Stamp, History } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stamps, isLoading: stampsLoading } = usePassportStamps();
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isLoading = profileLoading || stampsLoading || achievementsLoading || sitesLoading;

  const sitesMap = sites?.reduce((acc, site) => {
    acc[site.id] = site;
    return acc;
  }, {} as Record<string, typeof sites[0]>) || {};

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      
      <div className="container pt-20 pb-8 space-y-6">
        <ProfileHeader
          displayName={profile?.display_name}
          username={profile?.username}
          avatarUrl={profile?.avatar_url}
          bio={profile?.bio}
          isLoading={isLoading}
          onSignOut={handleSignOut}
        />

        {!isLoading && (
          <XPProgress 
            currentXP={profile?.total_xp || 0} 
            level={profile?.level || 1} 
          />
        )}

        <ProfileStats
          sitesVisited={stamps?.length || 0}
          achievementsCount={achievements?.length || 0}
          totalXP={profile?.total_xp || 0}
        />

        <Tabs defaultValue="passport" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="passport" className="gap-2">
              <Stamp className="h-4 w-4" />
              <span className="hidden sm:inline">Passport</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passport" className="mt-4">
            <PassportTab 
              stamps={stamps} 
              sitesMap={sitesMap} 
              isLoading={stampsLoading || sitesLoading} 
            />
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <AchievementsTab 
              achievements={achievements} 
              isLoading={achievementsLoading} 
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <HistoryTab 
              stamps={stamps} 
              sitesMap={sitesMap} 
              isLoading={stampsLoading || sitesLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
