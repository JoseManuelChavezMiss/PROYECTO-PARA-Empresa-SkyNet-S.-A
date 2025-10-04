
export default class misVisitasDTO {
    declare idVisita: number
    declare nombreTecnico: string
    declare apellidoTecnico: string
    declare nombreCliente: string
    declare latitud: string
    declare longitud: string
    declare fechaProgramada: Date
    declare horaProgramada: string
    declare estadoVisita: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'
}