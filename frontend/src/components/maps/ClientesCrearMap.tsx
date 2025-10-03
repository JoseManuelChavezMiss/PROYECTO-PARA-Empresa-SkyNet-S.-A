import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { mapPk } from "../../services/axiosCliente";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
interface ClientesCrearMapProps {
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  initialLngLat?: [number, number];
}

const ClientesCrearMap = ({ onCoordinatesChange, initialLngLat = [0, 0] }: ClientesCrearMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const latestCbRef = useRef<ClientesCrearMapProps["onCoordinatesChange"] | null>(null);
  const [coordinates, setCoordinates] = useState<string[]>();

  useEffect(() => {
    latestCbRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  useEffect(() => {
    mapboxgl.accessToken = mapPk;

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: initialLngLat,
        zoom: 12,
      });

      const emitCoords = () => {
        if (!markerRef.current) return;
        const lngLat = markerRef.current.getLngLat();
        const lat = toFourDecimalPlaces(lngLat.lat);
        const lng = toFourDecimalPlaces(lngLat.lng);
        setCoordinates([`Longitude: ${lng}`, `Latitude: ${lat}`]);
        // Usa la última función sin provocar re-creación del mapa
        latestCbRef.current?.({ lat, lng });
      };

      mapRef.current.on("load", () => {
        if (!mapRef.current) return;

        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat(initialLngLat)
          .addTo(mapRef.current);

        emitCoords();

        markerRef.current.on("drag", emitCoords);
        markerRef.current.on("dragend", emitCoords);

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken!,
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: "Buscar lugar o dirección",
          language: "es",
          countries: "gt",
        });
        mapRef.current.addControl(geocoder);

        geocoder.on("result", (e: any) => {
          const center = e?.result?.center as [number, number];
          if (!center || !markerRef.current || !mapRef.current) return;
          markerRef.current.setLngLat(center);
          mapRef.current.easeTo({ center, zoom: Math.max(mapRef.current.getZoom(), 15) });
          emitCoords();
        });

        setTimeout(() => mapRef.current?.resize(), 0);
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

  function toFourDecimalPlaces(num: number): number {
    return parseFloat(num.toFixed(4));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "60vh" }}>
      <div ref={mapContainerRef} id="map" style={{ position: "absolute", inset: 0 }} />
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
          <p key={i} style={{ margin: 0 }}>{coord}</p>
        ))}
      </div>
    </div>
  );
};

export default ClientesCrearMap;

// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css"; // importante para estilos del mapa
// import { useEffect, useRef, useState } from "react";
// import { mapPk } from "../../services/axiosCliente";

// const ClientesCrearMap = () => {
//   const mapContainerRef = useRef<HTMLDivElement | null>(null);
//   const mapRef = useRef<mapboxgl.Map | null>(null);
//   const markerRef = useRef<mapboxgl.Marker | null>(null);

//   const [coordinates, setCoordinates] = useState<string[]>();

//   useEffect(() => {
//     mapboxgl.accessToken = mapPk;

//     if (mapContainerRef.current && !mapRef.current) {
//       mapRef.current = new mapboxgl.Map({
//         container: mapContainerRef.current,
//         style: "mapbox://styles/mapbox/standard",
//         center: [0, 0],
//         zoom: 2,
//       });

//       mapRef.current.on("load", () => {
//         if (!mapRef.current) return;
//         markerRef.current = new mapboxgl.Marker({ draggable: true })
//           .setLngLat([0, 0])
//           .addTo(mapRef.current);

//         markerRef.current.on("dragend", onDragEnd);
//       });
//     }

//     const onResize = () => mapRef.current?.resize();
//     window.addEventListener("resize", onResize);

//     return () => {
//       window.removeEventListener("resize", onResize);
//       if (markerRef.current) markerRef.current.remove();
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   function onDragEnd() {
//     if (!markerRef.current) return;
//     const lngLat = markerRef.current.getLngLat();
//     setCoordinates([
//       `Longitude: ${toFourDecimalPlaces(lngLat.lng)}`,
//       `Latitude: ${toFourDecimalPlaces(lngLat.lat)}`,
//     ]);
//   }

//   function toFourDecimalPlaces(num: number): number {
//     return parseFloat(num.toFixed(4));
//   }

//   return (
//     <div style={{ position: "relative", width: "100%", height: "60vh" }}>
//       <div
//         ref={mapContainerRef}
//         id="map"
//         style={{ position: "absolute", inset: 0 }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           bottom: 40,
//           left: 10,
//           background: "rgba(0,0,0,0.5)",
//           color: "#fff",
//           padding: "5px 10px",
//           fontFamily: "monospace",
//           fontWeight: "bold",
//           fontSize: 11,
//           lineHeight: "18px",
//           borderRadius: 3,
//           display: coordinates ? "block" : "none",
//         }}
//       >
//         {coordinates?.map((coord, i) => (
//           <p key={i} style={{ margin: 0 }}>
//             {coord}
//           </p>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ClientesCrearMap;