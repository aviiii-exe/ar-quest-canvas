// Hampi Heritage Quest - Application Constants

// Map Configuration
export const HAMPI_CENTER: [number, number] = [76.4610, 15.3350];
export const DEFAULT_MAP_ZOOM = 14;
export const LOCATE_USER_ZOOM = 16;

// Map Styles
export const MAP_STYLES = {
  streets: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  satellite: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
} as const;

// Proximity & Check-in
export const PROXIMITY_RADIUS_METERS = 200;
export const PROXIMITY_DISPLAY_MULTIPLIER = 5; // For progress bar visualization

// XP & Leveling System
export const XP_PER_LEVEL = 500;
export const DEFAULT_XP_REWARD = 50;

// QR Code Configuration
export const QR_CODE_PREFIX = 'hampi-heritage:';

// MapLibre CSS CDN
export const MAPLIBRE_CSS_URL = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
