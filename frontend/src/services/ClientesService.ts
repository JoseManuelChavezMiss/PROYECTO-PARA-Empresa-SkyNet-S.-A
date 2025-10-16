import axiosClient from "./axiosCliente";

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  latitud: string;
  longitud: string;
  estado: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListaClientesResponse {
  mensaje: string;
  data: Cliente[];
}

export type CrearClienteInput = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  latitud: number;
  longitud: number;
};

const listarClientes = async (): Promise<Cliente[]> => {
  const { data } = await axiosClient.get<ListaClientesResponse>('/api/clientesLista');
  return data.data;
};

const crearCliente = async (
  input: CrearClienteInput
): Promise<{ ok: boolean; mensaje: string; cliente?: Cliente }> => {
  try {
    const { data } = await axiosClient.post('/api/registrarCliente', input);
    return {
      ok: true,
      mensaje: data?.mensaje ?? 'Cliente creado',
      cliente: data?.cliente,
    };
  } catch (error: any) {
    return {
      ok: false,
      mensaje: error?.response?.data?.mensaje ?? error?.message ?? 'Error al crear cliente',
    };
  }
};


// En services/ClientesService.ts
export const obtenerCliente = async (id: number): Promise<Cliente> => {
  try {
    const response = await axiosClient.get(`api/obtenerCliente/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error al obtener el cliente:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al obtener el cliente');
  }
};

export const actualizarCliente = async (id: number, datos: any) => {
  try {
    const response = await axiosClient.put(`api/actualizarCliente/${id}`, datos);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al actualizar el cliente');
  }
};

// services/ClientesService.ts
export const actualizarEstadoCliente = async (id: number) => {
  try {
    const response = await axiosClient.put(`/api/eliminarCliente/${id}/estado`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.mensaje || 'Error al cambiar el estado del cliente');
  }
};

export { listarClientes, crearCliente };