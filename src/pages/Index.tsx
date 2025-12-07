import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useHeritageSites, usePassportStamps } from "@/hooks/useHeritageSites";
import { useUserAchievements } from "@/hooks/useAchievements";
import { AppLayout } from "@/components/layout/AppLayout";
import { XPProgress } from "@/components/gamification/XPProgress";
import { SiteList } from "@/components/sites/SiteList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Trophy, Compass, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: userStamps, isLoading: stampsLoading } = usePassportStamps();
  const { data: userAchievements, isLoading: achievementsLoading } = useUserAchievements();

  const isLoading = authLoading || profileLoading || sitesLoading || stampsLoading || achievementsLoading;

  // Calculate stats
  const visitedSitesCount = userStamps?.length || 0;
  const totalSitesCount = sites?.length || 0;
  const earnedAchievementsCount = userAchievements?.length || 0;
  const progressPercentage = totalSitesCount > 0 ? Math.round((visitedSitesCount / totalSitesCount) * 100) : 0;

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
        {/* Hero Section for Unauthenticated Users */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Explore Hampi's UNESCO Heritage
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Discover the Ruins of the <span className="text-primary">Vijayanagara Empire</span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Embark on a gamified journey through Hampi's ancient temples, royal monuments, 
              and sacred sites. Collect stamps, earn XP, and unlock achievements as you explore.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                Start Your Quest
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Collect Stamps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visit heritage sites and add unique stamps to your digital passport.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <Trophy className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle className="text-lg">Earn Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unlock badges for exploring temples, royal enclosures, and sacred sites.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <Compass className="h-10 w-10 text-emerald-500 mb-2" />
                <CardTitle className="text-lg">Gain XP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Level up your explorer rank and compete on the leaderboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              `Welcome, ${profile?.display_name || 'Explorer'}!`
            )}
          </h1>
          <p className="text-muted-foreground">
            Continue your journey through Hampi's heritage
          </p>
        </div>

        {/* XP Progress Card */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : (
          <XPProgress 
            currentXP={profile?.total_xp || 0} 
            level={profile?.level || 1} 
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">{visitedSitesCount}</div>
                  <div className="text-xs text-muted-foreground">Sites Visited</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-500">{earnedAchievementsCount}</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-emerald-500">{progressPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Heritage Sites Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Explore Sites</h2>
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {totalSitesCount} Sites
            </Badge>
          </div>

          <SiteList />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
