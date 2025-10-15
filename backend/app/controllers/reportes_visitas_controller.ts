// import type { HttpContext } from '@adonisjs/core/http'

import ReporteVisita from "#models/reportesVisitas"
import Visita from "#models/visitas"
import { HttpContext } from "@adonisjs/core/http"
import { DateTime } from "luxon"

export default class ReportesVisitasController {

    //metodo para crear un reporte de visita
     public async crearReporte({ request, response}: HttpContext) {
        try {
            const { idVisita, resumenTrabajo, materialesUtilizados, fechaReporte } = request.only(['idVisita', 'resumenTrabajo', 'materialesUtilizados', 'fechaReporte'])
            const visita = await Visita.find(idVisita)
            if (!visita) {
                return response.status(404).json({ message: 'Visita no encontrada' })
            }

            const reporte = await ReporteVisita.create({
                idVisita,
                resumenTrabajo,
                materialesUtilizados,
                fechaReporte: DateTime.fromISO(fechaReporte)
            })

            return response.status(201).json({
                message: 'Reporte de visita creado exitosamente',
                data: reporte
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error })
        }
    }
    
}