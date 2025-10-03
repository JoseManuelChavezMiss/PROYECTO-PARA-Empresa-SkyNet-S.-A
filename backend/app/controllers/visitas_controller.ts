// import type { HttpContext } from '@adonisjs/core/http'

import Cliente from "#models/clientes";
import User from "#models/user";
import Visita from "#models/visitas";
import { HttpContext } from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";
import { DateTime } from "luxon";

export default class VisitasController {

    //metodo para listar las visitas
    async listar({ response }: HttpContext) {
        try {
            const visitas = await db
                .query()
                .from('visitas as V')
                .innerJoin('clientes as C', 'C.id', 'V.cliente_id')
                .innerJoin('users as S', 'S.id', 'V.supervisor_id')
                .innerJoin('rols as RS', 'RS.id', 'S.rol_id')
                .innerJoin('users as T', 'T.id', 'V.tecnico_id')
                .innerJoin('rols as RT', 'RT.id', 'T.rol_id')
                .select([
                    'V.id as idVisita',
                    'V.fecha_programada as fechaProgramada',
                    'V.hora_programada as horaProgramada',
                    'V.estado_visita as estadoVisita',
                    'C.id as clienteId',
                    'C.nombre as nombreCliente',
                    'C.apellido as apellidoCliente',
                    'C.telefono as telefonoCliente',
                    'C.direccion as direccionCliente',
                    'C.latitud as latitudCliente',
                    'C.longitud as longitudCliente',
                    'S.id as supervisorId',
                    'S.nombre as nombreSupervisor',
                    'RS.name as rolSupervisor',
                    'T.id as tecnicoId',
                    'T.nombre as nombreTecnico',
                    'RT.name as rolTecnico',
                ])
                .orderBy('V.id', 'desc')

            return response.ok({
                data: visitas,
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al listar visitas',
                error: error.message,
            })
        }
    }

    //metodo para crear una visitas
    async crear({ request, response }: HttpContext) {
        const datos = request.only([
            'clienteId',
            'supervisorId',
            'tecnicoId',
            'fechaProgramada',
            'horaProgramada',
            'estadoVisita',
            'observaciones',
        ])

        // Validar FKs (deben existir)
        const [cliente, supervisor, tecnico] = await Promise.all([
            Cliente.find(datos.clienteId),
            User.find(datos.supervisorId),
            User.find(datos.tecnicoId),
        ])

        if (!cliente) return response.status(422).json({ mensaje: 'Cliente no existe' })
        if (!supervisor) return response.status(422).json({ mensaje: 'Supervisor no existe' })
        if (!tecnico) return response.status(422).json({ mensaje: 'Técnico no existe' })

        try {
            const visita = await Visita.create({
                clienteId: Number(datos.clienteId),
                supervisorId: Number(datos.supervisorId),
                tecnicoId: Number(datos.tecnicoId),
                fechaProgramada: DateTime.fromISO(String(datos.fechaProgramada)),
                horaProgramada: String(datos.horaProgramada),
                estadoVisita: datos.estadoVisita || 'Pendiente',
                observaciones: datos.observaciones ?? null,
            })

            return response.status(201).json({
                mensaje: 'Visita creada exitosamente',
                data: visita,
            })
        } catch (error: any) {
            return response.status(400).json({
                mensaje: 'Error al crear la visita',
                error: error.message,
            })
        }

    }

    
    async listarEntidades({ request, response }: HttpContext) {
        try {
            const opcionRaw = request.input('opcion') ?? request.param('opcion')
            const opcion = Number(opcionRaw)

            if (![1,2,3].includes(opcion)) {
                return response.badRequest({
                    mensaje: 'Opción no válida. Use 1 (Supervisores), 2 (Técnicos) o 3 (Clientes).',
                })
            }

            let data: any[] = []

            if (opcion === 1) {
                // Supervisores
                data = await db
                  .query()
                  .from('users as U')
                  .innerJoin('rols as R', 'R.id', 'U.rol_id')
                  .where('R.name', 'Supervisor')
                  .select([
                    'U.id as id',
                    'U.nombre as nombre_completo',
                    'R.name as rol'
                  ])
                  .orderBy('U.nombre', 'asc')
            } else if (opcion === 2) {
                // Técnicos
                data = await db
                  .query()
                  .from('users as U')
                  .innerJoin('rols as R', 'R.id', 'U.rol_id')
                  .where('R.name', 'Tecnico')
                  .select([
                    'U.id as id',
                    'U.nombre as nombre_completo',
                    'R.name as rol'
                  ])
                  .orderBy('U.nombre', 'asc')
            } else if (opcion === 3) {
                // Clientes
                data = await db
                  .query()
                  .from('clientes as C')
                  .select([
                    'C.id as id',
                    db.raw("CONCAT(C.nombre, ' ', C.apellido) as nombre_completo"),
                    db.raw("'Cliente' as rol")
                  ])
                  .orderBy('C.nombre', 'asc')
            }

            return response.ok({
                mensaje: 'Listado generado',
                data
            })
        } catch (error: any) {
            return response.status(500).json({
                mensaje: 'Error al listar entidades',
                error: error.message
            })
        }
    }
}