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
  if (name.includes('usuarios'))   return 'Usuarios'
  if (name.includes('clientes'))   return 'Clientes'
  if (name.includes('visitas'))    return 'Visitas'
  if (name.includes('config'))     return 'Configuracion'
  if (name.includes('reportes'))   return 'Reportes'
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


// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'

// const rutaModuloMap: Record<string, string> = {
//   usuarios: 'LISTAR',
//   reportes: 'REPORTES GENERALES',
//   inventario: 'GESTION INVENTARIO',
// }

// export default class ModuloAccessMiddleware {
//   public async handle({ auth, request, response }: HttpContext, next: NextFn) {
//     try {
//       const user = auth.user
//       if (!user) {
//         return response.unauthorized({ message: 'No autorizado' })
//       }

//       let moduloSolicitado: string | undefined =
//         request.input('modulo') || request.param('modulo')

//       // 🧠 Detectar desde URL si no se especifica
//       if (!moduloSolicitado) {
//         const url = request.url()
//         const partes = url.split('/')
//         const ruta = partes[2] // '/api/usuarios' → 'usuarios'

//         // Obtener nombre del módulo desde el mapa
//         moduloSolicitado = rutaModuloMap[ruta]
//       }

//       if (!moduloSolicitado) {
//         return response.badRequest({
//           message: 'No se pudo determinar el módulo desde la URL',
//           hint: 'Verifica que exista un nombre de módulo para esta ruta en el mapa',
//         })
//       }

//       // ✅ Cargar módulos del rol del usuario
//       await user.load('rol', (rolQuery) => {
//         rolQuery.preload('modulos', (moduloQuery) => {
//           moduloQuery.where('name', moduloSolicitado)
//         })
//       })

//       const tienePermiso = user.rol.modulos.length > 0

//       if (!tienePermiso) {
//         return response.unauthorized({
//           message: `Acceso denegado al módulo: ${moduloSolicitado}`,
//         })
//       }

//       return await next()
//     } catch (error) {
//       console.error('Error en middleware ModuloAccess:', error)
//       return response.unauthorized({ message: 'Error en verificación de acceso' })
//     }
//   }
// }