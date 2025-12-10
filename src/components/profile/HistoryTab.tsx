import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { History, MapPin } from 'lucide-react';
import type { HeritageSite, PassportStamp } from '@/hooks/useHeritageSites';

interface HistoryTabProps {
  stamps: PassportStamp[] | undefined;
  sitesMap: Record<string, HeritageSite>;
  isLoading: boolean;
}

export const HistoryTab = ({ stamps, sitesMap, isLoading }: HistoryTabProps) => {
  const sortedStamps = stamps
    ? [...stamps].sort((a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime())
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Visit History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : sortedStamps.length > 0 ? (
          <div className="space-y-4">
            {sortedStamps.map(stamp => {
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
          <EmptyState
            icon={History}
            title="No visit history yet"
            description="Start exploring to build your history!"
          />
        )}
      </CardContent>
    </Card>
  );
};
