import axiosClient from "./axiosCliente";


export interface ApiUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean | 'true' | 'false'; 
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

const listarUsuarios = async (): Promise<Usuario[]> => {
    const response = await axiosClient.get<ApiUsuario[]>('/api/usuariosLista');
    return response.data.map(usuario => ({
        ...usuario,
        estado: usuario.estado === true || usuario.estado === 'true',
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
// ...existing code...


export { listarUsuarios, crearUsuario };