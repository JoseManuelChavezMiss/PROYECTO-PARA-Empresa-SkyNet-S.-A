import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('cliente_id').unsigned().references('id').inTable('clientes').onDelete('CASCADE')
      table.integer('supervisor_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('tecnico_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.date('fecha_programada').notNullable()
      table.time('hora_programada').notNullable()
      table.enum('estado_visita', ['Pendiente', 'En Progreso', 'Completada', 'Cancelada']).defaultTo('Pendiente')
      table.text('observaciones')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}