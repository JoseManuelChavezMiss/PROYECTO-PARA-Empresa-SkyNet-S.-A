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

const crearCliente = async (input: CrearClienteInput): Promise<{ cliente: Cliente; mensaje?: string }> => {
  const { data } = await axiosClient.post<{ mensaje?: string; cliente?: Cliente }>(
    '/api/registrarCliente',
    input
  );
  if (!data?.cliente) throw new Error(data?.mensaje || 'No se pudo crear el cliente');
  return { cliente: data.cliente, mensaje: data.mensaje };
};

export { listarClientes, crearCliente };