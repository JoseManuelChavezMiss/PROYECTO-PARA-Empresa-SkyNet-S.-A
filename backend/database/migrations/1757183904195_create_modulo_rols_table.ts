import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'modulo_rols'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
       table.increments('id')
      table
        .integer('rol_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('rols') 
        .onDelete('CASCADE')
      table
        .integer('modulo_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('modulos')
        .onDelete('CASCADE')

      table.unique(['rol_id', 'modulo_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}