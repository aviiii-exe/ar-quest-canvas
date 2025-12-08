import React, { useState } from 'react';
import { FloatingNav } from '@/components/layout/FloatingNav';
import HeritageMap from '@/components/map/HeritageMap';
import { useHeritageSites, usePassportStamps } from '@/hooks/useHeritageSites';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { MapPin, Clock, Star, X } from 'lucide-react';
import QRScanner from '@/components/checkin/QRScanner';
import ProximityCheckIn from '@/components/checkin/ProximityCheckIn';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PROXIMITY_RADIUS_METERS = 200;

const Map = () => {
  const { user } = useAuth();
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: stamps, refetch: refetchStamps } = usePassportStamps();
  const { latitude, longitude } = useGeolocation({ watch: true });
  const { toast } = useToast();
  
  const [selectedSite, setSelectedSite] = useState<Tables<'heritage_sites'> | null>(null);

  const visitedSiteIds = stamps?.map(stamp => stamp.site_id) || [];

  const handleSiteClick = (site: Tables<'heritage_sites'>) => {
    setSelectedSite(site);
  };

  const handleQRScan = async (siteId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to collect stamps",
        variant: "destructive"
      });
      return;
    }

    const site = sites?.find(s => s.id === siteId);
    if (!site) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code doesn't match any heritage site",
        variant: "destructive"
      });
      return;
    }

    if (visitedSiteIds.includes(siteId)) {
      toast({
        title: "Already collected",
        description: `You've already collected the stamp for ${site.name}`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('passport_stamps')
        .insert({ user_id: user.id, site_id: siteId });

      if (error) throw error;

      toast({
        title: "Stamp Collected! 🎉",
        description: `You've collected the stamp for ${site.name}`,
      });

      refetchStamps();
      setSelectedSite(site);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to collect stamp. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProximityCheckIn = async () => {
    if (!selectedSite || !user) return;

    try {
      const { error } = await supabase
        .from('passport_stamps')
        .insert({ user_id: user.id, site_id: selectedSite.id });

      if (error) throw error;

      toast({
        title: "Stamp Collected! 🎉",
        description: `You've collected the stamp for ${selectedSite.name}`,
      });

      refetchStamps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to collect stamp. Please try again.",
        variant: "destructive"
      });
    }
  };

  const userLocation = latitude && longitude 
    ? { lat: latitude, lng: longitude } 
    : null;

  if (sitesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingNav />
        <div className="h-screen flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Floating Navigation */}
      <FloatingNav />

      {/* Full Screen Map */}
      <HeritageMap
        sites={sites || []}
        visitedSiteIds={visitedSiteIds}
        onSiteClick={handleSiteClick}
        userLocation={userLocation}
        fullScreen={true}
      />

      {/* QR Scanner - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-40">
        <QRScanner onScan={handleQRScan} />
      </div>

      {/* Stats Badge - Top Left below nav */}
      <div className="absolute top-20 left-4 z-40 flex flex-col gap-2">
        <Badge variant="secondary" className="text-sm py-1 px-3 bg-background/90 backdrop-blur-sm shadow-md">
          <MapPin className="h-3 w-3 mr-1" />
          {sites?.length || 0} Sites
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3 bg-background/90 backdrop-blur-sm shadow-md">
          <Star className="h-3 w-3 mr-1" />
          {visitedSiteIds.length} Visited
        </Badge>
      </div>

      {/* Selected Site Panel - Bottom Sheet Style */}
      {selectedSite && (
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom">
          <Card className="max-w-md mx-auto shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedSite.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {selectedSite.category && (
                      <Badge variant="outline">{selectedSite.category}</Badge>
                    )}
                    {selectedSite.difficulty && (
                      <Badge variant="secondary">{selectedSite.difficulty}</Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedSite(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSite.short_description && (
                <p className="text-sm text-muted-foreground">
                  {selectedSite.short_description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm">
                {selectedSite.estimated_duration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedSite.estimated_duration}
                  </div>
                )}
                {selectedSite.xp_reward && (
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4" />
                    +{selectedSite.xp_reward} XP
                  </div>
                )}
              </div>

              {/* Proximity Check-in with 200m radius */}
              <ProximityCheckIn
                site={selectedSite}
                onCheckIn={handleProximityCheckIn}
                isVisited={visitedSiteIds.includes(selectedSite.id)}
                checkInRadiusMeters={PROXIMITY_RADIUS_METERS}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Map;