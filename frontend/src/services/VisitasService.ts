import axiosClient from "./axiosCliente"

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

interface RespVisitas {
  mensaje?: string
  data: VisitaDetallada[]
}

export interface EntidadListado {
  id: number
  nombre_completo: string
  rol: 'Supervisor' | 'Tecnico' | 'Cliente'
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

export const listarSupervisores = () => listarEntidades(1)
export const listarTecnicos = () => listarEntidades(2)
export const listarClientesVisitas = () => listarEntidades(3)

