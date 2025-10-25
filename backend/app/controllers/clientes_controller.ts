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
                estado: true
            })
            return response.status(200).json({
                mensaje: 'Cliente registrado exitosamente',
                data: cliente
            })
        } catch (error) {
            return response.status(400).json({
                mensaje: 'Error al registrar el cliente o el email ya existe',
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

    //actualizar cliente
    async actualizarCliente({ params, request, response }: HttpContext) {
        if (!params.id) {
            return response.status(400).json({
                mensaje: 'Error: Se requiere el ID del cliente'
            })
        }

        const datosPermitidos = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'latitud', 'longitud']
        const datos = request.only(datosPermitidos)

        if (Object.keys(datos).length === 0) {
            return response.status(400).json({
                mensaje: 'Error: No se proporcionaron datos para actualizar'
            })
        }

        try {
            const cliente = await Cliente.findOrFail(params.id)

            if (datos.email && datos.email !== cliente.email) {
                const clienteExistente = await Cliente.findBy('email', datos.email)
                if (clienteExistente) {
                    return response.status(400).json({
                        mensaje: 'Error: El email ya está registrado'
                    })
                }
            }

            cliente.merge(datos) 
            await cliente.save()

            return response.status(200).json({
                mensaje: 'Cliente actualizado exitosamente',
                data: cliente
            })

        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    mensaje: 'Error: Cliente no encontrado'
                })
            }

            return response.status(500).json({
                mensaje: 'Error interno al actualizar el cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error desconocido'
            })
        }
    }

    //metodo para obtener un cliente por su id
    async obtenerCliente({ params, response }: HttpContext) {
        if (!params.id) {
            return response.status(400).json({
                mensaje: 'Error: Se requiere el ID del cliente'
            })
        }

        try {
            const cliente = await Cliente.findOrFail(params.id)
            return response.status(200).json({
                mensaje: 'Cliente encontrado',
                data: cliente
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    mensaje: 'Error: Cliente no encontrado'
                })
            }
            return response.status(500).json({
                mensaje: 'Error interno al obtener el cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error desconocido'
            })
        }
    }

    //metodo para cambiar el estado del cliente de 1 a 0 y viceversa
    async actualizarEstado({ params, response }: HttpContext) {
        if (!params.id) {
            return response.status(400).json({
                mensaje: 'Error: Se requiere el ID del cliente'
            })
        }

        try {
            const cliente = await Cliente.findOrFail(params.id)

            await cliente.merge({ estado: !cliente.estado }).save()
            return response.status(200).json({
                mensaje: 'Estado del cliente actualizado',
                data: cliente
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    mensaje: 'Error: Cliente no encontrado'
                })
            }
            return response.status(500).json({
                mensaje: 'Error interno al cambiar el estado del cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error desconocido'
            })
        }
    }
}