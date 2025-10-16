/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import UsersController from '#controllers/users_controller'
import ClientesController from '#controllers/clientes_controller'
import VisitasController from '#controllers/visitas_controller'
import DetallevisitasController from '#controllers/detallevisitas_controller'
import ReportesVisitasController from '#controllers/reportes_visitas_controller'
import MailersController from '#controllers/mailers_controller'
import ReportsController from '#controllers/reportes_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.group(() => {
    router.get('/usuariosLista', [UsersController, 'obtenerUsuarios'])
      .as('usuarios.listar')
      .use(middleware.moduloAccess())

    router.post('/registrarUsuario', [AuthController, 'registrarUsuario'])
      .as('usuarios.crear')
      .use(middleware.moduloAccess())

    router.get('/usuariosObtener/:id', [AuthController, 'obtenerUsuario'])
      .as('usuarios.obtener')
      .use(middleware.moduloAccess())
    router.put('/actualizarUsuario/:id', [AuthController, 'actualizarUsuario'])
      .as('usuarios.actualizar')
      .use(middleware.moduloAccess())
    
    router.put('/eliminarUsuario/:id/estado', [AuthController, 'actualizarEstado'])
      .as('usuarios.eliminar')
      .use(middleware.moduloAccess())

    router.post('/registrarCliente', [ClientesController, 'registrar'])
      .as('clientes.crear')
      .use(middleware.moduloAccess())

    router.get('/clientesLista', [ClientesController, 'listar'])
      .as('clientes.listar')
      .use(middleware.moduloAccess())

    /*
         Rutas para todo lo relacionado con las visitas      
    */
    router.get('/visitasLista', [VisitasController, 'listar'])
      .as('visitas.listar')
      .use(middleware.moduloAccess())

    router.post('/crearVisita', [VisitasController, 'crear'])
      .as('visitas.crear')
      .use(middleware.moduloAccess())
    router.get('/visitasEntidades/:opcion?', [VisitasController, 'listarEntidades'])
      .as('visitas.lsitar')
      .use(middleware.moduloAccess())

    router.get('/visitasTecnico/:tecnicoId?', [UsersController, 'visitasTecnico'])
      .as('visitas.tecnico')
      .use(middleware.moduloAccess())

    router.post('/crearDetalleVisita', [DetallevisitasController, 'create'])
      .as('visitas.crearDetalle')
      .use(middleware.moduloAccess())

    router.post('/reporteVisita', [ReportesVisitasController, 'crearReporte'])
      .as('visitas.reporte')
      .use(middleware.moduloAccess())

    router.get('/send-email/:email', [MailersController, 'send'])

    // Reportes de Visitas
    router.post('/reportes/eficiencia-tecnicos', [ReportsController, 'eficienciaTecnicos'])
      .as('reportes.eficienciaTecnicos')
      .use(middleware.moduloAccess())

    router.post('/reportes/metricas-periodo', [ReportsController, 'metricasVisitasPeriodo'])
      .as('reportes.metricasPeriodo')
      .use(middleware.moduloAccess())

    router.post('/reportes/tiempo-promedio', [ReportsController, 'tiempoPromedioVisita'])
      .as('reportes.tiempoPromedio')
      .use(middleware.moduloAccess())

    router.post('/reportes/productividad-hora', [ReportsController, 'productividadPorHora'])
      .as('reportes.productividadHora')
      .use(middleware.moduloAccess())

    router.post('/reportes/tendencias-mensuales', [ReportsController, 'tendenciasMensuales'])
      .as('reportes.tendenciasMensuales')
      .use(middleware.moduloAccess())

    router.post('/reportes/analisis-cancelaciones', [ReportsController, 'analisisCancelaciones'])
      .as('reportes.analisisCancelaciones')
      .use(middleware.moduloAccess())

    // Reportes de Clientes
    router.post('/reportes/clientes-activos', [ReportsController, 'clientesMasActivos'])
      .as('reportes.clientesActivos')
      .use(middleware.moduloAccess())

    router.post('/reportes/distribucion-geografica', [ReportsController, 'distribucionGeograficaClientes'])
      .as('reportes.distribucionGeografica')
      .use(middleware.moduloAccess())

    // Reportes de Recursos
    router.post('/reportes/materiales-utilizados', [ReportsController, 'materialesMasUtilizados'])
      .as('reportes.materialesUtilizados')
      .use(middleware.moduloAccess())

    // Reportes de Usuarios
    router.post('/reportes/actividad-roles', [ReportsController, 'actividadUsuariosRol'])
      .as('reportes.actividadRoles')
      .use(middleware.moduloAccess())

    router.post('/reportes/sesiones-usuarios', [ReportsController, 'sesionesUsuarios'])
      .as('reportes.sesionesUsuarios')
      .use(middleware.moduloAccess())

    // Dashboard y Reportes Generales
    router.post('/reportes/dashboard-actual', [ReportsController, 'dashboardEstadoActual'])
      .as('reportes.dashboardActual')
      .use(middleware.moduloAccess())

    router.post('/reportes/reporte-general', [ReportsController, 'reporteGeneral'])
      .as('reportes.reporteGeneral')
      .use(middleware.moduloAccess())

    router.get('/logout', [AuthController, 'logout'])

    router.get('/auth/me', [AuthController, 'me']).as('auth.me')
  })
    .use(
      middleware.auth({
        guards: ['api'],
      })
    )

  router.group(() => {
    router.post('/login', [AuthController, 'login']).as('auth.login')
  }).prefix('/auth')
}).prefix('/api')


