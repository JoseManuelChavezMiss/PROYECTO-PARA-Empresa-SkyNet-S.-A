import axiosClient from "./axiosCliente"

export type EstadoVisita = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'

export interface VisitaDetallada {
  idVisita: number
  fechaProgramada: string
  horaProgramada: string
  estadoVisita: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'
  nombreCliente: string
  apellidoCliente: string
  telefonoCliente: string
  direccionCliente: string
  latitudCliente?: string
  longitudCliente?: string
  nombreSupervisor?: string
  nombreTecnico?: string
}

export interface CrearVisitaPayload {
  clienteId: number
  supervisorId: number
  tecnicoId: number
  fechaProgramada: string
  horaProgramada: string
  estadoVisita: EstadoVisita
  observaciones?: string
}

interface RespVisitas {
  mensaje?: string
  data: VisitaDetallada[]
}

export interface EntidadListado {
  id: number
  nombre_completo: string
  rol: 'Supervisor' | 'Tecnico' | 'Cliente'
}

export interface VisitaTecnico {
  id: number
  nombre_tecnico: string
  apellido_tecnico: string
  nombre_cliente: string
  latitud: string
  longitud: string
  fecha_programada: string
  hora_programada: string
  estado_visita: string
}



export const obtenerVisitasDetalladas = async (): Promise<VisitaDetallada[]> => {
  try {
    const { data } = await axiosClient.get<RespVisitas>('/api/visitasLista')
    console.log(data.data)
    return data.data
  } catch (e) {
    throw new Error('No se pudo conectar al servicio de visitas.')
  }
}

async function listarEntidades(opcion: 1 | 2 | 3): Promise<EntidadListado[]> {
  const { data } = await axiosClient.get<{ data: EntidadListado[] }>(`/api/visitasEntidades/${opcion}`)
  return data.data
}

export const crearVisita = async (
  input: CrearVisitaPayload
): Promise<{ ok: boolean; mensaje: string }> => {
  try {
    const { data } = await axiosClient.post('/api/crearVisita', input)
    return {
      ok: true,
      mensaje: data?.mensaje ?? 'Visita creada',
    }
  } catch (error: any) {
    return {
      ok: false,
      mensaje: error?.response?.data?.mensaje ?? error?.message ?? 'Error al crear visita',
    }
  }
}

export async function obtenerVisitasPorTecnico(tecnicoId: number): Promise<VisitaTecnico[]> {
  const { data } = await axiosClient.get<{ ok: boolean; total: number; data: VisitaTecnico[] }>(
    `/api/visitasTecnico/${tecnicoId}`
  )
  return data.data
}

export const listarSupervisores = () => listarEntidades(1)
export const listarTecnicos = () => listarEntidades(2)
export const listarClientesVisitas = () => listarEntidades(3)

