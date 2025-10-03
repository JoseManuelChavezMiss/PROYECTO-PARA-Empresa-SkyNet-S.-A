import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Cliente from './clientes.js'
import User from './user.js'

export default class Visita extends BaseModel {
  public static table = 'visitas'

  @column({ isPrimary: true })
  public declare id: number

  @column({ columnName: 'cliente_id' })
  public declare clienteId: number

  @column({ columnName: 'supervisor_id' })
  public declare supervisorId: number

  @column({ columnName: 'tecnico_id' })
  public declare tecnicoId: number

  @column.dateTime({ columnName: 'fecha_programada' })
  public declare fechaProgramada: DateTime

  @column({ columnName: 'hora_programada' })
  public declare horaProgramada: string

  @column({ columnName: 'estado_visita' })
  public declare estadoVisita: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'

  @column()
  public declare observaciones: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public declare updatedAt: DateTime

  @belongsTo(() => Cliente, { foreignKey: 'clienteId' })
  public declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => User, { foreignKey: 'supervisorId' })
  public declare supervisor: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'tecnicoId' })
  public declare tecnico: BelongsTo<typeof User>
}