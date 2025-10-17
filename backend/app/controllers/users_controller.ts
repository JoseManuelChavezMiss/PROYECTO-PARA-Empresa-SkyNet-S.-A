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


  //actualizar usuario
  public async actualizarUsuario({ request, params }: HttpContext) {
    try {
      const userId = params.id
      const userData = request.only(['nombre', 'apellido', 'email', 'password', 'rol_id'])

      const user = await User.find(userId)
      if (!user) {
        return { mensaje: 'Usuario no encontrado' }
      }

      // Verificar si el email ya está en uso por otro usuario
      if (userData.email && userData.email !== user.email) {
        const emailExistente = await User.findBy('email', userData.email)
        if (emailExistente) {
          return { mensaje: 'El email ya está en uso por otro usuario' }
        }
      }

      user.merge(userData)
      await user.save()

      return { mensaje: 'Usuario actualizado exitosamente', user }
    } catch (error) {
      return { mensaje: 'Error al actualizar usuario', error: error.message }
    }
  }

  // En tu controlador de usuarios
  public async obtenerUsuario({ params, response }: HttpContext) {
    try {
      console.log("ID recibido:", params.id);

      const userId = params.id;
      const user = await User.find(userId);
      console.log("Usuario encontrado:", user);

      if (!user) {
        console.log("Usuario no encontrado");
        return response.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      await user.load('rol');
      console.log("Usuario con rol:", user.toJSON());

      return response.json({
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          estado: user.estado,
          rol_id: user.rol_id,
          rolNombre: user.rol ? user.rol.name : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error: any) {
      console.log("Error:", error.message);
      return response.status(500).json({
        mensaje: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  //actualizar el estado del usuario
  public async actualizarEstado({ request, params, response }: HttpContext) {
    try {
      console.log('🔵 [BACKEND] Iniciando actualizarEstado...');
      const userId = params.id
      console.log('🔵 [BACKEND] User ID recibido:', userId);

      const body = request.all();
      console.log('🔵 [BACKEND] Body completo:', body);

      const { estado } = request.only(['estado'])
      console.log('🔵 [BACKEND] Estado recibido:', estado, 'Tipo:', typeof estado);

      // Validar que el usuario existe
      console.log('🔵 [BACKEND] Buscando usuario...');
      const user = await User.find(userId)
      if (!user) {
        console.log('❌ [BACKEND] Usuario no encontrado');
        return response.status(404).json({ mensaje: 'Usuario no encontrado' })
      }
      console.log('🔵 [BACKEND] Usuario encontrado:', user.toJSON());

      // Normalizar el valor del estado
      let estadoNormalizado: boolean
      console.log('🔵 [BACKEND] Normalizando estado...');

      if (typeof estado === 'boolean') {
        estadoNormalizado = estado
      } else if (typeof estado === 'number') {
        estadoNormalizado = estado === 1
      } else if (typeof estado === 'string') {
        estadoNormalizado = estado === 'true' || estado === '1'
      } else {
        console.log('❌ [BACKEND] Formato de estado inválido:', estado);
        return response.status(400).json({
          mensaje: 'Formato de estado inválido. Use true/false, 1/0 o "true"/"false"'
        })
      }

      console.log('🔵 [BACKEND] Estado normalizado:', estadoNormalizado);

      // Actualizar el estado
      console.log('🔵 [BACKEND] Actualizando usuario...');
      user.estado = estadoNormalizado
      await user.save()

      console.log('✅ [BACKEND] Usuario actualizado correctamente');
      console.log('✅ [BACKEND] Nuevo estado:', user.estado);

      return response.json({
        mensaje: 'Estado del usuario actualizado correctamente',
        data: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          estado: user.estado,
          rol_id: user.rol_id,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error) {
      console.error('❌ [BACKEND] ERROR CAPTURADO:', error);
      console.error('❌ [BACKEND] Stack trace:', error.stack);
      return response.status(500).json({
        mensaje: 'Error al actualizar estado del usuario',
        error: error.message
      })
    }
  }

}