import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { actualizarUsuario, obtenerUsuario, type ApiUsuario } from "../../services/UsuariosService";
import { useToast } from "../../hooks/useToast";
import { Toast } from "primereact/toast";

type Props = {
  usuarioId: number;
  onSuccess?: (mensaje?: string, usuario?: ApiUsuario) => void;
  onCancel?: () => void;
};

export default function ActualizarUsuarioForm({ usuarioId, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({ 
    nombre: "", 
    apellido: "", 
    email: "", 
    password: "" 
  });
  const [rolId, setRolId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const { showToast, toast } = useToast();

  const roles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Supervisor" },
    { id: 3, name: "Tecnico" },
  ];

  // Cargar datos del usuario
  useEffect(() => {
    cargarUsuario();
  }, [usuarioId]);

  const cargarUsuario = async () => {
    debugger
    try {
      setCargando(true);
      const usuario = await obtenerUsuario(usuarioId);
      console.log("Usuario cargado:", usuario);
      setForm({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        password: "" // No cargamos la contraseña por seguridad
      });
      setRolId(usuario.rolId || null);
    } catch (error) {
      showToast({ 
        severity: 'error', 
        summary: 'Error al cargar usuario' 
      });
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rolId) {
      showToast({ severity: 'warn', summary: 'Seleccione un rol' });
      return;
    }

    try {
      setCargando(true);
      
      // Preparar datos para enviar (si password está vacío, no lo enviamos)
      const datosActualizacion: any = {
        ...form,
        rol_id: Number(rolId)
      };
      
      if (!datosActualizacion.password) {
        delete datosActualizacion.password;
      }

      const { usuario, mensaje } = await actualizarUsuario(usuarioId, datosActualizacion);
      showToast({ severity: 'success', summary: mensaje || 'Usuario actualizado' });
      onSuccess?.(mensaje, usuario);
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.mensaje || 'Error al actualizar usuario';
      showToast({ severity: 'error', summary: msg });
    } finally {
      setCargando(false);
    }
  };

  if (cargando && !form.nombre) {
    return <div>Cargando...</div>;
  }

  return (
    <form className="p-fluid" onSubmit={onSubmit}>
      <Toast ref={toast} />
      
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          className="p-inputtext"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="apellido">Apellido</label>
        <input
          id="apellido"
          className="p-inputtext"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="p-inputtext"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      {/* <div className="field">
        <label htmlFor="password">Contraseña (dejar vacío para no cambiar)</label>
        <input
          type="password"
          id="password"
          className="p-inputtext"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Dejar vacío para mantener la contraseña actual"
        />
      </div> */}

      <div className="field">
        <label htmlFor="rol">Rol</label>
        <Dropdown
          id="rol"
          value={rolId}
          onChange={(e) => setRolId(e.value)}
          options={roles}
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccione un Rol"
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <button 
          type="submit" 
          className="p-button p-component"
          disabled={cargando}
        >
          {cargando ? 'Actualizando...' : 'Actualizar'}
        </button>
        
        {onCancel && (
          <button 
            type="button" 
            className="p-button p-component p-button-secondary"
            onClick={onCancel}
            disabled={cargando}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}