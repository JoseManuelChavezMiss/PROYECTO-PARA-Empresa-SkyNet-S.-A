import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import AsignarTecnicosSupervisoresService, { type SupervisorActivo, type TecnicoDisponible } from '../services/AsignarTecnicosSupervisoresService';
import TreeTableAsignaciones from '../components/TreeTableAsignaciones';
import { 
  type TreeNode, 
  type AsignacionFormData,
} from '../components/types/asignaciones';
import AsignacionForm from '../components/forms/AsignacionForm';
import { ErrorState, LoadingState } from '../components/LoadingState';

const AsignarTecnicosSupervisoresPage = () => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleAsignacion, setVisibleAsignacion] = useState(false);
  const [supervisoresActivos, setSupervisoresActivos] = useState<SupervisorActivo[]>([]);
  const [tecnicosDisponibles, setTecnicosDisponibles] = useState<TecnicoDisponible[]>([]);
  const [formData, setFormData] = useState<AsignacionFormData>({
    supervisor_id: null,
    tecnico_id: null
  });
  const [cargandoSupervisores, setCargandoSupervisores] = useState(false);
  const [cargandoTecnicos, setCargandoTecnicos] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await AsignarTecnicosSupervisoresService.listarTecnicosSupervisores();
      
      const nodesTransformados: TreeNode[] = resultado.data.map((supervisor) => ({
        key: `supervisor-${supervisor.supervisor_id}`,
        data: {
          id: supervisor.supervisor_id,
          nombre: supervisor.supervisor_nombre,
          rol: supervisor.supervisor_rol,
          tipo: 'Supervisor',
          cantidadTecnicos: supervisor.tecnicos.length,
          icon: 'pi pi-user'
        },
        children: supervisor.tecnicos.map((tecnico) => ({
          key: `asignacion-${tecnico.asignacion_id}`,
          data: {
            id: tecnico.asignacion_id,
            nombre: tecnico.tecnico_nombre,
            rol: tecnico.tecnico_rol,
            tipo: 'Técnico',
            fechaAsignacion: new Date(tecnico.fecha_asignacion).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            icon: 'pi pi-cog',
            tecnicoId: tecnico.tecnico_id
          }
        }))
      }));

      setNodes(nodesTransformados);
      
      if (toast.current && nodesTransformados.length > 0) {
        toast.current.show({
          severity: 'success',
          summary: 'Datos cargados',
          detail: `Se cargaron ${nodesTransformados.length} supervisores`,
          life: 3000
        });
      }
    } catch (err: any) {
      setError(err.message);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message,
          life: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarSupervisoresActivos = async () => {
    try {
      setCargandoSupervisores(true);
      const resultado = await AsignarTecnicosSupervisoresService.listarSupervisoresActivos();
      setSupervisoresActivos(resultado.data);
    } catch (err: any) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar supervisores activos: ' + err.message,
          life: 5000
        });
      }
    } finally {
      setCargandoSupervisores(false);
    }
  };

  const cargarTecnicosDisponibles = async () => {
    try {
      setCargandoTecnicos(true);
      const resultado = await AsignarTecnicosSupervisoresService.listarTecnicosDisponibles();
      setTecnicosDisponibles(resultado.data);
    } catch (err: any) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar técnicos disponibles: ' + err.message,
          life: 5000
        });
      }
    } finally {
      setCargandoTecnicos(false);
    }
  };

  const handleAbrirDialogoAsignacion = async () => {
    setVisibleAsignacion(true);
    setFormData({ supervisor_id: null, tecnico_id: null });
    
    await Promise.all([
      cargarSupervisoresActivos(),
      cargarTecnicosDisponibles()
    ]);
  };

  const handleAsignarTecnico = async () => {
    if (!formData.supervisor_id || !formData.tecnico_id) {
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Validación',
          detail: 'Por favor seleccione supervisor y técnico',
          life: 3000
        });
      }
      return;
    }

    try {
      if (toast.current) {
        toast.current.show({
          severity: 'info',
          summary: 'Procesando',
          detail: 'Asignando técnico...',
          life: 2000
        });
      }

      await AsignarTecnicosSupervisoresService.asignarTecnicoSupervisor({
        supervisor_id: formData.supervisor_id,
        tecnico_id: formData.tecnico_id
      });

      setVisibleAsignacion(false);
      cargarDatos();
      
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Técnico asignado correctamente al supervisor',
          life: 3000
        });
      }
    } catch (err: any) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al asignar técnico: ' + err.message,
          life: 5000
        });
      }
    }
  };

  const handleFormChange = (newFormData: AsignacionFormData) => {
    setFormData(newFormData);
  };

  const confirmarEliminacion = (asignacionId: number, tecnicoNombre: string, supervisorNombre: string) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas desasignar al técnico "${tecnicoNombre}" del supervisor "${supervisorNombre}"?`,
      header: 'Confirmar Desasignación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => eliminarAsignacion(asignacionId, tecnicoNombre),
      reject: () => {}
    });
  };

  const eliminarAsignacion = async (asignacionId: number, tecnicoNombre: string) => {
    try {
      await AsignarTecnicosSupervisoresService.eliminarAsignacion(asignacionId);
      
      cargarDatos();
      
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: `Técnico "${tecnicoNombre}" desasignado correctamente`,
          life: 3000
        });
      }
    } catch (err: any) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al desasignar técnico: ' + err.message,
          life: 5000
        });
      }
    }
  };

  return (
    <div className="surface-ground min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Asignaciones Supervisor-Técnico</h2>

      <ConfirmDialog />
      <Toast ref={toast} position="top-right" />

      <div className="mb-4 flex gap-2">
        <Button 
          icon="pi pi-plus"
          className="p-button"
          onClick={handleAbrirDialogoAsignacion}
          label="Nueva Asignación"
        />
        <Button 
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={cargarDatos}
          label="Actualizar"
          disabled={loading}
        />
      </div>

      <Dialog
        header="Nueva Asignación Técnico-Supervisor"
        visible={visibleAsignacion}
        modal
        style={{ width: '50vw' }}
        onHide={() => setVisibleAsignacion(false)}
        className="min-w-30rem"
      >
        <AsignacionForm
          formData={formData}
          supervisoresActivos={supervisoresActivos}
          tecnicosDisponibles={tecnicosDisponibles}
          cargandoSupervisores={cargandoSupervisores}
          cargandoTecnicos={cargandoTecnicos}
          onFormChange={handleFormChange}
          onAsignar={handleAsignarTecnico}
          onCancel={() => setVisibleAsignacion(false)}
        />
      </Dialog>

      <div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={cargarDatos} />
        ) : (
          <TreeTableAsignaciones 
            nodes={nodes} 
            onEliminarAsignacion={confirmarEliminacion}
          />
        )}
      </div>
    </div>
  );
};

export default AsignarTecnicosSupervisoresPage;