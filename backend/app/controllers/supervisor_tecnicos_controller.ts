// import type { HttpContext } from '@adonisjs/core/http'
import SupervisorTecnico from "#models/supervisortecnico"
import User from "#models/user"
import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class SupervisorTecnicosController {

    public async asignarTecnicoSupervisor({ request, response }: HttpContext) {
        const { supervisor_id, tecnico_id } = request.only(['supervisor_id', 'tecnico_id'])

        // Validar que el supervisor y el técnico existan
        const [supervisor, tecnico] = await Promise.all([
            User.find(supervisor_id),
            User.find(tecnico_id),
        ])

        if (!supervisor) {
            return response.status(422).json({ mensaje: 'Supervisor no existe' })
        }
        if (!tecnico) {
            return response.status(422).json({ mensaje: 'Técnico no existe' })
        }

        // Validar que el técnico no tenga ya un supervisor asignado
        const existingRelation = await SupervisorTecnico.query()
            .where('tecnico_id', tecnico_id)
            .first()

        if (existingRelation) {
            return response.status(422).json({ mensaje: 'El técnico ya tiene un supervisor asignado' })
        }

        try {
            const relacion = await SupervisorTecnico.create({
                supervisorId: supervisor_id,
                tecnicoId: tecnico_id,
            })

            return response.status(201).json({
                mensaje: 'Relación creada exitosamente',
                data: relacion,
            })
        } catch (error: any) {
            return response.status(400).json({
                mensaje: 'Error al crear la relación',
                error: error.message,
            })
        }
    }

    // Método para listar relaciones supervisor-técnico agrupadas
    async listarTecnicosSupervisores({ response }: HttpContext) {
        try {
            const relaciones = await db
                .query()
                .from('supervisor_tecnicos as ST')
                .innerJoin('users as S', 'S.id', 'ST.supervisor_id')
                .innerJoin('users as T', 'T.id', 'ST.tecnico_id')
                .innerJoin('rols as RS', 'RS.id', 'S.rol_id')
                .innerJoin('rols as RT', 'RT.id', 'T.rol_id')
                .select([
                    'ST.id as asignacion_id', // ← AÑADIR ESTA LÍNEA
                    'S.id as supervisor_id',
                    db.raw("CONCAT(S.nombre, ' ', S.apellido) AS supervisor_nombre"),
                    'RS.name as supervisor_rol',
                    'T.id as tecnico_id',
                    db.raw("CONCAT(T.nombre, ' ', T.apellido) AS tecnico_nombre"),
                    'RT.name as tecnico_rol',
                    'ST.created_at as fecha_asignacion'
                ])
                .orderBy('S.id', 'asc')
                .orderBy('T.id', 'asc')

            // Agrupar los resultados por supervisor
            const agrupado = relaciones.reduce((acc, relacion) => {
                const supervisorId = relacion.supervisor_id

                // Buscar si ya existe el supervisor en el acumulador
                let supervisor = acc.find((s: { supervisor_id: any }) => s.supervisor_id === supervisorId)

                if (!supervisor) {
                    // Si no existe, crear nuevo supervisor
                    supervisor = {
                        supervisor_id: relacion.supervisor_id,
                        supervisor_nombre: relacion.supervisor_nombre,
                        supervisor_rol: relacion.supervisor_rol,
                        tecnicos: []
                    }
                    acc.push(supervisor)
                }

                // Agregar técnico al supervisor
                supervisor.tecnicos.push({
                    asignacion_id: relacion.asignacion_id, // ← AÑADIR ESTA LÍNEA
                    tecnico_id: relacion.tecnico_id,
                    tecnico_nombre: relacion.tecnico_nombre,
                    tecnico_rol: relacion.tecnico_rol,
                    fecha_asignacion: relacion.fecha_asignacion
                })

                return acc
            }, [])

            return response.ok({
                mensaje: 'Relaciones supervisor-técnico agrupadas',
                data: agrupado,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al listar relaciones supervisor-técnico',
                error: error.message,
            })
        }
    }

    public async listarSupervisoresActivos({ response }: HttpContext) {
        try {
            const supervisores = await db
                .query()
                .from('users as u')
                .join('rols as r', 'u.rol_id', 'r.id')
                .where('r.name', 'Supervisor')
                .where((query) => {
                    query.where('u.estado', 'true')
                        .orWhere('u.estado', '1')
                        .orWhere('u.estado', 1)
                })
                .select(
                    'u.id',
                    'u.nombre',
                    'u.apellido',
                    'u.email',
                    'u.estado',
                    'r.name as rol'
                )
                .orderBy('u.nombre', 'asc')
                .orderBy('u.apellido', 'asc')

            return response.ok({
                mensaje: 'Supervisores activos obtenidos correctamente',
                data: supervisores
            })
        } catch (error: any) {
            return response.internalServerError({
                mensaje: 'Error al obtener los supervisores activos',
                error: error.message
            })
        }
    }

    /**
     * Obtener lista de técnicos activos (sin supervisor asignado)
     */
    public async listarTecnicosDisponibles({ response }: HttpContext) {
        try {
            const tecnicos = await db
                .query()
                .from('users as u')
                .join('rols as r', 'u.rol_id', 'r.id')
                .leftJoin('supervisor_tecnicos as st', 'u.id', 'st.tecnico_id')
                .where('r.name', 'Tecnico')
                .where((query) => {
                    query.where('u.estado', 'true')
                        .orWhere('u.estado', '1')
                        .orWhere('u.estado', 1)
                })
                .whereNull('st.id')
                .select(
                    'u.id',
                    'u.nombre',
                    'u.apellido',
                    'u.email',
                    'u.estado',
                    'r.name as rol'
                )
                .orderBy('u.nombre', 'asc')
                .orderBy('u.apellido', 'asc')

            return response.ok({
                mensaje: 'Técnicos disponibles obtenidos correctamente',
                data: tecnicos
            })
        } catch (error: any) {
            return response.internalServerError({
                mensaje: 'Error al obtener los técnicos disponibles',
                error: error.message
            })
        }
    }

    //eliminar asignacion tecnico-supervisor
    public async eliminarAsignacion({ params, response }: HttpContext) {
        const { tecnicoId } = params

        try {
            console.log('ID recibido para eliminar:', tecnicoId);

            // Validar que tecnicoId existe y es un número
            if (!tecnicoId) {
                return response.status(400).json({
                    mensaje: 'ID de técnico es requerido'
                })
            }

            const relacion = await SupervisorTecnico.find(tecnicoId)

            if (!relacion) {
                return response.status(404).json({
                    mensaje: 'Relación no encontrada'
                })
            }

            await relacion.delete()

            return response.ok({
                mensaje: 'Técnico desasignado exitosamente'
            })
        } catch (error: any) {
            console.error('Error al eliminar relación:', error)
            return response.status(400).json({
                mensaje: 'Error al desasignar el técnico',
                error: error.message,
            })
        }
    }


    /**
   * Listar técnicos asignados a un supervisor específico
   */
    public async listarTecnicosPorSupervisor({ params, response }: HttpContext) {
        const { supervisorId } = params

        try {
            const tecnicosAsignados = await db
                .query()
                .from('supervisor_tecnicos as ST')
                .innerJoin('users as T', 'T.id', 'ST.tecnico_id')
                .innerJoin('rols as RT', 'RT.id', 'T.rol_id')
                .where('ST.supervisor_id', supervisorId)
                .select([
                    'ST.id as asignacion_id',
                    'T.id as tecnico_id',
                    db.raw("CONCAT(T.nombre, ' ', T.apellido) AS tecnico_nombre"),
                    'T.email as tecnico_email',
                    'RT.name as tecnico_rol',
                    'T.estado as tecnico_estado',
                    'ST.created_at as fecha_asignacion'
                ])
                .orderBy('T.nombre', 'asc')
                .orderBy('T.apellido', 'asc')

            return response.ok({
                mensaje: 'Técnicos asignados al supervisor obtenidos correctamente',
                data: tecnicosAsignados
            })

        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al obtener técnicos del supervisor',
                error: error.message,
            })
        }
    }


    // En tu controlador de visitas
    public async listarVisitasPorSupervisor({ params, response }: HttpContext) {
        const { supervisorId } = params

        try {
            const visitas = await db
                .query()
                .from('visitas as V')
                .innerJoin('users as T', 'T.id', 'V.tecnico_id')
                .innerJoin('clientes as C', 'C.id', 'V.cliente_id')
                .innerJoin('users as S', 'S.id', 'V.supervisor_id')
                .where('V.supervisor_id', supervisorId)
                .select([
                    'V.id as id_visita',
                    'T.nombre as nombre_tecnico',
                    'T.apellido as apellido_tecnico',
                    'C.nombre as nombre_cliente',
                    'C.apellido as apellido_cliente',
                    'V.fecha_programada',
                    'V.hora_programada',
                    'V.estado_visita',
                    'V.observaciones',
                    'C.direccion',
                    'C.telefono',
                    'C.latitud',
                    'C.longitud'
                ])
                .orderBy('V.fecha_programada', 'desc')
                .orderBy('V.hora_programada', 'desc')

            // Transformar los datos para incluir nombre completo del cliente
            const visitasTransformadas = visitas.map(visita => ({
                ...visita,
                nombre_cliente: `${visita.nombre_cliente} ${visita.apellido_cliente}`
            }))

            return response.ok({
                mensaje: 'Visitas del supervisor obtenidas correctamente',
                data: visitasTransformadas
            })

        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al obtener las visitas del supervisor',
                error: error.message,
            })
        }


    }
}