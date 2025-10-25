// services/VisitasSupervisorService.ts
import axiosClient from "./axiosCliente";

// Interfaces para técnicos asignados al supervisor
export interface TecnicoAsignado {
    asignacion_id: number;
    tecnico_id: number;
    tecnico_nombre: string;
    tecnico_email: string;
    tecnico_rol: string;
    tecnico_estado: string;
    fecha_asignacion: string;
}

export interface VisitaSupervisor {
    id_visita: number;
    nombre_tecnico: string;
    apellido_tecnico: string;
    nombre_cliente: string;
    apellido_cliente: string;
    fecha_programada: string;
    hora_programada: string;
    estado_visita: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';
    observaciones: string;
    direccion: string;
    telefono: string;
    latitud: string;
    longitud: string;
}

export interface TecnicosPorSupervisorResponse {
    mensaje: string;
    data: TecnicoAsignado[];
}

export interface VisitasPorSupervisorResponse {
    mensaje: string;
    data: VisitaSupervisor[];
}

const VisitasSupervisorService = {
    /**
     * Obtiene los técnicos asignados a un supervisor específico
     * GET /api/tecnicosPorSupervisor/:supervisorId
     */
    async listarTecnicosPorSupervisor(supervisorId: number): Promise<TecnicosPorSupervisorResponse> {
        try {
            const response = await axiosClient.get<TecnicosPorSupervisorResponse>(`/api/tecnicosPorSupervisor/${supervisorId}`);

            if (response.status !== 200) {
                throw new Error('Error al obtener los técnicos del supervisor');
            }

            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensaje || 'Error al obtener técnicos del supervisor');
            }
            throw error;
        }
    },

    /**
     * Obtiene las visitas asignadas a un supervisor específico
     * GET /api/listarVisitasPorSupervisor/:supervisorId
     */
    async listarVisitasPorSupervisor(supervisorId: number): Promise<VisitasPorSupervisorResponse> {
        try {
            const response = await axiosClient.get<VisitasPorSupervisorResponse>(`/api/listarVisitasPorSupervisor/${supervisorId}`);

            if (response.status !== 200) {
                throw new Error('Error al obtener las visitas del supervisor');
            }

            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensaje || 'Error al obtener visitas del supervisor');
            }
            throw error;
        }
    }
};

export default VisitasSupervisorService;