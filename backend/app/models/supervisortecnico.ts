import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class SupervisorTecnico extends BaseModel {
  public static table = 'supervisor_tecnicos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare supervisorId: number

  @column()
  declare tecnicoId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relación con el modelo User para el supervisor
  @belongsTo(() => User, {
    foreignKey: 'supervisorId',
  })
  declare supervisor: BelongsTo<typeof User>

  // Relación con el modelo User para el técnico
  @belongsTo(() => User, {
    foreignKey: 'tecnicoId',
  })
  declare tecnico: BelongsTo<typeof User>
}