import { BookOpen, MapPin, Trophy, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PassportStampCard } from '@/components/passport/PassportStampCard';
import { useHeritageSites, usePassportStamps } from '@/hooks/useHeritageSites';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function Passport() {
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: stamps, isLoading: stampsLoading } = usePassportStamps();
  const { data: profile } = useProfile();

  const stampsBySiteId = new Map(stamps?.map((s) => [s.site_id, s]) || []);
  const collectedCount = stamps?.length || 0;
  const totalSites = sites?.length || 0;
  const completionPercent = totalSites > 0 ? (collectedCount / totalSites) * 100 : 0;

  if (sitesLoading || stampsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28" />
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
            <BookOpen className="h-6 w-6 text-primary" />
            Digital Passport
          </h1>
          <p className="text-muted-foreground">
            Your collection of heritage site stamps
          </p>
        </div>

        {/* Stats Card */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{collectedCount}</p>
                <p className="text-sm text-muted-foreground">Stamps Collected</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profile?.total_xp || 0}</p>
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Level {profile?.level || 1}</p>
                <p className="text-sm text-muted-foreground">Explorer Rank</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Collection Progress</span>
              <span className="font-medium text-foreground">
                {collectedCount} / {totalSites} sites
              </span>
            </div>
            <Progress value={completionPercent} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {completionPercent.toFixed(0)}% complete • {totalSites - collectedCount} sites remaining
            </p>
          </div>
        </div>

        {/* Stamps Grid */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Your Stamps</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites?.map((site) => (
              <PassportStampCard
                key={site.id}
                site={site}
                stamp={stampsBySiteId.get(site.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
