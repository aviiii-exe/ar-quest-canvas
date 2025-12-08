import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useHeritageSites, usePassportStamps } from '@/hooks/useHeritageSites';
import { useUserAchievements } from '@/hooks/useAchievements';
import { FloatingNav } from '@/components/layout/FloatingNav';
import { XPProgress } from '@/components/gamification/XPProgress';
import { PassportStampCard } from '@/components/passport/PassportStampCard';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, MapPin, Trophy, Stamp, History } from 'lucide-react';

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

  // Create a map of site_id to site data
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
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mx-auto sm:mx-0" />
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{profile?.display_name || 'Explorer'}</h1>
                    <p className="text-muted-foreground">@{profile?.username || 'explorer'}</p>
                    {profile?.bio && <p className="text-sm mt-2">{profile.bio}</p>}
                  </>
                )}
              </div>

              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* XP Progress */}
        {!isLoading && (
          <XPProgress 
            currentXP={profile?.total_xp || 0} 
            level={profile?.level || 1} 
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{stamps?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Sites Visited</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <div className="text-2xl font-bold">{achievements?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Stamp className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
              <div className="text-2xl font-bold">{profile?.total_xp || 0}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Passport, Achievements, History */}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stamp className="h-5 w-5" />
                  Digital Passport
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stampsLoading || sitesLoading ? (
                  <div className="grid gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : stamps && stamps.length > 0 ? (
                  <div className="grid gap-4">
                    {stamps.map(stamp => {
                      const site = sitesMap[stamp.site_id];
                      if (!site) return null;
                      return (
                        <PassportStampCard 
                          key={stamp.id} 
                          site={site}
                          stamp={stamp}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stamp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No stamps collected yet</p>
                    <p className="text-sm">Visit heritage sites to collect stamps!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {achievements.map(item => (
                      <AchievementBadge 
                        key={item.id} 
                        achievement={item.achievement}
                        earned={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No achievements earned yet</p>
                    <p className="text-sm">Explore Hampi to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Visit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stampsLoading || sitesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : stamps && stamps.length > 0 ? (
                  <div className="space-y-4">
                    {stamps
                      .sort((a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime())
                      .map(stamp => {
                        const site = sitesMap[stamp.site_id];
                        if (!site) return null;
                        return (
                          <div key={stamp.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{site.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(stamp.collected_at).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              +{site.xp_reward || 50} XP
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No visit history yet</p>
                    <p className="text-sm">Start exploring to build your history!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;