import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { mapPk } from '../../services/axiosCliente'

type Props = {
  visitas: { 
    id: number; 
    latitud: number; 
    longitud: number; 
    estado_visita: string;
    nombre_cliente: string;
  }[]
  refreshKey?: number
}

const TecnicoUbicacion = ({ visitas, refreshKey = 0 }: Props) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
  const routeRef = useRef<string | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Inicializar mapa
  useEffect(() => {
    mapboxgl.accessToken = mapPk
    if (!mapContainerRef.current) return

    // Limpiar mapa existente si existe
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-90.5069, 14.6349],
      zoom: 13,
    })

    // Obtener ubicación del técnico
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUbicacion({ lat: latitude, lng: longitude })

          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true,
          })

          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: 'red' })
              .setLngLat([longitude, latitude])
              .addTo(mapRef.current!)
          } else {
            markerRef.current.setLngLat([longitude, latitude])
          }
        },
        (err) => console.error('Error al obtener ubicación:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      )
    }

    return () => {
      // Limpiar marcadores
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      // Limpiar ruta
      if (routeRef.current && mapRef.current?.getSource(routeRef.current)) {
        mapRef.current.removeLayer(routeRef.current)
        mapRef.current.removeSource(routeRef.current)
        routeRef.current = null
      }
      
      // Limpiar marcador de ubicación
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [refreshKey]) // Agregar refreshKey como dependencia

  // Agregar marcadores de visitas y trazar ruta a la más cercana
  useEffect(() => {
    if (!mapRef.current || !ubicacion) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Limpiar ruta anterior si existe
    if (routeRef.current && mapRef.current.getSource(routeRef.current)) {
      mapRef.current.removeLayer(routeRef.current)
      mapRef.current.removeSource(routeRef.current)
      routeRef.current = null
    }

    // Filtrar visitas que no están completadas
    const visitasPendientes = visitas.filter((v) => v.estado_visita !== 'Completada')

    // Agregar marcadores
    visitasPendientes.forEach((v) => {
      const marker = new mapboxgl.Marker({ color: '#007bff' })
        .setLngLat([v.longitud, v.latitud])
        .setPopup(new mapboxgl.Popup().setHTML(`<b>${v.nombre_cliente}</b>`))
        .addTo(mapRef.current!)
      markersRef.current.push(marker)
    })

    // Ordenar por cercanía
    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    const masCercana = visitasPendientes
      .map((v) => ({
        ...v,
        distancia: calcularDistancia(ubicacion.lat, ubicacion.lng, v.latitud, v.longitud),
      }))
      .sort((a, b) => a.distancia - b.distancia)[0]

    // Dibujar ruta si hay una visita cercana
    if (masCercana) {
      obtenerRuta(ubicacion, { lat: masCercana.latitud, lng: masCercana.longitud })
    }
  }, [visitas, ubicacion, refreshKey]) // Agregar refreshKey como dependencia

  // Redimensionar mapa cuando cambie refreshKey
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize()
      }, 300)
    }
  }, [refreshKey])

  // Función para obtener ruta desde Mapbox Directions API
  const obtenerRuta = async (
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number }
  ) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${mapPk}`
      )
      const data = await res.json()
      
      if (!data.routes || data.routes.length === 0) {
        console.error('No se encontró ruta')
        return
      }
      
      const route = data.routes[0].geometry

      // Agregar capa de la ruta al mapa
      if (mapRef.current) {
        routeRef.current = 'routeLayer'

        mapRef.current.addSource('routeLayer', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route,
          },
        })

        mapRef.current.addLayer({
          id: 'routeLayer',
          type: 'line',
          source: 'routeLayer',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ff0000',
            'line-width': 4,
          },
        })
      }
    } catch (error) {
      console.error('Error al obtener ruta:', error)
    }
  }

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}

export default TecnicoUbicacion
// import { useEffect, useRef, useState } from 'react'
// import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl/dist/mapbox-gl.css'
// import { mapPk } from '../../services/axiosCliente'

// // Props: visitas y refreshKey
// type Props = {
//   visitas: { 
//     id: number; 
//     latitud: number; 
//     longitud: number; 
//     estado_visita: string;
//     nombre_cliente: string;  // Propiedad agregada
//   }[]
//   refreshKey?: number
// }

// const TecnicoUbicacion = ({ visitas, refreshKey = 0 }: Props) => {
//   const mapContainerRef = useRef<HTMLDivElement | null>(null)
//   const mapRef = useRef<mapboxgl.Map | null>(null)
//   const markerRef = useRef<mapboxgl.Marker | null>(null)
//   const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
//   const routeRef = useRef<string | null>(null)

//   // Inicializar mapa
//   useEffect(() => {
//     mapboxgl.accessToken = mapPk
//     if (!mapContainerRef.current) return

//     mapRef.current = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [-90.5069, 14.6349],
//       zoom: 13,
//     })

//     // Obtener ubicación del técnico
//     if (navigator.geolocation) {
//       navigator.geolocation.watchPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords
//           setUbicacion({ lat: latitude, lng: longitude })

//           mapRef.current?.flyTo({
//             center: [longitude, latitude],
//             zoom: 15,
//             essential: true,
//           })

//           if (!markerRef.current) {
//             markerRef.current = new mapboxgl.Marker({ color: 'red' })
//               .setLngLat([longitude, latitude])
//               .addTo(mapRef.current!)
//           } else {
//             markerRef.current.setLngLat([longitude, latitude])
//           }
//         },
//         (err) => console.error('Error al obtener ubicación:', err),
//         { enableHighAccuracy: true, maximumAge: 0 }
//       )
//     }

//     return () => {
//       mapRef.current?.remove()
//       mapRef.current = null
//     }
//   }, [])

//   // 🧩 Agregar marcadores de visitas y trazar ruta a la más cercana
//   useEffect(() => {
//     if (!mapRef.current || !ubicacion) return

//     // Limpiar ruta anterior si existe
//     if (routeRef.current && mapRef.current.getSource(routeRef.current)) {
//       mapRef.current.removeLayer(routeRef.current!)
//       mapRef.current.removeSource(routeRef.current!)
//       routeRef.current = null
//     }

//     // Eliminar marcadores previos
//     const markers: mapboxgl.Marker[] = []

//     // Filtrar visitas que no están completadas
//     const visitasPendientes = visitas.filter((v) => v.estado_visita !== 'Completada')

//     // Agregar marcadores
//     visitasPendientes.forEach((v) => {
//       const marker = new mapboxgl.Marker({ color: '#007bff' })
//         .setLngLat([v.longitud, v.latitud])
//         .setPopup(new mapboxgl.Popup().setHTML(`<b>${v.nombre_cliente}</b>`))  // Mostrar nombre del cliente
//         .addTo(mapRef.current!)
//       markers.push(marker)
//     })

//     // Ordenar por cercanía
//     const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//       const R = 6371
//       const dLat = ((lat2 - lat1) * Math.PI) / 180
//       const dLon = ((lon2 - lon1) * Math.PI) / 180
//       const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos((lat1 * Math.PI) / 180) *
//           Math.cos((lat2 * Math.PI) / 180) *
//           Math.sin(dLon / 2) ** 2
//       return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//     }

//     const masCercana = visitasPendientes
//       .map((v) => ({
//         ...v,
//         distancia: calcularDistancia(ubicacion.lat, ubicacion.lng, v.latitud, v.longitud),
//       }))
//       .sort((a, b) => a.distancia - b.distancia)[0]

//     // Dibujar ruta si hay una visita cercana
//     if (masCercana) {
//       obtenerRuta(ubicacion, { lat: masCercana.latitud, lng: masCercana.longitud })
//     }

//     return () => {
//       markers.forEach((m) => m.remove())
//     }
//   }, [visitas, ubicacion])

//   // 🔁 Redimensionar mapa al abrir tab
//   useEffect(() => {
//     mapRef.current?.resize()
//   }, [refreshKey])

//   // 🧩 Función para obtener ruta desde Mapbox Directions API
//   const obtenerRuta = async (
//     origen: { lat: number; lng: number },
//     destino: { lat: number; lng: number }
//   ) => {
//     try {
//       const res = await fetch(
//         `https://api.mapbox.com/directions/v5/mapbox/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${mapPk}`
//       )
//       const data = await res.json()
//       const route = data.routes[0].geometry

