import { useEffect, useState } from 'react'
import { listarClientes, type Cliente, actualizarEstadoCliente } from '../services/ClientesService';
import ClientesForm from '../components/forms/ClientesForm';
import ActualizarClienteForm from '../components/forms/ActualizarClienteForm';
import Tablas from '../components/Tablas';
import ClienteListaMap from '../components/maps/ClienteListaMap';
import { Dialog } from 'primereact/dialog';
import { useToast } from '../hooks/useToast';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const { showToast, toast } = useToast();

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los clientes'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const abrirMapa = (row: Cliente) => {
    const lat = Number(row.latitud);
    const lng = Number(row.longitud);
    if (isNaN(lat) || isNaN(lng)) {
      showToast({
        severity: 'warn',
        summary: 'Coordenadas inválidas'
      });
      return;
    }
    setSelectedCoords({ lat, lng });
    setVisible(true);
  };

  const abrirEdicion = (cliente: Cliente) => {
    setClienteSeleccionado(cliente.id);
    setVisible2(true);
  };

  const handleClienteActualizado = () => {
    setVisible2(false);
    setClienteSeleccionado(null);
    cargarClientes();
  };

  const handleClienteCreado = () => {
    setVisible1(false);
    cargarClientes();
  };

  const confirmarCambioEstado = (cliente: Cliente) => {
    confirmDialog({
      message: `¿Estás seguro de que quieres ${cliente.estado ? 'desactivar' : 'activar'} al cliente ${cliente.nombre} ${cliente.apellido}?`,
      header: 'Confirmar cambio de estado',
      icon: 'pi pi-exclamation-triangle',
      accept: () => ejecutarCambioEstado(cliente),
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar'
    });
  };

  const ejecutarCambioEstado = async (cliente: Cliente) => {
    try {
      const response = await actualizarEstadoCliente(cliente.id);
      
      // Actualizar el estado localmente
      setClientes(prevClientes => 
        prevClientes.map(c => {
          if (c.id === cliente.id) {
            return {
              ...c,
              estado: response.data.estado
            } as Cliente;
          }
          return c;
        })
      );
      
      showToast({ 
        severity: 'success', 
        summary: response.mensaje || 'Estado actualizado correctamente',
        life: 3000
      });
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      showToast({ 
        severity: 'error', 
        summary: 'Error',
        detail: err.message || 'Error al cambiar el estado del cliente',
        life: 4000
      });
    }
  };

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
        <Button
          icon="pi pi-map-marker"
          className="p-button-rounded p-button-info p-button-text"
          onClick={() => abrirMapa(row)}
          tooltip="Ver ubicación"
          tooltipOptions={{ position: 'top' }}
        />
      ),
    },
    {
      field: "estado",
      header: "Estado",
      body: (row: Cliente) => (
        <span className={`p-tag ${row.estado ? 'p-tag-success' : 'p-tag-danger'}`}>
          {row.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      body: (row: Cliente) => (
        <div className="flex gap-1">
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success p-button-text"
            onClick={() => abrirEdicion(row)}
            tooltip="Editar cliente"
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            icon={row.estado ? "pi pi-ban" : "pi pi-check"}
            className={`p-button-rounded p-button-text ${
              row.estado ? 'p-button-warning' : 'p-button-info'
            }`}
            onClick={() => confirmarCambioEstado(row)}
            tooltip={row.estado ? "Desactivar cliente" : "Activar cliente"}
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      )
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
  ];

  return (
    <div className="surface-ground min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Clientes</h2>

      {/* Confirm Dialog para cambios de estado */}
      <ConfirmDialog />

      <Toast ref={toast} position="top-right" />

      <div className="mb-4">
        <Button 
          icon="pi pi-plus"
          className="p-button"
          onClick={() => setVisible1(true)}
          label="Nuevo Cliente"
        />
      </div>

      {/* Diálogo para Nuevo Cliente */}
      <Dialog
        header="Nuevo Cliente"
        visible={visible1}
        modal
        style={{ width: '60vw' }}
        onHide={() => setVisible1(false)}
      >
        <ClientesForm onClienteCreado={handleClienteCreado} />
      </Dialog>

      {/* Diálogo para Actualizar Cliente */}
      <Dialog
        header="Actualizar Cliente"
        visible={visible2}
        modal
        style={{ width: '60vw' }}
        onHide={() => {
          setVisible2(false);
          setClienteSeleccionado(null);
        }}
      >
        {clienteSeleccionado && (
          <ActualizarClienteForm 
            clienteId={clienteSeleccionado}
            onClienteActualizado={handleClienteActualizado}
          />
        )}
      </Dialog>

      {/* Tabla de clientes */}
      <div>
        {loading ? (
          <div className="flex justify-content-center align-items-center p-4">
            <i className="pi pi-spin pi-spinner mr-2"></i>
            <p>Cargando clientes...</p>
          </div>
        ) : (
          <Tablas data={clientes} columns={columns} rows={5} />
        )}
      </div>

      {/* Diálogo para Mapa */}
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
  );
};

export default ClientesPage;