import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { mapPk } from "../../services/axiosCliente";

type Props = {
  lat: number;
  lng: number;
  zoom?: number;           
  height?: string | number; 
};

const ClienteListaMap = ({ lat, lng, zoom = 14, height = "60vh" }: Props) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  
  useEffect(() => {
    mapboxgl.accessToken = mapPk;

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: [lng, lat],
        zoom,
        interactive: true, // deshabilita mover/zoom
      });

      mapRef.current.on("load", () => {
        if (!mapRef.current) return;
        markerRef.current = new mapboxgl.Marker({ draggable: false })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); 

  // Actualiza centro/marker cuando cambian coords o zoom
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([lng, lat]);
    mapRef.current.setZoom(zoom);
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ draggable: false })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    }
  }, [lat, lng, zoom]);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
};

export default ClienteListaMap;