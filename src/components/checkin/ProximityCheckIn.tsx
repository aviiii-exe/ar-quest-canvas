import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

interface ProximityCheckInProps {
  site: Tables<'heritage_sites'>;
  onCheckIn: () => void;
  isVisited: boolean;
  checkInRadiusMeters?: number;
}

const ProximityCheckIn: React.FC<ProximityCheckInProps> = ({
  site,
  onCheckIn,
  isVisited,
  checkInRadiusMeters = 100 // Default 100 meters
}) => {
  const { 
    latitude, 
    longitude, 
    loading, 
    error, 
    getCurrentPosition,
    getDistanceFromLatLonInMeters,
    isWithinRadius 
  } = useGeolocation({ watch: true });

  const [distance, setDistance] = useState<number | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      const dist = getDistanceFromLatLonInMeters(
        latitude,
        longitude,
        site.latitude,
        site.longitude
      );
      setDistance(dist);
      setCanCheckIn(dist <= checkInRadiusMeters);
    }
  }, [latitude, longitude, site, checkInRadiusMeters, getDistanceFromLatLonInMeters]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (isVisited) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">Already Visited</p>
            <p className="text-sm text-muted-foreground">You've collected this stamp!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col gap-3">
          {/* Location status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className={cn(
                "h-4 w-4",
                loading ? "animate-pulse text-muted-foreground" : 
                error ? "text-destructive" : 
                canCheckIn ? "text-green-500" : "text-primary"
              )} />
              <span className="text-sm">
                {loading ? 'Getting location...' : 
                 error ? error : 
                 distance !== null ? `${formatDistance(distance)} away` : 
                 'Location not available'}
              </span>
            </div>
            {!loading && !error && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={getCurrentPosition}
                className="text-xs"
              >
                Refresh
              </Button>
            )}
          </div>

          {/* Progress bar showing proximity */}
          {distance !== null && (
            <div className="w-full">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    canCheckIn ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (1 - distance / (checkInRadiusMeters * 5)) * 100))}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {canCheckIn 
                  ? "You're within check-in range!" 
                  : `Get within ${checkInRadiusMeters}m to check in`}
              </p>
            </div>
          )}

          {/* Check-in button */}
          <Button
            onClick={onCheckIn}
            disabled={!canCheckIn || loading}
            className="w-full gap-2"
          >
            <MapPin className="h-4 w-4" />
            {canCheckIn ? 'Check In & Collect Stamp' : 'Get Closer to Check In'}
          </Button>

          {/* Hint for demo/testing */}
          {!canCheckIn && distance !== null && (
            <p className="text-xs text-muted-foreground text-center">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Move closer to the site or use QR code check-in
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProximityCheckIn;
