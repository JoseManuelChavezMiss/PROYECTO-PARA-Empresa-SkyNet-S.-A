import User from "#models/user";
import { HttpContext } from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";

export default class UsersController {

  public async obtenerUsuarios({ response }: HttpContext) {
    try {
      const usuarios = await User.query().preload('rol');

      const usuariosConRol = usuarios.map(usuario => {
        return {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          estado: usuario.estado,
          rolId: usuario.rol_id,
          rolNombre: usuario.rol ? usuario.rol.name : null,
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt
        }
      });

      return response.json(usuariosConRol);
    } catch (error) {
      return response.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
  }



  public async visitasTecnico({ params, request, response }: HttpContext) {
    try {
      const raw = params.tecnicoId ?? request.input('tecnicoId')
      if (!raw) {
        return response.badRequest({ mensaje: 'Falta el parámetro tecnicoId' })
      }

      const tecnicoId = parseInt(raw, 10)
      if (isNaN(tecnicoId) || tecnicoId <= 0) {
        return response.badRequest({ mensaje: 'El tecnicoId proporcionado no es válido' })
      }
      const filas = await db
        .from('visitas as V')
        .select(
          'V.id as id_visita',
          'U.nombre as nombre_tecnico',
          'U.apellido as apellido_tecnico',
          db.raw("CONCAT(C.nombre, ' ', C.apellido) as nombre_cliente"),
          'C.latitud',
          'C.longitud',
          'V.observaciones',
          'C.telefono',
          'C.direccion',
          'C.email',
          'V.fecha_programada',
          'V.hora_programada',
          'V.estado_visita'
        )
        // --- CORRECCIONES EN LOS JOINS ---
        .innerJoin('users as U', 'V.tecnico_id', 'U.id')
        .innerJoin('rols as R', 'U.rol_id', 'R.id')
        .innerJoin('clientes as C', 'V.cliente_id', 'C.id')
        // --- FIN DE CORRECCIONES ---
        .where('R.name', 'Tecnico')
        .andWhere('U.id', tecnicoId)
        .orderBy('V.fecha_programada', 'desc')

      return response.ok({ ok: true, total: filas.length, data: filas })
    } catch (e) {
      console.error('Error en visitasTecnico:', e)
      return response
        .status(500)
        .json({ ok: false, mensaje: 'Error interno del servidor al consultar las visitas', error: e.message })
    }
  }

}