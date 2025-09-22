// import type { HttpContext } from '@adonisjs/core/http'

import Cliente from "#models/clientes"
import { HttpContext } from "@adonisjs/core/http"

export default class ClientesController {

    //registro de clientes y que el email sea unico
    async registrar({ request, response }: HttpContext) {
        const datos = request.only(['nombre', 'apellido', 'email', 'telefono', 'direccion', 'latitud', 'longitud'])

        try {
            const cliente = await Cliente.create({
                nombre: datos.nombre,
                apellido: datos.apellido,
                email: datos.email,
                telefono: datos.telefono,
                direccion: datos.direccion,
                latitud: datos.latitud,
                longitud: datos.longitud,
                estado: true // Por defecto, el estado es true (activo)
            })
            return response.status(201).json({
                mensaje: 'Cliente registrado exitosamente',
                data: cliente
            })
        } catch (error) {
            return response.status(400).json({
                mensaje: 'Error al registrar el cliente',
                error: error.message
            })
        }
    }

    //listar clientes
    async listar({ response }: HttpContext) {
        try {
            const clientes = await Cliente.all()
            return response.status(200).json({
                mensaje: 'Lista de clientes',
                data: clientes
            })
        } catch (error) {
            return response.status(400).json({
                mensaje: 'Error al listar los clientes',
                error: error.message
            })
        }
    }
}