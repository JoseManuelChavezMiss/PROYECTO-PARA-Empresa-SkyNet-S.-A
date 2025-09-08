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

const listarUsuarios = async (): Promise<Usuario[]> => {
    const response = await axiosClient.get<ApiUsuario[]>('/api/usuariosLista');
    return response.data.map(usuario => ({
        ...usuario,
        estado: usuario.estado === true || usuario.estado === 'true',
        createdAt: new Date(usuario.createdAt),
        updatedAt: new Date(usuario.updatedAt),
    }));
};
export { listarUsuarios };