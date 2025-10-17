import axiosClient from "./axiosCliente";
export interface ApiUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean | 'true' | 'false' | 1 | 0 | '1' | '0';
  rolId: number;
  createdAt: string;
  updatedAt: string;
  rolNombre: string | null;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean;
  rolId: number;
  createdAt: Date;
  updatedAt: Date;
  rolNombre: string | null;
}

export type CrearUsuarioInput = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol_id: number;
};

export type ActualizarUsuarioInput = {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol_id?: number;
};

const listarUsuarios = async (): Promise<Usuario[]> => {
  const response = await axiosClient.get<ApiUsuario[]>('/api/usuariosLista');
  return response.data.map(usuario => ({
    ...usuario,
    estado: usuario.estado === true || usuario.estado === 'true' || usuario.estado === 1 || usuario.estado === '1',
    createdAt: new Date(usuario.createdAt),
    updatedAt: new Date(usuario.updatedAt),
  }));
};

const crearUsuario = async (
  input: CrearUsuarioInput
): Promise<{ usuario: ApiUsuario; mensaje?: string }> => {
  const { data } = await axiosClient.post<{ mensaje?: string; usuario?: ApiUsuario }>(
    '/api/registrarUsuario',
    input
  )
  if (!data?.usuario) throw new Error(data?.mensaje || 'No se pudo crear el usuario')
  return { usuario: data.usuario, mensaje: data.mensaje }
}


const actualizarUsuario = async (
  id: number,
  input: ActualizarUsuarioInput
): Promise<{ usuario: ApiUsuario; mensaje?: string }> => {
  const { data } = await axiosClient.put<{ mensaje?: string; user?: ApiUsuario }>(
    `/api/actualizarUsuario/${id}`,
    input
  )
  if (!data?.user) throw new Error(data?.mensaje || 'No se pudo actualizar el usuario')
  return { usuario: data.user, mensaje: data.mensaje }
}

const obtenerUsuario = async (id: number): Promise<Usuario> => {
  const response = await axiosClient.get<any>(`/api/usuariosObtener/${id}`);
  const usuarioData = response.data.user;

  if (!usuarioData) {
    throw new Error('No se encontraron datos del usuario en la respuesta');
  }

  const parseDate = (dateString: string | number | Date): Date => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  return {
    id: usuarioData.id,
    nombre: usuarioData.nombre,
    apellido: usuarioData.apellido,
    email: usuarioData.email,
    estado: usuarioData.estado === true || usuarioData.estado === 'true',
    rolId: usuarioData.rol_id,
    rolNombre: usuarioData.rolNombre,
    createdAt: parseDate(usuarioData.createdAt),
    updatedAt: parseDate(usuarioData.updatedAt),
  };
};

// En UsuariosService.ts

export const actualizarEstadoUsuario = async (id: number, estado: boolean): Promise<{ mensaje: string; data: ApiUsuario }> => {
  const { data } = await axiosClient.put<{ mensaje: string; data: ApiUsuario }>(
    `/api/eliminarUsuario/${id}/estado`,
    { estado }
  );

  return data;
};

export { listarUsuarios, crearUsuario, actualizarUsuario, obtenerUsuario };