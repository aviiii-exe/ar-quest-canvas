import { PassportStampCard } from '@/components/passport/PassportStampCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { Stamp } from 'lucide-react';
import type { HeritageSite, PassportStamp } from '@/hooks/useHeritageSites';

interface PassportTabProps {
  stamps: PassportStamp[] | undefined;
  sitesMap: Record<string, HeritageSite>;
  isLoading: boolean;
}

export const PassportTab = ({ stamps, sitesMap, isLoading }: PassportTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stamp className="h-5 w-5" />
          Digital Passport
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
          <EmptyState
            icon={Stamp}
            title="No stamps collected yet"
            description="Visit heritage sites to collect stamps!"
          />
        )}
      </CardContent>
    </Card>
  );
};
