// services/AsignarTecnicosSupervisoresService.ts
import axiosClient from "./axiosCliente";

// Interfaces
export interface AsignacionData {
  supervisor_id: number;
  tecnico_id: number;
}

export interface TecnicoAsignado {
  asignacion_id: any;
  tecnico_id: number;
  tecnico_nombre: string;
  tecnico_rol: string;
  fecha_asignacion: string;
}

export interface SupervisorConTecnicos {
  supervisor_id: number;
  supervisor_nombre: string;
  supervisor_rol: string;
  tecnicos: TecnicoAsignado[];
}

export interface SupervisorActivo {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

export interface TecnicoDisponible {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  especialidad?: string;
}

export interface AsignacionResponse {
  mensaje: string;
  data: {
    id: number;
    supervisorId: number;
    tecnicoId: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ListarResponse {
  mensaje: string;
  data: SupervisorConTecnicos[];
}

export interface SupervisoresActivosResponse {
  mensaje: string;
  data: SupervisorActivo[];
}

export interface TecnicosDisponiblesResponse {
  mensaje: string;
  data: TecnicoDisponible[];
}

export interface EliminarAsignacionResponse {
  mensaje: string;
}

const AsignarTecnicosSupervisoresService = {
  async asignarTecnicoSupervisor(data: AsignacionData): Promise<AsignacionResponse> {
    try {
      const response = await axiosClient.post<AsignacionResponse>('/api/asignarTecnicoSupervisor', data);

      if (response.status !== 201) {
        throw new Error('Error al asignar técnico al supervisor');
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || 'Error al asignar técnico');
      }
      throw error;
    }
  },

  /**
   * Obtiene la lista de supervisores con sus técnicos asignados
   * GET /listarTecnicosSupervisores
   */
  async listarTecnicosSupervisores(): Promise<ListarResponse> {
    try {
      const response = await axiosClient.get<ListarResponse>('/api/listarTecnicosSupervisores');

      if (response.status !== 200) {
        throw new Error('Error al obtener la lista de supervisores y técnicos');
      }

      console.log('Respuesta listarTecnicosSupervisores:', response.data);

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || 'Error al obtener datos');
      }
      throw error;
    }
  },

  /**
   * Lista supervisores activos
   * GET /listarSupervisoresActivos
   */
  async listarSupervisoresActivos(): Promise<SupervisoresActivosResponse> {
    try {
      const response = await axiosClient.get<SupervisoresActivosResponse>('/api/listarSupervisoresActivos');
      if (response.status !== 200) {
        throw new Error('Error al obtener la lista de supervisores activos');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || 'Error al obtener datos');
      }
      throw error;
    }
  },

  /**
   * Lista técnicos disponibles para asignar
   * GET /listarTecnicosDisponibles
   */
  async listarTecnicosDisponibles(): Promise<TecnicosDisponiblesResponse> {
    try {
      const response = await axiosClient.get<TecnicosDisponiblesResponse>('/api/listarTecnicosDisponibles');
      if (response.status !== 200) {
        throw new Error('Error al obtener la lista de técnicos disponibles');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || 'Error al obtener datos');
      }
      throw error;
    }
  },

  /**
   * Elimina una asignación técnico-supervisor
   * DELETE /desasignarTecnicoSupervisor/:tecnicoId
   */
  async eliminarAsignacion(asignacionId: number): Promise<EliminarAsignacionResponse> {
    try {
      const response = await axiosClient.delete<EliminarAsignacionResponse>(`/api/desasignarTecnicoSupervisor/${asignacionId}`);

      if (response.status !== 200) {
        throw new Error('Error al eliminar la asignación');
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || 'Error al eliminar asignación');
      }
      throw error;
    }
  }
};

export default AsignarTecnicosSupervisoresService;