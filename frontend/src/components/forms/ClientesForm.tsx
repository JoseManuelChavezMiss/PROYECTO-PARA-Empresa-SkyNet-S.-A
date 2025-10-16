import { useState, useRef } from "react";
import ClientesCrearMap from "../maps/ClientesCrearMap";
import { crearCliente } from "../../services/ClientesService";
import { Toast } from "primereact/toast";
import { useToast } from "../../hooks/useToast";

// Definimos las props para que incluya onClienteCreado
interface ClientesFormProps {
  onClienteCreado?: () => void;
}

const ClientesForm = ({ onClienteCreado }: ClientesFormProps) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast, toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const input = {
      nombre: (formData.get("nombre") as string) || "",
      apellido: (formData.get("apellido") as string) || "",
      email: (formData.get("email") as string) || "",
      telefono: (formData.get("telefono") as string) || "",
      direccion: (formData.get("direccion") as string) || "",
      latitud: Number(formData.get("lat") ?? coords?.lat ?? NaN),
      longitud: Number(formData.get("lng") ?? coords?.lng ?? NaN),
    };

    if (!input.nombre || !input.apellido || !input.email || !input.telefono || !input.direccion) {
      showToast({ severity: "warn", summary: "Campos requeridos", detail: "Completa todos los campos.", life: 4000 });
      return;
    }
    if (!isFinite(input.latitud) || !isFinite(input.longitud)) {
      showToast({ severity: "warn", summary: "Ubicación requerida", detail: "Selecciona una ubicación en el mapa.", life: 4000 });
      return;
    }

    try {
      setLoading(true);
      const { cliente, mensaje } = await crearCliente(input);
      console.log("Creado:", cliente);
      showToast({ severity: "info", summary: "Cliente creado", detail: mensaje ?? "Cliente creado correctamente", life: 4000 });
      
      // Limpiar el formulario
      if (formRef.current) {
        formRef.current.reset();
      }
      setCoords(null);

      // Llamar al callback para notificar al componente padre
      if (onClienteCreado) {
        onClienteCreado();
      }
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      // Mostrar un toast de error si es necesario
      showToast({ severity: "error", summary: "Error al crear cliente", detail: err.message, life: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <form className="p-fluid" onSubmit={handleSubmit} ref={formRef}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" className="p-inputtext" placeholder="Nombre" />
        </div>

        <div className="field">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" name="apellido" className="p-inputtext" placeholder="Apellido" />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" className="p-inputtext" placeholder="email@dominio.com" />
        </div>

        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" name="telefono" className="p-inputtext" placeholder="+502 1234 5678" />
        </div>

        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <input id="direccion" name="direccion" className="p-inputtext" placeholder="Dirección" />
        </div>

        <div className="field">
          <label>Ubicación Cliente</label>
          <ClientesCrearMap
            initialLngLat={[-89.8225, 16.8086]}
            onCoordinatesChange={(c) => setCoords(c)}
          />
          <input type="hidden" name="lat" value={coords?.lat ?? ""} />
          <input type="hidden" name="lng" value={coords?.lng ?? ""} />
        </div>

        <button type="submit" className="p-button p-component" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </>
  );
};

export default ClientesForm;