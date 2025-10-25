
import { HttpContext } from '@adonisjs/core/http';
import { Resend } from 'resend'


export default class MailersController {
  async send({ params, request, response }: HttpContext) {
    const email = params.email

    const body = request.all()
    const reporte = body.reporte

    console.log('Email recibido:', email)
    console.log('Cuerpo completo recibido:', body)
    console.log('Reporte recibido:', reporte)

    if (!email) {
      return response.badRequest({
        message: 'El parámetro "email" es requerido en la ruta'
      })
    }

    const resend = new Resend('re_fyoPKKSg_CkbC2ECXeukPCBC8AeBdBBZb');


    try {
      // Enviar el correo con Resend
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: 'Se completó la visita',
        html: `
          <h1>Reporte de Visita Completada</h1>
          <p><strong>Resumen del trabajo:</strong> ${reporte?.resumenTrabajo || 'No especificado'}</p>
          <p><strong>Materiales utilizados:</strong> ${reporte?.materialesUtilizados || 'No especificado'}</p>
          <p><strong>Fecha del reporte:</strong> ${reporte?.fechaReporte ? new Date(reporte.fechaReporte).toLocaleDateString() : 'No especificada'}</p>
        `,
      })

      if (error) {
        console.error({ error })
        return response.internalServerError({ 
          message: 'No se pudo enviar el correo.' 
        })
      }

      console.log({ data })
      return response.ok({ message: 'Correo enviado exitosamente' })

    } catch (error) {
      console.error('Error al enviar el correo:', error)
      return response.internalServerError({ 
        message: 'No se pudo enviar el correo.' 
      })
    }
  }
}
