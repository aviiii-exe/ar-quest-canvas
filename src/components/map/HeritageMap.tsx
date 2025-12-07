import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Tables } from '@/integrations/supabase/types';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeritageMapProps {
  sites: Tables<'heritage_sites'>[];
  visitedSiteIds: string[];
  onSiteClick?: (site: Tables<'heritage_sites'>) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const HeritageMap: React.FC<HeritageMapProps> = ({ 
  sites, 
  visitedSiteIds, 
  onSiteClick,
  userLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Hampi coordinates (center of the heritage site)
  const HAMPI_CENTER: [number, number] = [76.4610, 15.3350];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: HAMPI_CENTER,
      zoom: 13,
      pitch: 30,
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
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110 ${
          isVisited 
            ? 'bg-green-500 text-white' 
            : 'bg-primary text-primary-foreground'
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <div class="p-2">
            <h3 class="font-semibold text-sm">${site.name}</h3>
            <p class="text-xs text-muted-foreground">${site.short_description || ''}</p>
            ${isVisited ? '<span class="text-xs text-green-600 font-medium">✓ Visited</span>' : ''}
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
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
      `;

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }
  }, [userLocation]);

  const handleLocateUser = () => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 1500
            });
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleCenterOnHampi = () => {
    map.current?.flyTo({
      center: HAMPI_CENTER,
      zoom: 13,
      duration: 1500
    });
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleLocateUser}
          disabled={isLocating}
          className="shadow-lg"
        >
          <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleCenterOnHampi}
          className="shadow-lg"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
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
    </div>
  );
};

export default HeritageMap;
