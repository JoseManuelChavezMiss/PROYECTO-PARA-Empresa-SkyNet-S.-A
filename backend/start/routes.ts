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
      .use(middleware.moduloAccess)

    router.get('/logout', [AuthController, 'logout'])
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

// router.group(() => {

//   router.group(() => {
//     router.post('/registrarUsuario',[AuthController, 'registrarUsuario'])
//     .use(middleware.moduloAccess)

//     router.get('/usuariosLista', [UsersController, 'obtenerUsuarios'])
//     // .as('usuarios.listar')
//     // .use(middleware.moduloAccess)

//     router.get('/logout',[AuthController, 'logout'])
//   }).use(
//     middleware.auth({
//       guards: ['api']
//     })
//   )



//   router.group(() => {
//     router.post('/login',[AuthController, 'login'])
//   }).prefix('/auth')

// }).prefix('/api')
