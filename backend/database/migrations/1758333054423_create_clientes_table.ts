import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 255).notNullable()
      table.string('apellido', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('telefono', 20).notNullable()
      table.string('direccion', 500).notNullable()
      table.decimal('latitud', 10, 7).notNullable()
      table.decimal('longitud', 10, 7).notNullable()
      table.boolean('estado').notNullable().defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}