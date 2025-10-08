import axiosClient from "./axiosCliente"

export type EstadoVisita = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'
export type EstadoDetalleVisita = 'En Progreso' | 'Completada' | 'Cancelada'
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

export interface CrearDetalleVisitaPayload {
  idVisita: number
  tipoRegistro: EstadoDetalleVisita
  fechaHora: string
  observaciones?: string | null
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

  //retonar solo las visitas que esten pendientes o en progreso
  return data.data.filter(v => v.estado_visita === 'En Progreso')
  

}

export const crearDetalleVisita = async (
  input: CrearDetalleVisitaPayload
): Promise<{ ok: boolean; mensaje: string }> => {
  try {
    // Normalizar / validar antes de enviar 
    const allowed: EstadoDetalleVisita[] = ['En Progreso', 'Completada', 'Cancelada']
    if (!allowed.includes(input.tipoRegistro)) {
      return { ok: false, mensaje: 'tipoRegistro inválido' }
    }
    if (!input.idVisita || isNaN(Number(input.idVisita))) {
      return { ok: false, mensaje: 'idVisita inválido' }
    }
    if (!input.fechaHora) {
      return { ok: false, mensaje: 'fechaHora requerida' }
    }

    // Convertir fecha a formato SQL (YYYY-MM-DD HH:mm:ss) para evitar errores al no parsear en el controlador
    const fecha = new Date(input.fechaHora)
    if (isNaN(fecha.getTime())) {
      return { ok: false, mensaje: 'fechaHora no es una fecha válida' }
    }
    const pad = (n: number) => String(n).padStart(2, '0')
    const fechaSql =
      `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())} ` +
      `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`

    const payload = {
      idvisita: Number(input.idVisita),
      tipo_registro: input.tipoRegistro.trim() as EstadoDetalleVisita,
      fecha_hora: fechaSql, 
      observaciones: input.observaciones ?? null,
    }

    console.debug('Enviando detalle visita (normalizado):', payload)

    const { data } = await axiosClient.post('/api/crearDetalleVisita', payload)
    return {
      ok: true,
      mensaje: data?.mensaje ?? 'Detalle de visita creado',
    }
  } catch (error: any) {
    console.error('Error crearDetalleVisita:', error?.response?.data || error)
    return {
      ok: false,
      mensaje:
        error?.response?.data?.mensaje ??
        error?.response?.data?.message ??
        error?.message ??
        'Error al crear detalle de visita',
    }
  }
}

export const listarSupervisores = () => listarEntidades(1)
export const listarTecnicos = () => listarEntidades(2)
export const listarClientesVisitas = () => listarEntidades(3)