//       // Agregar capa de la ruta al mapa
//       if (mapRef.current) {
//         routeRef.current = 'routeLayer'

//         mapRef.current.addSource('routeLayer', {
//           type: 'geojson',
//           data: {
//             type: 'Feature',
//             properties: {},
//             geometry: route,
//           },
//         })

//         mapRef.current.addLayer({
//           id: 'routeLayer',
//           type: 'line',
//           source: 'routeLayer',
//           layout: {
//             'line-join': 'round',
//             'line-cap': 'round',
//           },
//           paint: {
//             'line-color': '#ff0000',
//             'line-width': 4,
//           },
//         })
//       }
//     } catch (error) {
//       console.error('Error al obtener ruta:', error)
//     }
//   }

//   return (
//     <div style={{ width: '100%', height: '400px', position: 'relative' }}>
//       <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
//     </div>
//   )
// }

// export default TecnicoUbicacion
// import { useEffect, useRef, useState } from 'react'
// import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl/dist/mapbox-gl.css'
// import { mapPk } from '../../services/axiosCliente'

// // Props: visitas y refreshKey
// type Props = {
//   visitas: { id: number; latitud: number; longitud: number; estado_visita: string }[]
//   refreshKey?: number
// }

// const TecnicoUbicacion = ({ visitas, refreshKey = 0 }: Props) => {
//   const mapContainerRef = useRef<HTMLDivElement | null>(null)
//   const mapRef = useRef<mapboxgl.Map | null>(null)
//   const markerRef = useRef<mapboxgl.Marker | null>(null)
//   const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
//   const routeRef = useRef<string | null>(null)

