import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { Tables } from '@/integrations/supabase/types';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import MapLibre CSS via CDN to ensure proper loading
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';

interface HeritageMapProps {
  sites: Tables<'heritage_sites'>[];
  visitedSiteIds: string[];
  onSiteClick?: (site: Tables<'heritage_sites'>) => void;
  userLocation?: { lat: number; lng: number } | null;
  fullScreen?: boolean;
}

const HeritageMap: React.FC<HeritageMapProps> = ({ 
  sites, 
  visitedSiteIds, 
  onSiteClick,
  userLocation,
  fullScreen = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  // Hampi coordinates (center of the heritage site)
  const HAMPI_CENTER: [number, number] = [76.4610, 15.3350];

  const MAP_STYLES = {
    streets: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    satellite: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  };

  // Load MapLibre CSS dynamically
  useEffect(() => {
    const existingLink = document.querySelector(`link[href="${MAPLIBRE_CSS}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: HAMPI_CENTER,
      zoom: 14,
      pitch: 0,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }),
      'bottom-left'
    );

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      userMarkerRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add site markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    sites.forEach(site => {
      const isVisited = visitedSiteIds.includes(site.id);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'site-marker';
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110 ${
          isVisited 
            ? 'bg-green-500 text-white' 
            : 'bg-primary text-primary-foreground'
        }" style="background-color: ${isVisited ? '#22c55e' : 'hsl(var(--primary))'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([site.longitude, site.latitude])
        .addTo(map.current!);

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-1">${site.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${site.short_description || ''}</p>
            <div class="flex items-center gap-2">
              ${isVisited ? '<span class="text-xs text-green-600 font-medium">✓ Visited</span>' : ''}
              ${site.xp_reward ? `<span class="text-xs text-blue-600">+${site.xp_reward} XP</span>` : ''}
            </div>
          </div>
        `);

      marker.setPopup(popup);

      el.addEventListener('click', () => {
        onSiteClick?.(site);
      });

      markersRef.current.push(marker);
    });
  }, [sites, visitedSiteIds, onSiteClick]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="relative">
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `;

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }
  }, [userLocation]);

  const handleLocateUser = useCallback(() => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 16,
              duration: 2000,
              essential: true
            });
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  const handleCenterOnHampi = () => {
    map.current?.flyTo({
      center: HAMPI_CENTER,
      zoom: 14,
      duration: 1500
    });
  };

  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'streets' ? 'satellite' : 'streets';
    setMapStyle(newStyle);
    map.current?.setStyle(MAP_STYLES[newStyle]);
  };

  return (
    <div className={cn(
      "relative w-full overflow-hidden",
      fullScreen ? "h-screen" : "h-[400px] rounded-xl border border-border"
    )}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map controls - Bottom Right */}
      <div className={cn(
        "absolute flex flex-col gap-2 z-30",
        fullScreen ? "bottom-24 right-4" : "bottom-4 right-4"
      )}>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleLocateUser}
          disabled={isLocating}
          className="shadow-lg bg-background/90 backdrop-blur-sm"
          title="Go to my location"
        >
          <Navigation className={cn("h-4 w-4 text-foreground", isLocating && "animate-spin")} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleCenterOnHampi}
          className="shadow-lg bg-background/90 backdrop-blur-sm"
          title="Center on Hampi"
        >
          <MapPin className="h-4 w-4 text-foreground" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleMapStyle}
          className="shadow-lg bg-background/90 backdrop-blur-sm"
          title="Toggle map style"
        >
          <Layers className="h-4 w-4 text-foreground" />
        </Button>
      </div>

      {/* Legend - Only show in non-fullscreen or as overlay */}
      {!fullScreen && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-30">
          <div className="text-xs font-medium mb-2">Legend</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Not visited</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Your location</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageMap;