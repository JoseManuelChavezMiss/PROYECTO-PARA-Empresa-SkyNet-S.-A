// import type { HttpContext } from '@adonisjs/core/http'

import User from "#models/user"
import { HttpContext } from "@adonisjs/core/http"

export default class UsersController {
    //registro de usuarios
    public async registrarUsuario({ request }: HttpContext) {
        try {
            const userData = request.only(['nombre', 'apellido', 'email', 'password', 'rol_id'])
            const existe = await User.findBy('email', userData.email)

            //verificar que se mande un rol_id
            if (!userData.rol_id) {
                return { mensaje: 'El rol_id es obligatorio' }
            }

            if (existe) {
                return { mensaje: 'El usuario ya existe' }
            }

            const user = await User.create(userData)
            return { mensaje: 'Usuario creado exitosamente', user }
        } catch (error) {
            return { mensaje: 'Error al registrar usuario', error: error.message }
        }
    }

    async login({ request }: HttpContext) {
        try {
            const data = request.only(['email', 'password']);




            const user = await User.verifyCredentials(data.email, data.password);
            const token = await User.accessTokens.create(user)
            return {
                type: 'Bearer',
                token: token.value!.release()
            };
        } catch (error) {
            return {
                status: 401,
                mensaje: 'Credenciales incorrectas',
                error: error.message
            };
        }

    }

    async logout({ auth, response }: HttpContext) {
        try {
            const user = auth.user;

            if (!user) {
                return response.status(401).json({
                    mensaje: 'Usuariautenticado'
                });
            }

            const token = auth.user?.currentAccessToken;
            if (token) {
                await User.accessTokens.delete(user, token.identifier);
            }

            return response.status(200).json({
                mensaje: 'Logout exitoso'
            });
        } catch (error) {
            return response.status(500).json({
                mensaje: 'Error al cerrar sesión',
                error: error.message
            });
        }
    }
}