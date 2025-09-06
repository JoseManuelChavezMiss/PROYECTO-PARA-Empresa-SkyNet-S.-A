import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const rutaModuloMap: Record<string, string> = {
  usuarios: 'LISTAR',
  reportes: 'REPORTES GENERALES',
  inventario: 'GESTION INVENTARIO',
}

export default class ModuloAccessMiddleware {
  public async handle({ auth, request, response }: HttpContext, next: NextFn) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autorizado' })
      }

      let moduloSolicitado: string | undefined =
        request.input('modulo') || request.param('modulo')

      // 🧠 Detectar desde URL si no se especifica
      if (!moduloSolicitado) {
        const url = request.url()
        const partes = url.split('/')
        const ruta = partes[2] // '/api/usuarios' → 'usuarios'

        // Obtener nombre del módulo desde el mapa
        moduloSolicitado = rutaModuloMap[ruta]
      }

      if (!moduloSolicitado) {
        return response.badRequest({
          message: 'No se pudo determinar el módulo desde la URL',
          hint: 'Verifica que exista un nombre de módulo para esta ruta en el mapa',
        })
      }

      // ✅ Cargar módulos del rol del usuario
      await user.load('rol', (rolQuery) => {
        rolQuery.preload('modulos', (moduloQuery) => {
          moduloQuery.where('name', moduloSolicitado)
        })
      })

      const tienePermiso = user.rol.modulos.length > 0

      if (!tienePermiso) {
        return response.unauthorized({
          message: `Acceso denegado al módulo: ${moduloSolicitado}`,
        })
      }

      return await next()
    } catch (error) {
      console.error('Error en middleware ModuloAccess:', error)
      return response.unauthorized({ message: 'Error en verificación de acceso' })
    }
  }
}