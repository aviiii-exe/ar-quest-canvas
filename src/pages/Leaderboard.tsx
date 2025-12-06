import { Trophy, Users, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { useLeaderboard } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard(50);
  const { user } = useAuth();

  const currentUserRank = leaderboard?.findIndex((p) => p.user_id === user?.id);
  const hasRanking = currentUserRank !== undefined && currentUserRank !== -1;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-20" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
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
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top explorers of Hampi's heritage
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{leaderboard?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Explorers</p>
            </div>
          </div>
          
          {hasRanking && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">#{currentUserRank + 1}</p>
                <p className="text-xs text-muted-foreground">Your Rank</p>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard?.map((profile, index) => (
            <LeaderboardCard
              key={profile.id}
              profile={profile}
              rank={index + 1}
            />
          ))}
        </div>

        {leaderboard?.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No explorers yet. Be the first!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
