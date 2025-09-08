// import type { HttpContext } from '@adonisjs/core/http'

import User from "#models/user";
import { HttpContext } from "@adonisjs/core/http";

export default class UsersController {
     async obtenerUsuarios({ response }: HttpContext) {
        try {
            const usuarios = await User.all();
            console.log(usuarios);
            return response.json(usuarios);
        } catch (error) {
            return response.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }
}