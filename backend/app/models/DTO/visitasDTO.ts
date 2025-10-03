
export default class visitasDTO {
    declare id_visita: number
    declare fecha_programada: string
    declare hora_programada: string
    declare estado_visita: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'

    declare nombre_cliente: string
    declare apellido_cliente: string
    declare telefono_cliente: string
    declare direccion_cliente: string
    declare latitud_cliente: number
    declare longitud_cliente: number

    declare nombre_supervisor: string
    declare rol_supervisor: string

    declare nombre_tecnico: string
    declare rol_tecnico: string
}