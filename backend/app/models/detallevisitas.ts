import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Visita from './visitas.js'

export const TIPO_REGISTRO = ['En Progreso', 'Completada', 'Cancelada'] as const
export type TipoRegistro = typeof TIPO_REGISTRO[number]

export default class DetalleVisita extends BaseModel {
  public static table = 'detallevisitas'

  @column({ isPrimary: true })
  public declare id: number

  @column({ columnName: 'idvisita' })
  public declare idVisita: number

  @column()
  public declare tipoRegistro: TipoRegistro

  @column.dateTime({ columnName: 'fecha_hora' })
  public declare fechaHora: DateTime

  @column()
  public declare observaciones: string | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  public declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  public declare updatedAt: DateTime

  @belongsTo(() => Visita, {
    foreignKey: 'idVisita',
  })
  public declare visita: BelongsTo<typeof Visita>
}