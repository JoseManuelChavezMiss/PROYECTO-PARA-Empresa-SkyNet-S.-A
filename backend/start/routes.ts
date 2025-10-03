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


