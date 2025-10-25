// import type { HttpContext } from '@adonisjs/core/http'

import User from "#models/user"
import { HttpContext } from "@adonisjs/core/http"

export default class UsersController {
    //registro de usuarios
    public async registrarUsuario({ request }: HttpContext) {
        try {
            const userData = request.only(['nombre', 'apellido', 'email', 'password', 'rol_id'])
            const existe = await User.findBy('email', userData.email)
            console.log(userData);
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
            const { email, password } = request.only(['email', 'password'])

            // Verifica credenciales (valida password)
            const user = await User.verifyCredentials(email, password)

            // Carga relación rol solo con id y nombre
            await user.load('rol', (q) => q.select(['id', 'name']))

            const token = await User.accessTokens.create(user)

            return {
                status: 200,
                mensaje: 'Login exitoso',
                type: 'Bearer',
                token: token.value!.release(),
                user: {
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    rol: {
                        id: user.rol_id,
                        nombre: user.rol.name
                    }
                }
            }
        } catch (error: any) {
            return {
                status: 401,
                mensaje: 'Credenciales incorrectas',
                error: error.message
            }
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

    public async me({ auth, response }: HttpContext) {
        await auth.authenticate()
        const user = auth.user!
        await user.load('rol', (q) => q.select(['id', 'name']))
        return response.ok({
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: { id: user.rol_id, name: user.rol?.name ?? null },
            },
        })
    }

}