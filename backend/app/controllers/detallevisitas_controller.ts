// import type { HttpContext } from '@adonisjs/core/http'

import DetalleVisita from "#models/detallevisitas"

export default class DetallevisitasController {

    //metodo para crear un detalle de visita
    public async create({ request, response }: { request: any, response: any }) {
        const { idvisita, tipo_registro, fecha_hora, observaciones } = request.only(['idvisita', 'tipo_registro', 'fecha_hora', 'observaciones'])
        try {
            const detalleVisita = await DetalleVisita.create({
                idVisita: idvisita,
                tipoRegistro: tipo_registro,
                fechaHora: fecha_hora,
                observaciones
            })
            
            const visita = await detalleVisita.related('visita').query().first()
            if (visita) {
                visita.estadoVisita = tipo_registro
                await visita.save()
            }
            
            return response.status(201).json(detalleVisita)
        } catch (error) {
            return response.status(500).json({ message: 'Error al crear el detalle de visita', error })
        }
    }

    //metodo para obtener todos los detalles de visitas
    public async index({ response }: { response: any }) {
        try {
            const detallesVisitas = await DetalleVisita.all()
            return response.status(200).json(detallesVisitas)
        } catch (error) {
            return response.status(500).json({ message: 'Error al obtener los detalles de visitas', error })
        }
    }

    //metodo para obtener un detalle de visita por su id
    public async show({ params, response }: { params: { id: number }, response: any }) {
        const { id } = params
        try {
            const detalleVisita = await DetalleVisita.find(id)
            if (!detalleVisita) {
                return response.status(404).json({ message: 'Detalle de visita no encontrado' })
            }
            return response.status(200).json(detalleVisita)
        } catch (error) {
            return response.status(500).json({ message: 'Error al obtener el detalle de visita', error })
        }
    }
}