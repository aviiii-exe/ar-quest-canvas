import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import HeritageMap from '@/components/map/HeritageMap';
import { useHeritageSites, usePassportStamps, useCollectStamp } from '@/hooks/useHeritageSites';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { MapPin, Clock, Star, Navigation, X } from 'lucide-react';
import QRScanner from '@/components/checkin/QRScanner';
import ProximityCheckIn from '@/components/checkin/ProximityCheckIn';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Map = () => {
  const { user } = useAuth();
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: stamps, refetch: refetchStamps } = usePassportStamps();
  const { latitude, longitude } = useGeolocation({ watch: true });
  const { toast } = useToast();
  const collectStamp = useCollectStamp();
  
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
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Heritage Sites Map</h1>
            <p className="text-muted-foreground">
              Explore Hampi's UNESCO World Heritage Sites
            </p>
          </div>
          <div className="flex gap-2">
            <QRScanner onScan={handleQRScan} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <MapPin className="h-3 w-3 mr-1" />
            {sites?.length || 0} Sites
          </Badge>
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <Star className="h-3 w-3 mr-1" />
            {visitedSiteIds.length} Visited
          </Badge>
          {userLocation && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Navigation className="h-3 w-3 mr-1" />
              Location Active
            </Badge>
          )}
        </div>

        {/* Map */}
        <HeritageMap
          sites={sites || []}
          visitedSiteIds={visitedSiteIds}
          onSiteClick={handleSiteClick}
          userLocation={userLocation}
        />

        {/* Selected Site Details */}
        {selectedSite && (
          <Card>
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

              {/* Proximity Check-in */}
              <ProximityCheckIn
                site={selectedSite}
                onCheckIn={handleProximityCheckIn}
                isVisited={visitedSiteIds.includes(selectedSite.id)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Map;
