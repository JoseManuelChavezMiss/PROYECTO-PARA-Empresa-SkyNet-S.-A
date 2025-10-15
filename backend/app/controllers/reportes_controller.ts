import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ReportesController {

    // 1. REPORTE DE EFICIENCIA DE TÉCNICOS
    async eficienciaTecnicos({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('visitas as V')
                .innerJoin('users as T', 'T.id', 'V.tecnico_id')
                .select([
                    'T.id as tecnicoId',
                    'T.nombre as nombreTecnico',
                    'T.apellido as apellidoTecnico',
                    db.raw('COUNT(V.id) as total_visitas'),
                    db.raw('SUM(CASE WHEN V.estado_visita = "Completada" THEN 1 ELSE 0 END) as visitas_completadas'),
                    db.raw('SUM(CASE WHEN V.estado_visita = "Cancelada" THEN 1 ELSE 0 END) as visitas_canceladas'),
                    db.raw('ROUND((SUM(CASE WHEN V.estado_visita = "Completada" THEN 1 ELSE 0 END) * 100.0 / COUNT(V.id)), 2) as tasa_exito_porcentaje')
                ])
                .groupBy('T.id', 'T.nombre', 'T.apellido')
                .orderBy('tasa_exito_porcentaje', 'desc')

            return response.ok({
                mensaje: 'Reporte de eficiencia de técnicos generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar el reporte de eficiencia',
                error: error.message,
            })
        }
    }

    // 2. MÉTRICAS DE VISITAS POR PERÍODO
    async metricasVisitasPeriodo({ request, response }: HttpContext) {
        try {
            const { año } = request.all()

            let query = db
                .query()
                .from('visitas')
                .select([
                    db.raw("DATE_FORMAT(fecha_programada, '%Y-%m') as mes"),
                    db.raw('COUNT(*) as total_visitas'),
                    db.raw('SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) as completadas'),
                    db.raw('SUM(CASE WHEN estado_visita = "Cancelada" THEN 1 ELSE 0 END) as canceladas'),
                    db.raw('SUM(CASE WHEN estado_visita = "Pendiente" THEN 1 ELSE 0 END) as pendientes')
                ])
                .groupByRaw("DATE_FORMAT(fecha_programada, '%Y-%m')")
                .orderBy('mes', 'desc')

            if (año) {
                query = query.whereRaw('YEAR(fecha_programada) = ?', [año])
            }

            const reporte = await query

            return response.ok({
                mensaje: 'Métricas de visitas por período generadas exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar métricas de visitas',
                error: error.message,
            })
        }
    }

    // 3. TIEMPO PROMEDIO POR VISITA
    async tiempoPromedioVisita({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('visitas as V')
                .innerJoin('clientes as C', 'C.id', 'V.cliente_id')
                .innerJoin('users as T', 'T.id', 'V.tecnico_id')
                .innerJoin('detallevisitas as DV', 'V.id', 'DV.idvisita')
                .select([
                    'V.id as visitaId',
                    'C.nombre as cliente',
                    'T.nombre as tecnico',
                    db.raw('MIN(DV.fecha_hora) as inicio_visita'),
                    db.raw('MAX(DV.fecha_hora) as fin_visita'),
                    db.raw('TIMEDIFF(MAX(DV.fecha_hora), MIN(DV.fecha_hora)) as duracion')
                ])
                .where('V.estado_visita', 'Completada')
                .groupBy('V.id', 'C.nombre', 'T.nombre')

            return response.ok({
                mensaje: 'Reporte de tiempos de visita generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de tiempos',
                error: error.message,
            })
        }
    }

    // 4. CLIENTES MÁS ACTIVOS
    async clientesMasActivos({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('clientes as C')
                .leftJoin('visitas as V', 'C.id', 'V.cliente_id')
                .select([
                    'C.id',
                    'C.nombre',
                    'C.apellido',
                    'C.email',
                    db.raw('COUNT(V.id) as total_visitas'),
                    db.raw('MAX(V.fecha_programada) as ultima_visita')
                ])
                .where('C.estado', 1)
                .groupBy('C.id', 'C.nombre', 'C.apellido', 'C.email')
                .orderBy('total_visitas', 'desc')

            return response.ok({
                mensaje: 'Reporte de clientes activos generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de clientes',
                error: error.message,
            })
        }
    }

    // 5. DISTRIBUCIÓN GEOGRÁFICA DE CLIENTES
    async distribucionGeograficaClientes({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('clientes')
                .select([
                    db.raw(`
            CASE 
              WHEN latitud BETWEEN 0 AND 10 THEN 'Zona Norte'
              WHEN latitud BETWEEN 10 AND 20 THEN 'Zona Centro'
              WHEN latitud > 20 THEN 'Zona Sur'
              ELSE 'Sin ubicación'
            END as zona
          `),
                    db.raw('COUNT(*) as total_clientes')
                ])
                .where('estado', 1)
                .groupBy('zona')
                .orderBy('total_clientes', 'desc')

            return response.ok({
                mensaje: 'Distribución geográfica generada exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar distribución geográfica',
                error: error.message,
            })
        }
    }

    // 6. MATERIALES MÁS UTILIZADOS
    async materialesMasUtilizados({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('reportes_visitas as RV')
                .innerJoin('visitas as V', 'RV.id_visita', 'V.id')
                .innerJoin('clientes as C', 'V.cliente_id', 'C.id')
                .select([
                    'RV.materiales_utilizados',
                    db.raw('COUNT(*) as veces_utilizado'),
                    db.raw('GROUP_CONCAT(DISTINCT C.nombre SEPARATOR ", ") as clientes')
                ])
                .groupBy('RV.materiales_utilizados')
                .orderBy('veces_utilizado', 'desc')
                .limit(10)

            return response.ok({
                mensaje: 'Reporte de materiales utilizados generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de materiales',
                error: error.message,
            })
        }
    }

    // 7. ACTIVIDAD DE USUARIOS POR ROL
    async actividadUsuariosRol({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('rols as R')
                .leftJoin('users as U', 'R.id', 'U.rol_id')
                .leftJoin('auth_access_tokens as AAT', 'U.id', 'AAT.tokenable_id')
                .select([
                    'R.id',
                    'R.name as rol',
                    db.raw('COUNT(DISTINCT U.id) as total_usuarios'),
                    db.raw('COUNT(DISTINCT CASE WHEN U.estado = "true" THEN U.id END) as usuarios_activos'),
                    db.raw('COUNT(DISTINCT AAT.id) as tokens_activos'),
                    db.raw('MAX(AAT.last_used_at) as ultima_actividad')
                ])
                .groupBy('R.id', 'R.name')

            return response.ok({
                mensaje: 'Reporte de actividad por rol generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de actividad',
                error: error.message,
            })
        }
    }

    // 8. SESIONES Y USO DE LA APLICACIÓN
    async sesionesUsuarios({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('users as U')
                .innerJoin('auth_access_tokens as AAT', 'U.id', 'AAT.tokenable_id')
                .select([
                    'U.id',
                    'U.nombre',
                    'U.apellido',
                    db.raw('COUNT(AAT.id) as total_sesiones'),
                    db.raw('MAX(AAT.last_used_at) as ultima_sesion'),
                    db.raw('AVG(TIMESTAMPDIFF(MINUTE, AAT.created_at, AAT.last_used_at)) as duracion_promedio_min')
                ])
                .groupBy('U.id', 'U.nombre', 'U.apellido')
                .having('total_sesiones', '>', 0)

            return response.ok({
                mensaje: 'Reporte de sesiones generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de sesiones',
                error: error.message,
            })
        }
    }

    // 9. DASHBOARD DE ESTADO ACTUAL
    async dashboardEstadoActual({ response }: HttpContext) {
        try {
            // Visitas del día actual
            const hoy = await db
                .query()
                .from('visitas')
                .select([
                    db.raw("'Hoy' as periodo"),
                    db.raw('COUNT(*) as total'),
                    db.raw('SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) as completadas'),
                    db.raw('SUM(CASE WHEN estado_visita = "En Progreso" THEN 1 ELSE 0 END) as en_progreso'),
                    db.raw('SUM(CASE WHEN estado_visita = "Pendiente" THEN 1 ELSE 0 END) as pendientes')
                ])
                .where('fecha_programada', db.raw('CURDATE()'))

            // Visitas de la semana
            const semana = await db
                .query()
                .from('visitas')
                .select([
                    db.raw("'Esta Semana' as periodo"),
                    db.raw('COUNT(*) as total'),
                    db.raw('SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) as completadas'),
                    db.raw('SUM(CASE WHEN estado_visita = "En Progreso" THEN 1 ELSE 0 END) as en_progreso'),
                    db.raw('SUM(CASE WHEN estado_visita = "Pendiente" THEN 1 ELSE 0 END) as pendientes')
                ])
                .whereRaw('YEARWEEK(fecha_programada) = YEARWEEK(CURDATE())')

            // Técnicos activos
            const tecnicosActivos = await db
                .query()
                .from('users as U')
                .innerJoin('rols as R', 'U.rol_id', 'R.id')
                .where('R.name', 'like', '%tecnico%')
                .where('U.estado', 'true')
                .count('* as total')

            const reporte = {
                visitas: [...hoy, ...semana],
                tecnicos_activos: tecnicosActivos[0].total,
                fecha_consulta: new Date().toISOString()
            }

            return response.ok({
                mensaje: 'Dashboard actual generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar dashboard',
                error: error.message,
            })
        }
    }

    // 10. TENDENCIAS MENSUALES
    async tendenciasMensuales({ request, response }: HttpContext) {
        try {
            const { meses = 6 } = request.all()

            const reporte = await db
                .query()
                .from('visitas')
                .select([
                    db.raw("DATE_FORMAT(fecha_programada, '%Y-%m') as mes"),
                    db.raw('COUNT(*) as total_visitas'),
                    db.raw('ROUND((SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as tasa_completacion'),
                    db.raw('COUNT(DISTINCT tecnico_id) as tecnicos_activos'),
                    db.raw('COUNT(DISTINCT cliente_id) as clientes_visitados')
                ])
                .where('fecha_programada', '>=', db.raw(`DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH)`))
                .groupByRaw("DATE_FORMAT(fecha_programada, '%Y-%m')")
                .orderBy('mes', 'desc')

            return response.ok({
                mensaje: 'Tendencias mensuales generadas exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar tendencias',
                error: error.message,
            })
        }
    }

    // 11. ANÁLISIS DE CANCELACIONES
    async analisisCancelaciones({ request, response }: HttpContext) {
        try {
            const { fechaInicio, fechaFin } = request.all()

            let query = db
                .query()
                .from('visitas as V')
                .innerJoin('clientes as C', 'V.cliente_id', 'C.id')
                .innerJoin('users as T', 'V.tecnico_id', 'T.id')
                .innerJoin('detallevisitas as DV', 'V.id', 'DV.idvisita')
                .select([
                    'C.nombre as cliente',
                    'T.nombre as tecnico',
                    'V.fecha_programada',
                    'DV.observaciones as razon_cancelacion',
                    'DV.created_at as fecha_cancelacion'
                ])
                .where('V.estado_visita', 'Cancelada')
                .andWhere('DV.tipo_registro', 'Cancelada')
                .orderBy('V.fecha_programada', 'desc')

            if (fechaInicio) {
                query = query.where('V.fecha_programada', '>=', fechaInicio)
            }
            if (fechaFin) {
                query = query.where('V.fecha_programada', '<=', fechaFin)
            }

            const reporte = await query

            return response.ok({
                mensaje: 'Análisis de cancelaciones generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar análisis de cancelaciones',
                error: error.message,
            })
        }
    }

    // 12. PRODUCTIVIDAD POR HORA DEL DÍA
    async productividadPorHora({ response }: HttpContext) {
        try {
            const reporte = await db
                .query()
                .from('visitas')
                .select([
                    db.raw('HOUR(hora_programada) as hora_dia'),
                    db.raw('COUNT(*) as visitas_programadas'),
                    db.raw('SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) as completadas'),
                    db.raw('ROUND((SUM(CASE WHEN estado_visita = "Completada" THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as eficiencia_por_hora')
                ])
                .groupByRaw('HOUR(hora_programada)')
                .orderBy('hora_dia', 'asc')

            return response.ok({
                mensaje: 'Reporte de productividad por hora generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte de productividad',
                error: error.message,
            })
        }
    }

    // 13. REPORTE GENERAL CON FILTROS
    async reporteGeneral({ request, response }: HttpContext) {
        try {
            const { fechaInicio, fechaFin, tecnicoId, estado } = request.all()

            let query = db
                .query()
                .from('visitas as V')
                .innerJoin('clientes as C', 'V.cliente_id', 'C.id')
                .innerJoin('users as T', 'V.tecnico_id', 'T.id')
                .leftJoin('users as S', 'V.supervisor_id', 'S.id')
                .select([
                    'V.id',
                    'V.fecha_programada',
                    'V.hora_programada',
                    'V.estado_visita',
                    'C.nombre as cliente_nombre',
                    'T.nombre as tecnico_nombre',
                    'S.nombre as supervisor_nombre',
                    'V.observaciones'
                ])

            // Aplicar filtros
            if (fechaInicio) {
                query = query.where('V.fecha_programada', '>=', fechaInicio)
            }
            if (fechaFin) {
                query = query.where('V.fecha_programada', '<=', fechaFin)
            }
            if (tecnicoId) {
                query = query.where('V.tecnico_id', tecnicoId)
            }
            if (estado) {
                query = query.where('V.estado_visita', estado)
            }

            const reporte = await query.orderBy('V.fecha_programada', 'desc')

            return response.ok({
                mensaje: 'Reporte general generado exitosamente',
                data: reporte,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al generar reporte general',
                error: error.message,
            })
        }
    }
}