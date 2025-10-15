// services/reportesService.ts - VERSIÓN MEJORADA
import axiosClient from "./axiosCliente"

// Interfaces para los reportes (las mismas que antes)
export interface EficienciaTecnico {
  tecnicoId: number
  nombreTecnico: string
  apellidoTecnico: string
  total_visitas: number
  visitas_completadas: number
  visitas_canceladas: number
  tasa_exito_porcentaje: number
}

export interface MetricasPeriodo {
  mes: string
  total_visitas: number
  completadas: number
  canceladas: number
  pendientes: number
}

export interface TiempoPromedioVisita {
  visitaId: number
  cliente: string
  tecnico: string
  inicio_visita: string
  fin_visita: string
  duracion: string
}

export interface ClienteActivo {
  id: number
  nombre: string
  apellido: string
  email: string
  total_visitas: number
  ultima_visita: string
}

export interface DistribucionGeografica {
  zona: string
  total_clientes: number
}

export interface MaterialUtilizado {
  materiales_utilizados: string
  veces_utilizado: number
  clientes: string
}

export interface ActividadRol {
  id: number
  rol: string
  total_usuarios: number
  usuarios_activos: number
  tokens_activos: number
  ultima_actividad: string
}

export interface SesionUsuario {
  id: number
  nombre: string
  apellido: string
  total_sesiones: number
  ultima_sesion: string
  duracion_promedio_min: number
}

export interface DashboardActual {
  visitas: Array<{
    periodo: string
    total: number
    completadas: number
    en_progreso: number
    pendientes: number
  }>
  tecnicos_activos: number
  fecha_consulta: string
}

export interface TendenciaMensual {
  mes: string
  total_visitas: number
  tasa_completacion: number
  tecnicos_activos: number
  clientes_visitados: number
}

export interface CancelacionAnalisis {
  cliente: string
  tecnico: string
  fecha_programada: string
  razon_cancelacion: string
  fecha_cancelacion: string
}

export interface ProductividadHora {
  hora_dia: number
  visitas_programadas: number
  completadas: number
  eficiencia_por_hora: number
}

export interface ReporteGeneralFiltros {
  fechaInicio?: string
  fechaFin?: string
  tecnicoId?: number
  estado?: string
}

export interface VisitaReporteGeneral {
  id: number
  fecha_programada: string
  hora_programada: string
  estado_visita: string
  cliente_nombre: string
  tecnico_nombre: string
  supervisor_nombre: string
  observaciones: string
}

// Payloads para los reportes con filtros
export interface MetricasPeriodoPayload {
  año?: number
}

export interface TendenciasMensualesPayload {
  meses?: number
}

export interface AnalisisCancelacionesPayload {
  fechaInicio?: string
  fechaFin?: string
}

// Función auxiliar para logging y manejo de errores
const handleApiCall = async (endpoint: string, payload?: any) => {
  console.log(`🔄 Llamando a: ${endpoint}`, payload ? `con payload: ${JSON.stringify(payload)}` : '');
  
  try {
    const { data } = await axiosClient.post(endpoint, payload || {});
    console.log(`✅ Respuesta de ${endpoint}:`, data);
    return {
      ok: true,
      data: data.data,
      mensaje: data.mensaje
    };
  } catch (error: any) {
    console.error(`❌ Error en ${endpoint}:`, error);
    const errorMessage = error?.response?.data?.mensaje 
      ?? error?.response?.data?.message 
      ?? error?.message 
      ?? `Error al llamar a ${endpoint}`;
    
    return {
      ok: false,
      data: null,
      mensaje: errorMessage
    };
  }
};

// Funciones para consumir los reportes - VERSIÓN MEJORADA

/**
 * 1. Reporte de Eficiencia de Técnicos
 */
export const obtenerEficienciaTecnicos = async (): Promise<{ 
  ok: boolean; 
  data: EficienciaTecnico[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/eficiencia-tecnicos');
}

/**
 * 2. Métricas de Visitas por Período
 */
export const obtenerMetricasPeriodo = async (
  filtros?: MetricasPeriodoPayload
): Promise<{ 
  ok: boolean; 
  data: MetricasPeriodo[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/metricas-periodo', filtros);
}

/**
 * 3. Tiempo Promedio por Visita
 */
export const obtenerTiempoPromedioVisita = async (): Promise<{ 
  ok: boolean; 
  data: TiempoPromedioVisita[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/tiempo-promedio');
}

/**
 * 4. Clientes Más Activos
 */
export const obtenerClientesActivos = async (): Promise<{ 
  ok: boolean; 
  data: ClienteActivo[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/clientes-activos');
}

/**
 * 5. Distribución Geográfica de Clientes
 */
export const obtenerDistribucionGeografica = async (): Promise<{ 
  ok: boolean; 
  data: DistribucionGeografica[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/distribucion-geografica');
}

/**
 * 6. Materiales Más Utilizados
 */
export const obtenerMaterialesUtilizados = async (): Promise<{ 
  ok: boolean; 
  data: MaterialUtilizado[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/materiales-utilizados');
}

/**
 * 7. Actividad de Usuarios por Rol
 */
export const obtenerActividadRoles = async (): Promise<{ 
  ok: boolean; 
  data: ActividadRol[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/actividad-roles');
}

/**
 * 8. Sesiones y Uso de la Aplicación
 */
export const obtenerSesionesUsuarios = async (): Promise<{ 
  ok: boolean; 
  data: SesionUsuario[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/sesiones-usuarios');
}

/**
 * 9. Dashboard de Estado Actual
 */
export const obtenerDashboardActual = async (): Promise<{ 
  ok: boolean; 
  data: DashboardActual | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/dashboard-actual');
}

/**
 * 10. Tendencias Mensuales
 */
export const obtenerTendenciasMensuales = async (
  filtros?: TendenciasMensualesPayload
): Promise<{ 
  ok: boolean; 
  data: TendenciaMensual[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/tendencias-mensuales', filtros);
}

/**
 * 11. Análisis de Cancelaciones
 */
export const obtenerAnalisisCancelaciones = async (
  filtros?: AnalisisCancelacionesPayload
): Promise<{ 
  ok: boolean; 
  data: CancelacionAnalisis[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/analisis-cancelaciones', filtros);
}

/**
 * 12. Productividad por Hora del Día
 */
export const obtenerProductividadPorHora = async (): Promise<{ 
  ok: boolean; 
  data: ProductividadHora[] | null;
  mensaje: string 
}> => {
  return await handleApiCall('/api/reportes/productividad-hora');
}

/**
 * 13. Reporte General con Filtros
 */
export const obtenerReporteGeneral = async (
  filtros: ReporteGeneralFiltros
): Promise<{ 
  ok: boolean; 
  data: VisitaReporteGeneral[] | null;
  mensaje: string 
}> => {
  // Validar fechas si se proporcionan
  if (filtros.fechaInicio && isNaN(Date.parse(filtros.fechaInicio))) {
    return {
      ok: false,
      data: null,
      mensaje: 'Fecha de inicio no válida'
    }
  }
  
  if (filtros.fechaFin && isNaN(Date.parse(filtros.fechaFin))) {
    return {
      ok: false,
      data: null,
      mensaje: 'Fecha de fin no válida'
    }
  }

  return await handleApiCall('/api/reportes/reporte-general', filtros);
}