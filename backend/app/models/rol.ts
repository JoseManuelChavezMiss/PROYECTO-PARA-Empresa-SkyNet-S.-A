import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Modulo from '#models/modulo'

export default class Rol extends BaseModel {
  static table = 'rols'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  //Relación uno a muchos: Un rol puede tener muchos usuarios
  @hasMany(() => User, {
    foreignKey: 'rol_id',
  })
  declare users: HasMany<typeof User>

  //Relación muchos a muchos: Un rol puede tener muchos módulos
  @manyToMany(() => Modulo, {
    pivotTable: 'modulo_rols',
    localKey: 'id',
    pivotForeignKey: 'rol_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'modulo_id',
  })
  declare modulos: ManyToMany<typeof Modulo>
}
