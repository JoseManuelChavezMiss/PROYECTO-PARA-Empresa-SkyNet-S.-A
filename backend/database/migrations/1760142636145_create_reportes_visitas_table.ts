import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reportes_visitas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_visita').unsigned().references('id').inTable('visitas').onDelete('CASCADE')
      table.text('resumen_trabajo').notNullable()
      table.text('materiales_utilizados').notNullable()
      table.timestamp('fecha_reporte').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}