import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // importante para estilos del mapa
import { useEffect, useRef, useState } from "react";
import { mapPk } from "../../services/axiosCliente";

const ClientesCrearMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [coordinates, setCoordinates] = useState<string[]>();

  useEffect(() => {
    mapboxgl.accessToken = mapPk;

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: [0, 0],
        zoom: 2,
      });

      mapRef.current.on("load", () => {
        if (!mapRef.current) return;
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([0, 0])
          .addTo(mapRef.current);

        markerRef.current.on("dragend", onDragEnd);
      });
    }

    const onResize = () => mapRef.current?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (markerRef.current) markerRef.current.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  function onDragEnd() {
    if (!markerRef.current) return;
    const lngLat = markerRef.current.getLngLat();
    setCoordinates([
      `Longitude: ${toFourDecimalPlaces(lngLat.lng)}`,
      `Latitude: ${toFourDecimalPlaces(lngLat.lat)}`,
    ]);
  }

  function toFourDecimalPlaces(num: number): number {
    return parseFloat(num.toFixed(4));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "60vh" }}>
      <div
        ref={mapContainerRef}
        id="map"
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 10,
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "5px 10px",
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: 11,
          lineHeight: "18px",
          borderRadius: 3,
          display: coordinates ? "block" : "none",
        }}
      >
        {coordinates?.map((coord, i) => (
          <p key={i} style={{ margin: 0 }}>
            {coord}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ClientesCrearMap;