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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {

  router.group(() => {
    router.post('/registrarUsuario',[AuthController, 'registrarUsuario'])
    .use(middleware.moduloAccess)

    router.get('/logout',[AuthController, 'logout'])
  }).use(
    middleware.auth({
      guards: ['api']
    })
  )



  router.group(() => {
    router.post('/login',[AuthController, 'login'])
  }).prefix('/auth')

}).prefix('/api')
