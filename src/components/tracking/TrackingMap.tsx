'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type DeliveryPosition = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  note: string | null;
  createdAt: Date;
};

type TrackingMapProps = {
  originLat: number | null;
  originLng: number | null;
  originName: string;
  destinationLat: number | null;
  destinationLng: number | null;
  destinationName: string;
  positions: DeliveryPosition[];
  departureText?: string;
  arrivalText?: string;
};

export default function TrackingMap({
  originLat,
  originLng,
  originName,
  destinationLat,
  destinationLng,
  destinationName,
  positions,
  departureText = 'Departure',
  arrivalText = 'Arrival'
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => {
    if (!isLeafletLoaded) return;
    if (typeof window === 'undefined' || !('L' in window)) return;

    if (!mapInstance.current && mapRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      mapInstance.current = L.map(mapRef.current);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      const points: [number, number][] = [];

      // Origin
      if (originLat && originLng) {
        L.marker([originLat, originLng], {
          icon: L.divIcon({ className: '', html: '<div style="font-size:28px;line-height:1;">🏭</div>', iconSize: [32,32], iconAnchor: [16,32] })
        }).addTo(mapInstance.current).bindPopup(`${departureText}: ${originName}`);
      }

      // Destination
      if (destinationLat && destinationLng) {
        L.marker([destinationLat, destinationLng], {
          icon: L.divIcon({ className: '', html: '<div style="font-size:28px;line-height:1;">🏁</div>', iconSize: [32,32], iconAnchor: [16,32] })
        }).addTo(mapInstance.current).bindPopup(`${arrivalText}: ${destinationName}`);
      }

      // History Positions
      positions.forEach(pos => {
        points.push([pos.latitude, pos.longitude]);
      });

      // Trajet parcouru
      if (points.length > 1) {
        L.polyline(points, { color: '#28a745', weight: 4 }).addTo(mapInstance.current);
      }

      // Trajet restant
      if (destinationLat && destinationLng && points.length > 0) {
        const lastPoint = points[points.length - 1];
        L.polyline([lastPoint, [destinationLat, destinationLng]], {
          color: '#dc3545', weight: 3, dashArray: '6, 8'
        }).addTo(mapInstance.current);
      }

      // Intermediary markers
      points.forEach((p, i) => {
        if (i < points.length - 1) {
          L.circleMarker(p, { radius: 5, color: '#3388ff' }).addTo(mapInstance.current);
        }
      });

      // Current Position marker
      if (points.length > 0) {
        const lastPos = positions[positions.length - 1];
        L.marker(points[points.length - 1]).addTo(mapInstance.current)
          .bindPopup(`${lastPos.city}, ${lastPos.country}`)
          .openPopup();
      }

      // Fit Bounds
      const boundsPoints = [...points];
      if (originLat && originLng) boundsPoints.push([originLat, originLng]);
      if (destinationLat && destinationLng) boundsPoints.push([destinationLat, destinationLng]);

      if (boundsPoints.length > 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).fitBounds(boundsPoints, { padding: [40, 40], maxZoom: 8 });
      } else if (boundsPoints.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).setView(boundsPoints[0], 10);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).setView([46.2276, 2.2137], 5); // France default
      }
    }

    return () => {
      if (mapInstance.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeafletLoaded, originLat, originLng, destinationLat, destinationLng, positions]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        strategy="afterInteractive" 
        onLoad={() => setIsLeafletLoaded(true)}
      />
      <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow-sm border border-gray-200" style={{ zIndex: 0 }}></div>
    </>
  );
}
