import { Check, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HeritageSite, PassportStamp } from '@/hooks/useHeritageSites';

interface PassportStampCardProps {
  site: HeritageSite;
  stamp?: PassportStamp;
}

export function PassportStampCard({ site, stamp }: PassportStampCardProps) {
  const isCollected = !!stamp;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 border-dashed p-4 transition-all',
        isCollected
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-muted/50 opacity-60'
      )}
    >
      {/* Stamp effect for collected */}
      {isCollected && (
        <div className="absolute -right-4 -top-4 rotate-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Check className="h-8 w-8 text-primary" />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Site thumbnail */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={site.image_url || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200'}
            alt={site.name}
            className={cn(
              'h-full w-full object-cover',
              !isCollected && 'grayscale'
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-semibold truncate',
            isCollected ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {site.name}
          </h4>
          
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="capitalize">{site.category}</span>
          </div>

          {isCollected && stamp && (
            <div className="mt-2 flex items-center gap-1 text-xs text-primary">
              <Calendar className="h-3 w-3" />
              <span>Collected {format(new Date(stamp.collected_at), 'MMM d, yyyy')}</span>
            </div>
          )}

          {!isCollected && (
            <p className="mt-2 text-xs text-muted-foreground">
              Visit to collect stamp
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
