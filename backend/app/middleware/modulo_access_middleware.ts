import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * DEBUG PREFIX so you can filter logs
 */
const DBG = '[ModuloAccess]'

/**
 * Permisos por rol (en código base).
 * Estos deben coincidir con los nombres en la tabla "modulos".
 */
const rolModuloPermitido: Record<string, string[]> = {
  Administrador: ['Usuarios', 'Clientes', 'Visitas', 'Configuracion', 'Reportes'],
  Supervisor:    ['Clientes', 'Visitas', 'Reportes'],
  Tecnico:       ['Visitas'],
}

/**
 * Mapea el nombre de la ruta a un módulo del sistema
 */
function moduloFromRouteName(name?: string): string | undefined {
  if (!name) return
  const n = name.toLowerCase()
  if (n.includes('usuarios'))  return 'Usuarios'
  if (n.includes('clientes'))  return 'Clientes'
  if (n.includes('visitas') || n.includes('visita')) return 'Visitas'
  if (n.includes('config'))    return 'Configuracion'
  if (n.includes('reportes'))  return 'Reportes'
  return
}

export default class ModuloAccessMiddleware {
  public async handle({ auth, request, response, route }: HttpContext, next: NextFn) {
    console.log(`${DBG} --> ENTER middleware`)
    try {
      // 1. Usuario autenticado
      const user = auth.user
      console.log(`${DBG} auth.user present?`, !!user)
      if (!user) {
        console.log(`${DBG} NO USER -> 401`)
        return response.unauthorized({ message: 'No autorizado' })
      }

      // 2. Recolección de datos de la petición
      const url = request.url()
      const method = request.method()
      const routeName = route?.name
      const query = request.qs()
      const params = request.params()
      console.log(`${DBG} Request`, { method, url, routeName, query, params })

      // 3. Determinar módulo
      const moduloByInput = request.input('modulo')
      const moduloByParam = request.param('modulo')
      const moduloByRoute = moduloFromRouteName(routeName)
      const moduloSolicitado = moduloByInput || moduloByParam || moduloByRoute

      console.log(`${DBG} Modulo detection`, {
        moduloByInput,
        moduloByParam,
        moduloByRoute,
        moduloSolicitado,
      })

      if (!moduloSolicitado) {
        console.log(`${DBG} Could not determine module -> 400`)
        return response.badRequest({ message: 'No se pudo determinar el módulo' })
      }

      // 4. Cargar rol + módulos filtrados
      console.log(`${DBG} Loading role & modules for user id=${user.id} module=${moduloSolicitado}`)
      await user.load('rol', (q) =>
        q.preload('modulos', (mq) => mq.where('name', moduloSolicitado))
      )

      // 5. Datos cargados
      const rolNombre = user.rol?.name
      const modulosCargados = user.rol?.modulos?.map((m: any) => m.name) || []
      console.log(`${DBG} After load`, {
        rolNombre,
        modulosCargados,
        modulosLength: modulosCargados.length,
      })

      // 6. Permisos configurados
      const listaPermitidos = rolModuloPermitido[rolNombre || ''] || []
      const tieneModulo = modulosCargados.length > 0
      const permitidoPorRol = listaPermitidos.includes(moduloSolicitado)
      console.log(`${DBG} Permission check`, {
        rolNombre,
        listaPermitidos,
        moduloSolicitado,
        tieneModulo,
        permitidoPorRol,
      })

      // 7. Decisión
      if (!tieneModulo || !permitidoPorRol) {
        console.log(`${DBG} DENY`, { motivo: 'No modulo o no permitido' })
        return response.unauthorized({
          message: `Acceso denegado al módulo: ${moduloSolicitado} para el rol: ${rolNombre}`,
        })
      }

      console.log(`${DBG} ALLOW -> next()`)
      await next()
      console.log(`${DBG} <-- EXIT middleware (OK)`)
    } catch (e: any) {
      console.error(`${DBG} ERROR`, e)
      return response.unauthorized({ message: 'Error en verificación de acceso', detail: e.message })
    }
  }
}


