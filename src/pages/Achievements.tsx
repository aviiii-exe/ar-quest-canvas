import { Trophy, Award, Zap } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { useAchievements, useUserAchievements } from '@/hooks/useAchievements';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Achievements() {
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: userAchievements, isLoading: userAchievementsLoading } = useUserAchievements();

  const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);
  const earnedCount = earnedIds.size;
  const totalCount = achievements?.length || 0;

  const categorizedAchievements = achievements?.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  if (achievementsLoading || userAchievementsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-20" />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Collect badges by exploring Hampi's heritage
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Award className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{earnedCount} / {totalCount}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xp/20">
              <Zap className="h-5 w-5 text-xp" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {userAchievements?.reduce((sum, ua: { achievement?: { xp_reward?: number } }) => 
                  sum + (ua.achievement?.xp_reward || 0), 0) || 0}
              </p>
              <p className="text-xs text-muted-foreground">XP from Badges</p>
            </div>
          </div>
        </div>

        {/* Achievements by Category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.keys(categorizedAchievements || {}).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {achievements?.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  earned={earnedIds.has(achievement.id)}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(categorizedAchievements || {}).map(([category, categoryAchievements]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {categoryAchievements?.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={earnedIds.has(achievement.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Achievement Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">All Badges</h2>
          <div className="space-y-3">
            {achievements?.map((achievement) => {
              const isEarned = earnedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                    isEarned 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border/50 bg-card opacity-60'
                  }`}
                >
                  <AchievementBadge 
                    achievement={achievement} 
                    earned={isEarned} 
                    size="sm"
                    showDetails={false}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4 text-xp" />
                    <span className="font-medium">{achievement.xp_reward} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
