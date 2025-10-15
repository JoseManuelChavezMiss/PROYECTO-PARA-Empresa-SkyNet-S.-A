import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Visita from './visitas.js'

export default class ReporteVisita extends BaseModel {
  public static table = 'reportes_visitas'

  @column({ isPrimary: true })
  public declare id: number

  @column({ columnName: 'id_visita' })
  public declare idVisita: number

  @column({ columnName: 'resumen_trabajo' })
  public declare resumenTrabajo: string

  @column({ columnName: 'materiales_utilizados' })
  public declare materialesUtilizados: string

  @column.dateTime({ columnName: 'fecha_reporte' })
  public declare fechaReporte: DateTime

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  public declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  public declare updatedAt: DateTime

  @belongsTo(() => Visita, { foreignKey: 'idVisita' })
  public declare visita: BelongsTo<typeof Visita>
}