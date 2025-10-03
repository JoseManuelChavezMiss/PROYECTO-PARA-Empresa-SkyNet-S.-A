import { useEffect, useState } from 'react'
import { type VisitaDetallada, obtenerVisitasDetalladas } from '../services/VisitasService'
import { Button } from 'primereact/button';
import ModalWrapper from '../components/ModalWrapper';
import Tablas from '../components/Tablas';
import VisitasForm from '../components/forms/VisitasForm';
const VisitasPage = () => {

  const [visitas, setVisitas] = useState<VisitaDetallada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fetchVisitas = async () => {
      try {
        const data = await obtenerVisitasDetalladas()
        setVisitas(data)
      } catch (error) {
        console.error("Error al cargar visitas:", error)
      } finally {
        setCargando(false)
      }
    }
    fetchVisitas()
  }, [])

  const columns = [
    { field: "idVisita", header: "ID" },
    {
      field: "clienteNombreCompleto",            // <-- agrega field (ColumnDef lo exige)
      header: "Cliente",
      body: (row: VisitaDetallada) => `${row.nombreCliente} ${row.apellidoCliente}`,
    },
    { field: "telefonoCliente", header: "Teléfono" },
    {
      field: "fechaProgramada",
      header: "Fecha",
      body: (row: VisitaDetallada) =>
        row.fechaProgramada.includes("T")
          ? row.fechaProgramada.split("T")[0]
          : row.fechaProgramada,
    },
    { field: "horaProgramada", header: "Hora" },
    {
      field: "estadoVisita",
      header: "Estado",
      body: (row: VisitaDetallada) => {
        const e = row.estadoVisita
        const icon =
          e === "Pendiente"
            ? "🕒"
            : e === "En Progreso"
              ? "🚧"
              : e === "Completada"
                ? "✅"
                : "❌"
        return `${icon} ${e}`
      },
    },
    { field: "nombreSupervisor", header: "Supervisor" },
    { field: "nombreTecnico", header: "Técnico" },
  ]


  return (
    <div className="surface-ground min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Visitas</h2>

      <div className="mb-4 flex gap-2">
        <Button label="Nueva visita" icon="pi pi-plus" onClick={() => setVisible(true)} />
      </div>

      <ModalWrapper header="Formulario de visitas" visible={visible} onHide={() => setVisible(false)}>
        <VisitasForm />  {/* Debe ser contenido puro, sin Dialog interno */}
      </ModalWrapper>

      {cargando
        ? <p>Cargando visitas...</p>
        : <Tablas data={visitas} columns={columns} rows={5} />
      }
    </div>
  )
}

export default VisitasPage
