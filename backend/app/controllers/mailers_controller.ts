// Importar Resend
import { HttpContext } from '@adonisjs/core/http';
import { Resend } from 'resend'
// También podrías tener que obtener la variable de entorno


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

    // Inicializar Resend con la API key desde las variables de entorno
    const resend = new Resend('re_fyoPKKSg_CkbC2ECXeukPCBC8AeBdBBZb');


    try {
      // Enviar el correo con Resend
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // Asegúrate de que este dominio esté verificado en Resend
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

// import { HttpContext } from "@adonisjs/core/http"
// import mail from "@adonisjs/mail/services/main"

// export default class MailersController {
//   async send({ params, request, response }: HttpContext) {
//     // Obtener el email de los parámetros de la ruta
//     const email = params.email

//     // ✅ CORREGIDO: Obtener todo el body y extraer reporte
//     const body = request.all()
//     const reporte = body.reporte

//     console.log('Email recibido:', email)
//     console.log('Cuerpo completo recibido:', body)
//     console.log('Reporte recibido:', reporte)

//     // Validar que el email existe
//     if (!email) {
//       return response.badRequest({
//         message: 'El parámetro "email" es requerido en la ruta'
//       })
//     }

//     try {
//       await mail.send((message) => {
//         // ✅ CORREGIDO: Manejar el caso cuando reporte es undefined
//         const resumen = reporte?.resumenTrabajo || 'No especificado'
//         const materiales = reporte?.materialesUtilizados || 'No especificado'
//         const fecha = reporte?.fechaReporte 
//           ? new Date(reporte.fechaReporte).toLocaleDateString() 
//           : 'No especificada'

//         message
//           .to(email)
//           .subject('Se completó la visita')
//           .from('noreply@tuapp.com') // ⚠️ Cambia por tu email real
//           .html(`
//             <h1>Reporte de Visita Completada</h1>
//             <p><strong>Resumen del trabajo:</strong> ${resumen}</p>
//             <p><strong>Materiales utilizados:</strong> ${materiales}</p>
//             <p><strong>Fecha del reporte:</strong> ${fecha}</p>
//           `)
//       })

//       return response.ok({ message: 'Correo enviado exitosamente' })
//     } catch (error) {
//       console.error('Error al enviar el correo:', error)
//       return response.internalServerError({ 
//         message: 'No se pudo enviar el correo.' 
//       })
//     }
//   }
// }
