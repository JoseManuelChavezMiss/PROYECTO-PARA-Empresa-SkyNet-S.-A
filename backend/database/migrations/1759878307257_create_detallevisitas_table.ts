import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'detallevisitas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('idvisita').unsigned().references('id').inTable('visitas').onDelete('CASCADE')
      table.enum('tipo_registro', ['En Progreso', 'Completada', 'Cancelada']).notNullable()
      table.dateTime('fecha_hora').notNullable()
      table.text('observaciones')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}