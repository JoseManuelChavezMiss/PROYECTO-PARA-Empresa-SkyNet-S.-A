import React, { useEffect, useState } from 'react'
import { obtenerVisitasPorTecnico, type VisitaTecnico } from '../services/VisitasService'
import { Button } from 'primereact/button'
import Tablas from '../components/Tablas'
import { Dialog } from 'primereact/dialog'
import ClienteListaMap from '../components/maps/ClienteListaMap'

const VisitasTecnico = () => {
    const tecnicoId = Number(localStorage.getItem('idUser')) || 0
    const [visitas, setVisitas] = useState<VisitaTecnico[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [visibleMapa, setVisibleMapa] = useState(false)
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)

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

    const columns = [
        { field: 'id', header: 'ID' },
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
    ]
    return (
        <div className="surface-ground min-h-screen p-4">
            <h2 className="text-xl font-bold mb-4">Mis Visitas</h2>

            <div className="mb-4 flex gap-2">
                <Button label="Recargar" icon="pi pi-refresh" onClick={() => window.location.reload()} disabled={loading} />
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
                        <ClienteListaMap
                            lat={selectedCoords.lat}
                            lng={selectedCoords.lng}
                            zoom={15}
                            height="350px"
                        />
                        <div className="text-right">
                            <Button label="Cerrar" onClick={() => setVisibleMapa(false)} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default VisitasTecnico
