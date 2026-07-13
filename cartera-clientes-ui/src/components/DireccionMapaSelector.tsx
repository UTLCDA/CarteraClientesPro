import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  FormHelperText,
  Typography,
} from '@mui/material';
import { LocationOn as LocationIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

interface DireccionMapaSelectorProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  helperText?: string;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

const DireccionMapaSelector: React.FC<DireccionMapaSelectorProps> = ({
  value,
  onChange,
  error,
  helperText,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Default coordinate (Mexico City)
  const defaultLat = 19.4326;
  const defaultLon = -99.1332;

  // Custom marker icon using HTML/CSS (Indigo theme)
  const customIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
      ">
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #6366f1;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -15px;
          border: 2px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 8px;
            left: 8px;
          "></div>
        </div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 30],
  });

  // Reverse Geocoding: Get address from Lat/Lon
  const reverseGeocode = async (lat: number, lon: number) => {
    setIsSearchingMap(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      if (response.data && response.data.display_name) {
        onChange(response.data.display_name);
        setInputValue(response.data.display_name);
      }
    } catch (e) {
      console.error('Error in reverse geocoding:', e);
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Geocode: Get Lat/Lon from Address string
  const geocodeAddress = async (addressQuery: string) => {
    if (!addressQuery || !mapRef.current) return;
    setIsSearchingMap(true);
    try {
      const response = await axios.get<NominatimResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressQuery
        )}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Move map and marker
        mapRef.current.setView([lat, lon], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        }
      }
    } catch (e) {
      console.error('Error in geocoding:', e);
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLon], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([defaultLat, defaultLon], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker dragend
    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      reverseGeocode(latLng.lat, latLng.lng);
    });

    // Handle click on map to position marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    // Try to get user's location to center the map initially (if not editing an address)
    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          marker.setLatLng([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        () => {
          // Fallback to default
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch address suggestions (Nominatim Autocomplete)
  useEffect(() => {
    if (!inputValue || inputValue.length < 3) {
      setOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get<NominatimResult[]>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            inputValue
          )}&limit=5&addressdetails=1`
        );
        setOptions(response.data || []);
      } catch (e) {
        console.error('Error fetching autocomplete options:', e);
      } finally {
        setLoading(false);
      }
    }, 600); // Debounce API requests

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  // Handle external value changes (like edit mode loading address)
  useEffect(() => {
    if (value && value !== inputValue && !isSearchingMap) {
      setInputValue(value);
      // Wait a brief delay to ensure map is initialized before geocoding
      const timer = setTimeout(() => {
        geocodeAddress(value);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Autocomplete Input Search */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Autocomplete
          fullWidth
          freeSolo
          options={options}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.display_name
          }
          filterOptions={(x) => x} // Disable client-side filtering, let Nominatim handle it
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
            // Also notify react-hook-form about the raw text typing
            onChange(newInputValue);
          }}
          onChange={(_, newValue) => {
            if (newValue && typeof newValue !== 'string') {
              const lat = parseFloat(newValue.lat);
              const lon = parseFloat(newValue.lon);
              onChange(newValue.display_name);
              setInputValue(newValue.display_name);

              if (mapRef.current && markerRef.current) {
                mapRef.current.setView([lat, lon], 17);
                markerRef.current.setLatLng([lat, lon]);
              }
            }
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar dirección o arrastrar marcador *"
              error={error}
            />
          )}
        />
        <Button
          variant="outlined"
          onClick={() => geocodeAddress(inputValue)}
          disabled={isSearchingMap || !inputValue}
          sx={{ minWidth: 100, textTransform: 'none', fontWeight: 700 }}
        >
          {isSearchingMap ? <CircularProgress size={20} /> : <SearchIcon />}
        </Button>
      </Box>

      {/* Helper text if validation error */}
      {error && <FormHelperText error>{helperText}</FormHelperText>}

      {/* Map Container */}
      <Box
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
        }}
      >
        <Box
          ref={mapContainerRef}
          sx={{
            height: 300,
            width: '100%',
            zIndex: 1, // Ensure map is below modal overlays but interactive
          }}
        />
        {isSearchingMap && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={30} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Ubicando dirección...
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocationIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
        Puedes arrastrar el marcador azul o dar clic en el mapa para ajustar la dirección exacta.
      </Typography>
    </Box>
  );
};

export default DireccionMapaSelector;
