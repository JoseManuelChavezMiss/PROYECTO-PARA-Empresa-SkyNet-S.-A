import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Rol from '#models/rol'

export default class Modulo extends BaseModel {
  static table = 'modulos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare path: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Rol, {
    pivotTable: 'modulo_rols',
    localKey: 'id',
    pivotForeignKey: 'modulo_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'rol_id',
  })
  declare rols: ManyToMany<typeof Rol>
}