import { useEffect, useState } from 'react'
import { listarClientes, type Cliente } from '../services/ClientesService';
import ClientesForm from '../components/forms/ClientesForm';
import Tablas from '../components/Tablas';
import ClienteListaMap from '../components/maps/ClienteListaMap';
import { Dialog } from 'primereact/dialog';

const ClientesPage = () => {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [visible1, setVisible1] = useState(false);

  useEffect(() => {
    // evita ejecutar en el primer render
    console.log('visible1 cambió:', visible1);
    if (visible1 === false) {
      setLoading(true);
      listarClientes()
        .then(setClientes)
        .catch((err) => console.error("Error al cargar clientes:", err))
        .finally(() => setLoading(false));
    }
  }, [visible1]);

  const abrirMapa = (row: Cliente) => {
    console.log('Coordenadas del cliente:', row.latitud, row.longitud)

    const lat = Number(row.latitud)
    const lng = Number(row.longitud)
    if (isNaN(lat) || isNaN(lng)) {
      alert('Coordenadas inválidas')
      return
    }
    setSelectedCoords({ lat, lng })
    setVisible(true)
  }



  const columns = [
    { field: "id", header: "ID" },
    { field: "nombre", header: "Nombre" },
    { field: "apellido", header: "Apellido" },
    { field: "email", header: "Email" },
    { field: "telefono", header: "Telefono" },
    { field: "direccion", header: "Direccion" },
    {
      field: "mapa",
      header: "Mapa",
      body: (row: Cliente) => (
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
    {
      field: "estado",
      header: "Estado",
      body: (row: Cliente) => (row.estado ? "Activo ✅" : "Inactivo ❌")
    },
    {
      field: "createdAt",
      header: "Creado",
      body: (row: Cliente) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      field: "updatedAt",
      header: "Actualizado",
      body: (row: Cliente) => new Date(row.updatedAt).toLocaleDateString()
    }
  ]


  return (



    <div className="surface-ground min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Clientes</h2>

      <div className="mb-4">
        <button className="p-button p-component" onClick={() => setVisible1(true)}>
          <i className="pi pi-plus"></i>
          <span>Nuevo Cliente</span>
        </button>
      </div>
      <Dialog
        header="Nuevo Cliente"
        visible={visible1}
        modal
        style={{ width: '60vw' }}
        onHide={() => setVisible1(false)}>
        <ClientesForm />
      </Dialog>

      <div>
        {loading ? (<p>Cargando clientes...</p>) : (
          <Tablas data={clientes} columns={columns} rows={5} />
        )}
      </div>
      <Dialog
        header="Ubicación del cliente"
        visible={visible}
        modal
        style={{ width: '60vw' }}
        onHide={() => setVisible(false)}
      >
        {selectedCoords ? (
          <ClienteListaMap
            lat={selectedCoords.lat}
            lng={selectedCoords.lng}
            zoom={14}
            height="60vh"
          />
        ) : (
          <p>Sin coordenadas</p>
        )}
      </Dialog>
    </div>
  )
}

export default ClientesPage
