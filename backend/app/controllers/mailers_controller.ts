
import { HttpContext } from "@adonisjs/core/http"
import mail from "@adonisjs/mail/services/main"

export default class MailersController {

  // async send({ response }: HttpContext) {
  //   const user = {
  //     fullName: 'Juan Pérez',
  //     email: 'vikoti5981@bdnets.com'
  //   }
  //   try {
  //     await mail.send((message) => {
  //       message
  //         .to(user.email)
  //         .subject('¡Bienvenido a nuestra App!')
  //         .from(''
  //         )
  //     })

  //     return response.ok({ message: 'Correo enviado a Mailtrap exitosamente!' })
  //   } catch (error) {
  //     console.error('Error al enviar el correo:', error)
  //     return response.internalServerError({ message: 'No se pudo enviar el correo.' })
  //   }
  // }

  async send({ request, response }: HttpContext) {
    const allParams = request.qs()
    console.log('Todos los query parameters:', allParams)
    const { email } = request.only(['email'])

    const user = {
      email: email
    }

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Se completo la visita')
      })

      return response.ok({ message: 'Correo enviado exitosamente' })
    } catch (error) {
      console.error('Error al enviar el correo:', error)
      return response.internalServerError({ message: 'No se pudo enviar el correo.' })
    }
  }
}