//   // Inicializar mapa
//   useEffect(() => {
//     mapboxgl.accessToken = mapPk
//     if (!mapContainerRef.current) return

//     mapRef.current = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [-90.5069, 14.6349],
//       zoom: 13,
//     })

//     // Obtener ubicación del técnico
//     if (navigator.geolocation) {
//       navigator.geolocation.watchPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords
//           setUbicacion({ lat: latitude, lng: longitude })

//           mapRef.current?.flyTo({
//             center: [longitude, latitude],
//             zoom: 15,
//             essential: true,
//           })

//           if (!markerRef.current) {
//             markerRef.current = new mapboxgl.Marker({ color: 'red' })
//               .setLngLat([longitude, latitude])
//               .addTo(mapRef.current!)
//           } else {
//             markerRef.current.setLngLat([longitude, latitude])
//           }
//         },
//         (err) => console.error('Error al obtener ubicación:', err),
//         { enableHighAccuracy: true, maximumAge: 0 }
//       )
//     }

//     return () => {
//       mapRef.current?.remove()
//       mapRef.current = null
//     }
//   }, [])

//   // 🧩 Agregar marcadores de visitas y trazar ruta a la más cercana
//   useEffect(() => {
//     if (!mapRef.current || !ubicacion) return

//     // Limpiar ruta anterior si existe
//     if (routeRef.current && mapRef.current.getSource(routeRef.current)) {
//       mapRef.current.removeLayer(routeRef.current!)
//       mapRef.current.removeSource(routeRef.current!)
//       routeRef.current = null
//     }

//     // Eliminar marcadores previos
//     const markers: mapboxgl.Marker[] = []

//     // Filtrar visitas que no están completadas
//     const visitasPendientes = visitas.filter((v) => v.estado_visita !== 'Completada')

//     // Agregar marcadores
//     visitasPendientes.forEach((v) => {
//       const marker = new mapboxgl.Marker({ color: '#007bff' })
//         .setLngLat([v.longitud, v.latitud])
//         .setPopup(new mapboxgl.Popup().setHTML(`<b>Visita #${v.id}</b>`))
//         .addTo(mapRef.current!)
//       markers.push(marker)
//     })

//     // Ordenar por cercanía
//     const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//       const R = 6371
//       const dLat = ((lat2 - lat1) * Math.PI) / 180
//       const dLon = ((lon2 - lon1) * Math.PI) / 180
//       const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos((lat1 * Math.PI) / 180) *
//           Math.cos((lat2 * Math.PI) / 180) *
//           Math.sin(dLon / 2) ** 2
//       return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//     }

