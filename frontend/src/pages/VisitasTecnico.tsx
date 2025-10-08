import { useEffect, useState } from 'react'
import { obtenerVisitasPorTecnico, type VisitaTecnico } from '../services/VisitasService'
import { Button } from 'primereact/button'
import Tablas from '../components/Tablas'
import { Dialog } from 'primereact/dialog'
import ClienteListaMap from '../components/maps/ClienteListaMap'
import { Accordion, AccordionTab } from 'primereact/accordion';
import TecnicoUbicacion from '../components/maps/TecnicoUbicacion'
import DetalleVisitasForm, { type VisitaParaForm } from '../components/forms/DetalleVisitasForm'

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const VisitasTecnico = () => {
    const tecnicoId = Number(localStorage.getItem('idUser')) || 0
    const [visitas, setVisitas] = useState<VisitaTecnico[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [visibleMapa, setVisibleMapa] = useState(false)
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [activeIndex, setActiveIndex] = useState<number | number[]>(0)
    const [mapRefresh, setMapRefresh] = useState(0)
    const [visibleForm, setVisibleForm] = useState(false)
    const [selectedVisita, setSelectedVisita] = useState<VisitaTecnico | null>(null)


    const abrirMapa = (row: VisitaTecnico) => {
        const lat = Number(row.latitud)
        const lng = Number(row.longitud)
        if (isNaN(lat) || isNaN(lng)) {
            alert('Coordenadas inválidas')
            return
        }
        setSelectedCoords({ lat, lng })
        setVisibleMapa(true)
    }
    const abrirFormulario = (visita: VisitaTecnico) => {
        setSelectedVisita(visita)
        setVisibleForm(true)
    }
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const data = await obtenerVisitasPorTecnico(tecnicoId)
                setVisitas(data)
            } catch (e: any) {
                setError('Error al cargar visitas')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [tecnicoId])

    const ordenarPorCercania = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está disponible en este navegador.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                const ordenadas = [...visitas].sort((a, b) => {
                    const distA = calcularDistancia(latitude, longitude, Number(a.latitud), Number(a.longitud))
                    const distB = calcularDistancia(latitude, longitude, Number(b.latitud), Number(b.longitud))
                    return distA - distB
                })
                setVisitas(ordenadas)
                alert('✅ Lista actualizada según tu ubicación actual.')
            },
            (err) => {
                console.error('Error al obtener ubicación:', err)
                alert('No se pudo obtener tu ubicación.')
            },
            { enableHighAccuracy: true }
        )
    }

    const columns = [
        { field: 'id_visita', header: 'ID' },
        {
            field: 'nombreTecnicoCompleto',
            header: 'Técnico',
            body: (row: VisitaTecnico) => `${row.nombre_tecnico} ${row.apellido_tecnico}`,
        },
        { field: 'nombre_cliente', header: 'Cliente' },
        {
            field: 'fecha_programada',
            header: 'Fecha',
            body: (row: VisitaTecnico) =>
                row.fecha_programada.includes('T')
                    ? row.fecha_programada.split('T')[0]
                    : row.fecha_programada,
        },
        { field: 'hora_programada', header: 'Hora' },
        {
            field: 'estado_visita',
            header: 'Estado',
            body: (row: VisitaTecnico) => {
                const e = row.estado_visita
                const icon =
                    e === 'Pendiente'
                        ? '🕒'
                        : e === 'En Progreso'
                            ? '🚧'
                            : e === 'Completada'
                                ? '✅'
                                : '❌'
                return `${icon} ${e}`
            },
        },
        {
            field: 'mapa',
            header: 'Ubicación',
            body: (row: VisitaTecnico) => (
                <button
                    type="button"
                    className="p-button p-component p-button-sm"
                    onClick={() => abrirMapa(row)}
                    title="Ver ubicación"
                >
                    <i className="pi pi-map-marker" />
                    <span className="ml-2">Ver</span>
                </button>
            ),
        },
        { field: 'observaciones', header: 'Observaciones' },
        { field: 'direccion', header: 'Dirección' },
        { field: 'telefono', header: 'Teléfono' },
        // PASO 4: Añadir una nueva columna para abrir el formulario
        {
            field: 'detalleVisita',
            header: 'Detalle',
            body: (row: VisitaTecnico) => (
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success"
                    onClick={() => abrirFormulario(row)}
                    title="Ver/Editar Detalles"
                />
            )
        }
    ]
    return (
        <div className="surface-ground min-h-screen p-4">
            <h2 className="text-xl font-bold mb-4">Mis Visitas</h2>

            <Accordion
                activeIndex={activeIndex}
                onTabChange={(e) => {
                    setActiveIndex(e.index)
                    if (e.index === 1) {
                        setTimeout(() => setMapRefresh((v) => v + 1), 100)
                    }
                }}
            >
                <AccordionTab header="Lista de Visitas">
                    <div className="mb-4 flex gap-2">
                        <Button
                            label="Recargar"
                            icon="pi pi-refresh"
                            onClick={() => window.location.reload()}
                            disabled={loading}
                        />
                        {/* 🧩 Nuevo botón para ordenar por cercanía */}
                        <Button
                            label="Actualizar Cercanas"
                            icon="pi pi-map-marker"
                            onClick={ordenarPorCercania}
                            disabled={loading || visitas.length === 0}
                        />
                    </div>

                    {error && <p className="text-red-500 mb-2">{error}</p>}

                    {loading ? (
                        <p>Cargando visitas...</p>
                    ) : visitas.length === 0 ? (
                        <p>No hay visitas asignadas.</p>
                    ) : (
                        <Tablas data={visitas} columns={columns} rows={5} />
                    )}

                    <Dialog
                        header="Ubicación de la visita"
                        visible={visibleMapa}
                        onHide={() => setVisibleMapa(false)}
                        style={{ width: '40rem' }}
                        modal
                    >
                        {selectedCoords && (
                            <div className="flex flex-column gap-3">
                                <div>
                                    <strong>Lat:</strong> {selectedCoords.lat} | <strong>Lng:</strong> {selectedCoords.lng}
                                </div>
                                <ClienteListaMap lat={selectedCoords.lat} lng={selectedCoords.lng} zoom={15} height="350px" />
                            </div>
                        )}
                    </Dialog>
                    <Dialog
                        header="Detalle de la Visita"
                        visible={visibleForm}
                        onHide={() => setVisibleForm(false)}
                        style={{ width: '40rem' }}
                        modal
                        breakpoints={{'960px': '75vw', '640px': '90vw'}}
                    >
                        {/* Renderizamos el form solo si hay una visita seleccionada */}
                        <DetalleVisitasForm visita={selectedVisita as unknown as VisitaParaForm} />
                    </Dialog>
                </AccordionTab>

                <AccordionTab header="Mi Ubicación">
                    <TecnicoUbicacion
                        visitas={visitas.map((v) => ({
                            id: v.id,
                            latitud: Number(v.latitud),
                            longitud: Number(v.longitud),
                            estado_visita: v.estado_visita,
                        }))}
                        refreshKey={mapRefresh}
                    />
                </AccordionTab>

            </Accordion>
        </div>
    )
}

export default VisitasTecnico
