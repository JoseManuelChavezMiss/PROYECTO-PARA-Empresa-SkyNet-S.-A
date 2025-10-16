import { useState, useEffect } from "react";
import ClientesCrearMap from "../maps/ClientesCrearMap";
import { actualizarCliente, obtenerCliente } from "../../services/ClientesService";
import { useToast } from "../../hooks/useToast";
import { Toast } from "primereact/toast";

interface ActualizarClienteFormProps {
  clienteId: number;
  onClienteActualizado: () => void;
}

const ActualizarClienteForm = ({ clienteId, onClienteActualizado }: ActualizarClienteFormProps) => {
  const [form, setForm] = useState({ 
    nombre: "", 
    apellido: "", 
    email: "", 
    telefono: "", 
    direccion: "" 
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cargando, setCargando] = useState(false);
  const { showToast, toast } = useToast();

  // Cargar datos del cliente
  useEffect(() => {
    cargarCliente();
  }, [clienteId]);

  const cargarCliente = async () => {
    try {
      setCargando(true);
      const cliente = await obtenerCliente(clienteId);
      console.log("Cliente cargado:", cliente);
      
      setForm({
        nombre: cliente.nombre || "",
        apellido: cliente.apellido || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || ""
      });
      
      if (cliente.latitud && cliente.longitud) {
        setCoords({
          lat: Number(cliente.latitud),
          lng: Number(cliente.longitud)
        });
      }
    } catch (error) {
      showToast({ 
        severity: 'error', 
        summary: 'Error al cargar cliente' 
      });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coords) {
      showToast({ severity: 'warn', summary: 'Seleccione una ubicación en el mapa' });
      return;
    }

    // Validaciones
    if (!form.nombre || !form.apellido || !form.email || !form.telefono || !form.direccion) {
      showToast({ 
        severity: "warn", 
        summary: "Campos requeridos", 
        detail: "Completa todos los campos." 
      });
      return;
    }

    try {
      setCargando(true);
      
      const datosActualizacion = {
        ...form,
        latitud: coords.lat,
        longitud: coords.lng
      };

      const { cliente, mensaje } = await actualizarCliente(clienteId, datosActualizacion);
      showToast({ severity: 'success', summary: mensaje || 'Cliente actualizado' });
      onClienteActualizado();
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.mensaje || 'Error al actualizar cliente';
      showToast({ severity: 'error', summary: msg });
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (cargando && !form.nombre) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <i className="pi pi-spin pi-spinner mr-2"></i>
        <span>Cargando datos del cliente...</span>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <form className="p-fluid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            className="p-inputtext"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            name="apellido"
            className="p-inputtext"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Apellido"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="p-inputtext"
            value={form.email}
            onChange={handleChange}
            placeholder="email@dominio.com"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            name="telefono"
            className="p-inputtext"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+502 1234 5678"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            name="direccion"
            className="p-inputtext"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            required
          />
        </div>

        <div className="field">
          <label>Ubicación Cliente</label>
          <ClientesCrearMap
            initialLngLat={coords ? [coords.lng, coords.lat] : [-89.8225, 16.8086]}
            onCoordinatesChange={(c) => setCoords(c)}
          />
        </div>

        <button 
          type="submit" 
          className="p-button p-component"
          disabled={cargando}
        >
          {cargando ? 'Actualizando...' : 'Actualizar Cliente'}
        </button>
      </form>
    </>
  );
};

export default ActualizarClienteForm;