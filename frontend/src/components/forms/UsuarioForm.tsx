import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { crearUsuario, type ApiUsuario } from "../../services/UsuariosService";
import { useToast } from "../../hooks/useToast";
import { Toast } from "primereact/toast";

type Props = {
  onSuccess?: (mensaje?: string, usuario?: ApiUsuario) => void;
};

export default function UsuarioForm({ onSuccess }: Props) {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "" });
  const [rolId, setRolId] = useState<number | null>(null);
  const { showToast,toast } = useToast();


  const roles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Supervisor" },
    { id: 3, name: "Tecnico" },
  ];

  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolId) {
      showToast({ severity: 'warn', summary: 'Seleccione un rol' });
      return;
    }
    try {
      const { usuario, mensaje } = await crearUsuario({ ...form, rol_id: Number(rolId) });
      console.log("Usuario creado:", usuario);
      showToast({ severity: 'success', summary: mensaje || 'Usuario creado' });
      onSuccess?.(mensaje, usuario);
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.mensaje || 'Error al crear usuario';
      showToast({ severity: 'error', summary: msg });
    }
  };

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

      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          className="p-inputtext"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>

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

      <button type="submit" className="p-button p-component">Guardar</button>
    </form>
  );
}

