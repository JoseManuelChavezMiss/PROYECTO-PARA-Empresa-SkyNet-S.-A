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


export { listarClientes, crearCliente };