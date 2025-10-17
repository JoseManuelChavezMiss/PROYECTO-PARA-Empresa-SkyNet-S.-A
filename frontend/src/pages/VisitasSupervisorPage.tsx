import { useEffect, useState } from 'react'
import VisitasSupervisorService, { type VisitaSupervisor } from '../services/VisitasSupervisorService'
import { Dialog } from 'primereact/dialog'
import ClienteListaMap from '../components/maps/ClienteListaMap'
import Tablas from '../components/Tablas'
import VisitasSupervisorForm from '../components/forms/VisitasSupervisorForm'

const VisitasSupervisorPage = () => {
  const [visitas, setVisitas] = useState<VisitaSupervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [mapaVisible, setMapaVisible] = useState(false)
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<VisitaSupervisor | null>(null)
  const [formVisible, setFormVisible] = useState(false)

  const supervisorId = parseInt(localStorage.getItem('idUser') || '0')

  useEffect(() => {
    cargarVisitas()
  }, [supervisorId])

  const cargarVisitas = async () => {
    try {
      setLoading(true)
      const { data } = await VisitasSupervisorService.listarVisitasPorSupervisor(supervisorId)
      setVisitas(data)
    } catch (error) {
      console.error('Error cargando visitas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir mapa en modal
  const abrirMapa = (visita: VisitaSupervisor) => {
    setVisitaSeleccionada(visita)
    setMapaVisible(true)
  }

  // Función para cerrar mapa
  const cerrarMapa = () => {
    setMapaVisible(false)
    setVisitaSeleccionada(null)
  }

  // Función cuando se crea una nueva visita
  const handleVisitaCreada = () => {
    setFormVisible(false)
    cargarVisitas() // Recargar la lista de visitas
  }

  // Columnas para la tabla
  const columns = [
    { field: 'id_visita', header: 'ID' },
    {
        field: 'nombreTecnicoCompleto',
        header: 'Técnico',
        body: (row: VisitaSupervisor) => `${row.nombre_tecnico} ${row.apellido_tecnico}`,
    },
    { 
        field: 'nombre_cliente', 
        header: 'Cliente',
        body: (row: VisitaSupervisor) => `${row.nombre_cliente} ${row.apellido_cliente}`
    },
    {
        field: 'fecha_programada',
        header: 'Fecha',
        body: (row: VisitaSupervisor) =>
            row.fecha_programada.includes('T')
                ? row.fecha_programada.split('T')[0]
                : row.fecha_programada,
    },
    { field: 'hora_programada', header: 'Hora' },
    {
        field: 'estado_visita',
        header: 'Estado',
        body: (row: VisitaSupervisor) => {
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
        body: (row: VisitaSupervisor) => (
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
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold m-0">Mis Visitas Asignadas</h2>
        <button 
          className="p-button p-component"
          onClick={() => setFormVisible(true)}
        >
          <i className="pi pi-plus mr-2"></i>
          Nueva Visita
        </button>
      </div>

      {/* Formulario en Modal */}
      <Dialog
        header="Nueva Visita - Supervisor"
        visible={formVisible}
        style={{ width: '70vw' }}
        onHide={() => setFormVisible(false)}
      >
        <VisitasSupervisorForm onVisitaCreada={handleVisitaCreada} />
      </Dialog>

      {/* Tabla de visitas */}
      <div className="card">
        {loading ? (
          <div className="flex justify-content-center align-items-center p-4">
            <i className="pi pi-spin pi-spinner mr-2"></i>
            <p>Cargando visitas...</p>
          </div>
        ) : (
          <Tablas 
            data={visitas} 
            columns={columns} 
            rows={10}
          />
        )}
      </div>

      {/* Modal del Mapa */}
      <Dialog
        header={`Ubicación - ${visitaSeleccionada?.nombre_cliente} ${visitaSeleccionada?.apellido_cliente}`}
        visible={mapaVisible}
        style={{ width: '80vw', height: '80vh' }}
        onHide={cerrarMapa}
        maximizable
      >
        {visitaSeleccionada && (
          <div className="w-full h-full">
            <div className="mb-3">
              <p><strong>Dirección:</strong> {visitaSeleccionada.direccion}</p>
              <p><strong>Teléfono:</strong> {visitaSeleccionada.telefono}</p>
              <p><strong>Coordenadas:</strong> {visitaSeleccionada.latitud}, {visitaSeleccionada.longitud}</p>
            </div>
            <ClienteListaMap
              lat={parseFloat(visitaSeleccionada.latitud)}
              lng={parseFloat(visitaSeleccionada.longitud)}
              zoom={15}
              height="60vh"
            />
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default VisitasSupervisorPage