//     const masCercana = visitasPendientes
//       .map((v) => ({
//         ...v,
//         distancia: calcularDistancia(ubicacion.lat, ubicacion.lng, v.latitud, v.longitud),
//       }))
//       .sort((a, b) => a.distancia - b.distancia)[0]

//     // Dibujar ruta si hay una visita cercana
//     if (masCercana) {
//       obtenerRuta(ubicacion, { lat: masCercana.latitud, lng: masCercana.longitud })
//     }

//     return () => {
//       markers.forEach((m) => m.remove())
//     }
//   }, [visitas, ubicacion])

//   // 🔁 Redimensionar mapa al abrir tab
//   useEffect(() => {
//     mapRef.current?.resize()
//   }, [refreshKey])

//   // 🧩 Función para obtener ruta desde Mapbox Directions API
//   const obtenerRuta = async (
//     origen: { lat: number; lng: number },
//     destino: { lat: number; lng: number }
//   ) => {
//     try {
//       const res = await fetch(
//         `https://api.mapbox.com/directions/v5/mapbox/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${mapPk}`
//       )
//       const data = await res.json()
//       const route = data.routes[0].geometry

//       // Agregar capa de la ruta al mapa
//       if (mapRef.current) {
//         routeRef.current = 'routeLayer'

//         mapRef.current.addSource('routeLayer', {
//           type: 'geojson',
//           data: {
//             type: 'Feature',
//             properties: {},
//             geometry: route,
//           },
//         })

//         mapRef.current.addLayer({
//           id: 'routeLayer',
//           type: 'line',
//           source: 'routeLayer',
//           layout: {
//             'line-join': 'round',
//             'line-cap': 'round',
//           },
//           paint: {
//             'line-color': '#ff0000',
//             'line-width': 4,
//           },
//         })
//       }
//     } catch (error) {
//       console.error('Error al obtener ruta:', error)
//     }
//   }

//   return (
//     <div style={{ width: '100%', height: '400px', position: 'relative' }}>
//       <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
//     </div>
//   )
// }

// export default TecnicoUbicacion

// import { useEffect, useRef } from 'react'
// import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl/dist/mapbox-gl.css'
// import { mapPk } from '../../services/axiosCliente'

// type Props = { refreshKey?: number }

// const TecnicoUbicacion = ({ refreshKey = 0 }: Props) => {
//   const mapContainerRef = useRef<HTMLDivElement | null>(null)
//   const mapRef = useRef<mapboxgl.Map | null>(null)
//   const markerRef = useRef<mapboxgl.Marker | null>(null)

//   useEffect(() => {
//     mapboxgl.accessToken = mapPk
//     if (!mapContainerRef.current) return

//     mapRef.current = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/standard',
//       center: [-90.5069, 14.6349],
//       zoom: 13,
//     })

//     if (navigator.geolocation) {
//       navigator.geolocation.watchPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords

//           mapRef.current?.flyTo({
//             center: [longitude, latitude],
//             zoom: 15,
//             essential: true,
//           })

//           if (!markerRef.current) {
//             markerRef.current = new mapboxgl.Marker({ color: 'red' })
//               .setLngLat([longitude, latitude])
//               .addTo(mapRef.current!)
//           } else {
//             markerRef.current.setLngLat([longitude, latitude])
//           }
//         },
//         (err) => console.error('Error al obtener ubicación:', err),
//         { enableHighAccuracy: true, maximumAge: 0 }
//       )
//     } else {
//       alert('La geolocalización no está soportada en este navegador.')
//     }

//     return () => {
//       mapRef.current?.remove()
//       mapRef.current = null
//     }
//   }, [])

//   // 🔁 Cuando se reabre el tab, se forza el resize
//   useEffect(() => {
//     mapRef.current?.resize()
//   }, [refreshKey])

//   return (
//     <div style={{ width: '100%', height: '350px', position: 'relative' }}>
//       <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
//     </div>
//   )
// }

// export default TecnicoUbicacion


