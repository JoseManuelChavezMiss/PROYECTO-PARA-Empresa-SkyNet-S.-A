import { type SupervisorActivo, type TecnicoDisponible } from '../../services/AsignarTecnicosSupervisoresService';

export interface TecnicoNodeData {
  id: number;
  nombre: string;
  rol: string;
  tipo: string;
  fechaAsignacion: string;
  icon: string;
  tecnicoId?: number;
}

export interface SupervisorNodeData {
  id: number;
  nombre: string;
  rol: string;
  tipo: string;
  cantidadTecnicos: number;
  icon: string;
}

export interface TreeNode {
  key: string;
  data: SupervisorNodeData | TecnicoNodeData;
  children?: TreeNode[];
}

export interface AsignacionFormData {
  supervisor_id: number | null;
  tecnico_id: number | null;
}

export interface AsignacionFormProps {
  formData: AsignacionFormData;
  supervisoresActivos: SupervisorActivo[];
  tecnicosDisponibles: TecnicoDisponible[];
  cargandoSupervisores: boolean;
  cargandoTecnicos: boolean;
  onFormChange: (data: AsignacionFormData) => void;
  onAsignar: () => void;
  onCancel: () => void;
}

export interface TreeTableAsignacionesProps {
  nodes: TreeNode[];
  onEliminarAsignacion: (asignacionId: number, tecnicoNombre: string, supervisorNombre: string) => void;
}