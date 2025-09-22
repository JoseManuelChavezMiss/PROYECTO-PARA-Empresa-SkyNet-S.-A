import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare apellido: string

  @column()
  declare email: string

  @column()
  declare telefono: string

  @column()
  declare direccion: string

  @column()
  declare latitud: number

  @column()
  declare longitud: number

  @column()
  declare estado: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}