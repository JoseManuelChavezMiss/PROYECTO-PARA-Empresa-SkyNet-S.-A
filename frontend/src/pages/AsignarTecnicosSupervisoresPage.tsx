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
// import { useState, useEffect, useRef } from 'react';
// import { TreeTable } from 'primereact/treetable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Dialog } from 'primereact/dialog';
// import { Toast } from 'primereact/toast';
// import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
// import { Dropdown } from 'primereact/dropdown';
// import AsignarTecnicosSupervisoresService, { type SupervisorActivo, type TecnicoDisponible } from '../services/AsignarTecnicosSupervisoresService';

// // Interfaces para TypeScript
// interface TecnicoNodeData {
//   id: number; // asignacion_id
//   nombre: string;
//   rol: string;
//   tipo: string;
//   fechaAsignacion: string;
//   icon: string;
//   tecnicoId?: number;
// }

// interface SupervisorNodeData {
//   id: number;
//   nombre: string;
//   rol: string;
//   tipo: string;
//   cantidadTecnicos: number;
//   icon: string;
// }

// interface TreeNode {
//   key: string;
//   data: SupervisorNodeData | TecnicoNodeData;
//   children?: TreeNode[];
// }

// interface AsignacionFormData {
//   supervisor_id: number | null;
//   tecnico_id: number | null;
// }

// const AsignarTecnicosSupervisoresPage = () => {
//   const [nodes, setNodes] = useState<TreeNode[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [visibleAsignacion, setVisibleAsignacion] = useState(false);
//   const [supervisoresActivos, setSupervisoresActivos] = useState<SupervisorActivo[]>([]);
//   const [tecnicosDisponibles, setTecnicosDisponibles] = useState<TecnicoDisponible[]>([]);
//   const [formData, setFormData] = useState<AsignacionFormData>({
//     supervisor_id: null,
//     tecnico_id: null
//   });
//   const [cargandoSupervisores, setCargandoSupervisores] = useState(false);
//   const [cargandoTecnicos, setCargandoTecnicos] = useState(false);
//   const toast = useRef<Toast>(null);

//   useEffect(() => {
//     cargarDatos();
//   }, []);

//   const cargarDatos = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const resultado = await AsignarTecnicosSupervisoresService.listarTecnicosSupervisores();
      
//       const nodesTransformados: TreeNode[] = resultado.data.map((supervisor) => ({
//         key: `supervisor-${supervisor.supervisor_id}`,
//         data: {
//           id: supervisor.supervisor_id,
//           nombre: supervisor.supervisor_nombre,
//           rol: supervisor.supervisor_rol,
//           tipo: 'Supervisor',
//           cantidadTecnicos: supervisor.tecnicos.length,
//           icon: 'pi pi-user'
//         },
//         children: supervisor.tecnicos.map((tecnico) => ({
//           key: `asignacion-${tecnico.asignacion_id}`,
//           data: {
//             id: tecnico.asignacion_id, // Usar asignacion_id para eliminar
//             nombre: tecnico.tecnico_nombre,
//             rol: tecnico.tecnico_rol,
//             tipo: 'Técnico',
//             fechaAsignacion: new Date(tecnico.fecha_asignacion).toLocaleDateString('es-ES', {
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric'
//             }),
//             icon: 'pi pi-cog',
//             tecnicoId: tecnico.tecnico_id
//           }
//         }))
//       }));

//       setNodes(nodesTransformados);
      
//       if (toast.current && nodesTransformados.length > 0) {
//         toast.current.show({
//           severity: 'success',
//           summary: 'Datos cargados',
//           detail: `Se cargaron ${nodesTransformados.length} supervisores`,
//           life: 3000
//         });
//       }
//     } catch (err: any) {
//       setError(err.message);
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: err.message,
//           life: 5000
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cargarSupervisoresActivos = async () => {
//     try {
//       setCargandoSupervisores(true);
//       const resultado = await AsignarTecnicosSupervisoresService.listarSupervisoresActivos();
//       setSupervisoresActivos(resultado.data);
//     } catch (err: any) {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Error al cargar supervisores activos: ' + err.message,
//           life: 5000
//         });
//       }
//     } finally {
//       setCargandoSupervisores(false);
//     }
//   };

//   const cargarTecnicosDisponibles = async () => {
//     try {
//       setCargandoTecnicos(true);
//       const resultado = await AsignarTecnicosSupervisoresService.listarTecnicosDisponibles();
//       setTecnicosDisponibles(resultado.data);
//     } catch (err: any) {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Error al cargar técnicos disponibles: ' + err.message,
//           life: 5000
//         });
//       }
//     } finally {
//       setCargandoTecnicos(false);
//     }
//   };

//   const handleAbrirDialogoAsignacion = async () => {
//     setVisibleAsignacion(true);
//     setFormData({ supervisor_id: null, tecnico_id: null });
    
//     await Promise.all([
//       cargarSupervisoresActivos(),
//       cargarTecnicosDisponibles()
//     ]);
//   };

//   const handleAsignarTecnico = async () => {
//     if (!formData.supervisor_id || !formData.tecnico_id) {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'warn',
//           summary: 'Validación',
//           detail: 'Por favor seleccione supervisor y técnico',
//           life: 3000
//         });
//       }
//       return;
//     }

//     try {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'info',
//           summary: 'Procesando',
//           detail: 'Asignando técnico...',
//           life: 2000
//         });
//       }

//       await AsignarTecnicosSupervisoresService.asignarTecnicoSupervisor({
//         supervisor_id: formData.supervisor_id,
//         tecnico_id: formData.tecnico_id
//       });

//       setVisibleAsignacion(false);
//       cargarDatos();
      
//       if (toast.current) {
//         toast.current.show({
//           severity: 'success',
//           summary: 'Éxito',
//           detail: 'Técnico asignado correctamente al supervisor',
//           life: 3000
//         });
//       }
//     } catch (err: any) {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Error al asignar técnico: ' + err.message,
//           life: 5000
//         });
//       }
//     }
//   };

//   const handleSupervisorChange = (supervisorId: number | null) => {
//     setFormData({
//       supervisor_id: supervisorId,
//       tecnico_id: null
//     });
//   };

//   const confirmarEliminacion = (asignacionId: number, tecnicoNombre: string, supervisorNombre: string) => {
//     confirmDialog({
//       message: `¿Estás seguro de que deseas desasignar al técnico "${tecnicoNombre}" del supervisor "${supervisorNombre}"?`,
//       header: 'Confirmar Desasignación',
//       icon: 'pi pi-exclamation-triangle',
//       acceptClassName: 'p-button-danger',
//       accept: () => eliminarAsignacion(asignacionId, tecnicoNombre),
//       reject: () => {}
//     });
//   };

//   const eliminarAsignacion = async (asignacionId: number, tecnicoNombre: string) => {
//     try {
//       await AsignarTecnicosSupervisoresService.eliminarAsignacion(asignacionId);
      
//       cargarDatos();
      
//       if (toast.current) {
//         toast.current.show({
//           severity: 'success',
//           summary: 'Éxito',
//           detail: `Técnico "${tecnicoNombre}" desasignado correctamente`,
//           life: 3000
//         });
//       }
//     } catch (err: any) {
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Error al desasignar técnico: ' + err.message,
//           life: 5000
//         });
//       }
//     }
//   };

//   const nombreTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     return (
//       <div className="flex align-items-center gap-2">
//         <i className={rowData.data.icon}></i>
//         <span>{rowData.data.nombre}</span>
//       </div>
//     );
//   };

//   const tipoTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const tipo = rowData.data.tipo;
//     const badgeClass = tipo === 'Supervisor' 
//       ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
//       : 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs';
    
//     return <span className={badgeClass}>{tipo}</span>;
//   };

//   const cantidadTecnicosTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const data = rowData.data as SupervisorNodeData;
//     return data.tipo === 'Supervisor' 
//       ? <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-bold">{data.cantidadTecnicos}</span>
//       : '-';
//   };

//   const fechaAsignacionTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const data = rowData.data as TecnicoNodeData;
//     return data.tipo === 'Técnico' ? data.fechaAsignacion : '-';
//   };

//   const accionesTemplate = (rowData: {
//     key: string; data: SupervisorNodeData | TecnicoNodeData 
// }) => {
//     const data = rowData.data;
    
//     if (data.tipo === 'Técnico') {
//       const supervisorPadre = nodes.find(supervisor => 
//         supervisor.children?.some(tecnico => tecnico.key === rowData.key)
//       );
      
//       return (
//         <Button
//           icon="pi pi-trash"
//           className="p-button-danger p-button-outlined p-button-sm"
//           tooltip="Desasignar técnico"
//           tooltipOptions={{ position: 'top' }}
//           onClick={() => confirmarEliminacion(
//             data.id, // asignacion_id
//             data.nombre,
//             supervisorPadre?.data.nombre || 'Supervisor'
//           )}
//         />
//       );
//     }
    
//     return null;
//   };

//   const AsignacionForm = () => (
//     <div className="p-fluid">
//       <div className="field">
//         <label htmlFor="supervisor" className="font-medium">Supervisor *</label>
//         <Dropdown
//           id="supervisor"
//           value={formData.supervisor_id}
//           options={supervisoresActivos.map(sup => ({
//             label: `${sup.nombre} - ${sup.rol}`,
//             value: sup.id
//           }))}
//           onChange={(e) => handleSupervisorChange(e.value)}
//           placeholder="Seleccionar supervisor"
//           loading={cargandoSupervisores}
//           filter
//           showClear
//           className="w-full"
//           filterPlaceholder="Buscar supervisor..."
//         />
//         <small className="text-gray-500">
//           {supervisoresActivos.length} supervisores disponibles
//         </small>
//       </div>
      
//       <div className="field">
//         <label htmlFor="tecnico" className="font-medium">Técnico *</label>
//         <Dropdown
//           id="tecnico"
//           value={formData.tecnico_id}
//           options={tecnicosDisponibles.map(tec => ({
//             label: `${tec.nombre} - ${tec.rol}${tec.especialidad ? ` (${tec.especialidad})` : ''}`,
//             value: tec.id
//           }))}
//           onChange={(e) => setFormData({ ...formData, tecnico_id: e.value })}
//           placeholder={formData.supervisor_id ? "Seleccionar técnico" : "Primero seleccione un supervisor"}
//           disabled={!formData.supervisor_id || cargandoTecnicos}
//           loading={cargandoTecnicos}
//           filter
//           showClear
//           className="w-full"
//           filterPlaceholder="Buscar técnico..."
//         />
//         <small className="text-gray-500">
//           {tecnicosDisponibles.length} técnicos disponibles para asignar
//         </small>
//       </div>

//       {formData.supervisor_id && formData.tecnico_id && (
//         <div className="p-3 border-round bg-blue-50 text-blue-800 mt-3">
//           <div className="flex align-items-center gap-2">
//             <i className="pi pi-info-circle"></i>
//             <span className="text-sm">
//               Se asignará el técnico seleccionado al supervisor {supervisoresActivos.find(s => s.id === formData.supervisor_id)?.nombre}
//             </span>
//           </div>
//         </div>
//       )}

//       <div className="flex justify-content-end gap-2 mt-4">
//         <Button 
//           label="Cancelar" 
//           icon="pi pi-times" 
//           className="p-button-text" 
//           onClick={() => setVisibleAsignacion(false)} 
//         />
//         <Button 
//           label="Asignar Técnico" 
//           icon="pi pi-user-plus" 
//           onClick={handleAsignarTecnico}
//           disabled={!formData.supervisor_id || !formData.tecnico_id}
//           loading={cargandoTecnicos || cargandoSupervisores}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className="surface-ground min-h-screen p-4">
//       <h2 className="text-xl font-bold mb-4">Gestión de Asignaciones Supervisor-Técnico</h2>

//       <ConfirmDialog />
//       <Toast ref={toast} position="top-right" />

//       <div className="mb-4 flex gap-2">
//         <Button 
//           icon="pi pi-plus"
//           className="p-button"
//           onClick={handleAbrirDialogoAsignacion}
//           label="Nueva Asignación"
//         />
//         <Button 
//           icon="pi pi-refresh"
//           className="p-button-outlined"
//           onClick={cargarDatos}
//           label="Actualizar"
//           disabled={loading}
//         />
//       </div>

//       <Dialog
//         header="Nueva Asignación Técnico-Supervisor"
//         visible={visibleAsignacion}
//         modal
//         style={{ width: '50vw' }}
//         onHide={() => setVisibleAsignacion(false)}
//         className="min-w-30rem"
//       >
//         <AsignacionForm />
//       </Dialog>

//       <div>
//         {loading ? (
//           <div className="flex justify-content-center align-items-center p-4">
//             <i className="pi pi-spin pi-spinner mr-2"></i>
//             <p>Cargando asignaciones...</p>
//           </div>
//         ) : error ? (
//           <div className="p-4 border-round bg-red-50 text-red-700 flex justify-content-between align-items-center">
//             <div>
//               <i className="pi pi-exclamation-triangle mr-2"></i>
//               <span>Error: {error}</span>
//             </div>
//             <Button 
//               icon="pi pi-refresh" 
//               label="Reintentar" 
//               onClick={cargarDatos}
//               className="p-button-outlined p-button-sm"
//             />
//           </div>
//         ) : (
//           <div className="card">
//             <TreeTable 
//               value={nodes} 
//               paginator 
//               rows={10}
//               rowsPerPageOptions={[5, 10, 25]}
//               tableStyle={{ minWidth: '70rem' }}
//               emptyMessage="No se encontraron asignaciones de técnicos a supervisores"
//               className="p-treetable-sm"
//             >
//               <Column 
//                 field="nombre" 
//                 header="Nombre" 
//                 expander 
//                 style={{ width: '25%' }}
//                 body={nombreTemplate}
//               ></Column>
//               <Column field="rol" header="Rol" style={{ width: '20%' }}></Column>
//               <Column 
//                 field="tipo" 
//                 header="Tipo" 
//                 style={{ width: '15%' }}
//                 body={tipoTemplate}
//               ></Column>
//               <Column 
//                 field="cantidadTecnicos" 
//                 header="Técnicos" 
//                 style={{ width: '10%' }}
//                 body={cantidadTecnicosTemplate}
//               ></Column>
//               <Column 
//                 field="fechaAsignacion" 
//                 header="Fecha Asignación" 
//                 style={{ width: '20%' }}
//                 body={fechaAsignacionTemplate}
//               ></Column>
//               <Column 
//                 header="Acciones" 
//                 style={{ width: '10%' }}
//                 body={accionesTemplate}
//               ></Column>
//             </TreeTable>

//             <div className="mt-4 p-3 border-round bg-gray-50 flex justify-content-between">
//               <div>
//                 <strong>Resumen:</strong> 
//                 <span className="ml-2">{nodes.length} supervisores</span>
//                 <span className="mx-2">•</span>
//                 <span>{nodes.reduce((total, supervisor) => total + (supervisor.children?.length || 0), 0)} técnicos asignados</span>
//               </div>
//               <div className="text-sm text-gray-500">
//                 Última actualización: {new Date().toLocaleTimeString()}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AsignarTecnicosSupervisoresPage;
// import { useState, useEffect, useRef } from 'react';
// import { TreeTable } from 'primereact/treetable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Dialog } from 'primereact/dialog';
// import { Toast } from 'primereact/toast';
// import { ConfirmDialog } from 'primereact/confirmdialog';
// import AsignarTecnicosSupervisoresService from '../services/AsignarTecnicosSupervisoresService';

// // Interfaces para TypeScript
// interface TecnicoNodeData {
//   id: number;
//   nombre: string;
//   rol: string;
//   tipo: string;
//   fechaAsignacion: string;
//   icon: string;
// }

// interface SupervisorNodeData {
//   id: number;
//   nombre: string;
//   rol: string;
//   tipo: string;
//   cantidadTecnicos: number;
//   icon: string;
// }

// interface TreeNode {
//   key: string;
//   data: SupervisorNodeData | TecnicoNodeData;
//   children?: TreeNode[];
// }

// const AsignarTecnicosSupervisoresPage = () => {
//   const [nodes, setNodes] = useState<TreeNode[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [visibleAsignacion, setVisibleAsignacion] = useState(false);
//   const toast = useRef<Toast>(null);

//   useEffect(() => {
//     cargarDatos();
//   }, []);

//   const cargarDatos = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const resultado = await AsignarTecnicosSupervisoresService.listarTecnicosSupervisores();
      
//       const nodesTransformados: TreeNode[] = resultado.data.map((supervisor) => ({
//         key: supervisor.supervisor_id.toString(),
//         data: {
//           id: supervisor.supervisor_id,
//           nombre: supervisor.supervisor_nombre,
//           rol: supervisor.supervisor_rol,
//           tipo: 'Supervisor',
//           cantidadTecnicos: supervisor.tecnicos.length,
//           icon: 'pi pi-user'
//         },
//         children: supervisor.tecnicos.map((tecnico) => ({
//           key: `${supervisor.supervisor_id}-${tecnico.tecnico_id}`,
//           data: {
//             id: tecnico.tecnico_id,
//             nombre: tecnico.tecnico_nombre,
//             rol: tecnico.tecnico_rol,
//             tipo: 'Técnico',
//             fechaAsignacion: new Date(tecnico.fecha_asignacion).toLocaleDateString('es-ES', {
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric'
//             }),
//             icon: 'pi pi-cog'
//           }
//         }))
//       }));

//       setNodes(nodesTransformados);
      
//       if (toast.current && nodesTransformados.length > 0) {
//         toast.current.show({
//           severity: 'success',
//           summary: 'Datos cargados',
//           detail: `Se cargaron ${nodesTransformados.length} supervisores`,
//           life: 3000
//         });
//       }
//     } catch (err: any) {
//       setError(err.message);
//       if (toast.current) {
//         toast.current.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: err.message,
//           life: 5000
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nombreTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     return (
//       <div className="flex align-items-center gap-2">
//         <i className={rowData.data.icon}></i>
//         <span>{rowData.data.nombre}</span>
//       </div>
//     );
//   };

//   const tipoTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const tipo = rowData.data.tipo;
//     const badgeClass = tipo === 'Supervisor' 
//       ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
//       : 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs';
    
//     return <span className={badgeClass}>{tipo}</span>;
//   };

//   const cantidadTecnicosTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const data = rowData.data as SupervisorNodeData;
//     return data.tipo === 'Supervisor' 
//       ? <strong>{data.cantidadTecnicos}</strong>
//       : '-';
//   };

//   const fechaAsignacionTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
//     const data = rowData.data as TecnicoNodeData;
//     return data.tipo === 'Técnico' ? data.fechaAsignacion : '-';
//   };

//   const handleAsignacionExitosa = () => {
//     setVisibleAsignacion(false);
//     cargarDatos();
//     if (toast.current) {
//       toast.current.show({
//         severity: 'success',
//         summary: 'Éxito',
//         detail: 'Técnico asignado correctamente',
//         life: 3000
//       });
//     }
//   };

//   // Diálogo para asignar técnico (puedes crear un componente separado para el formulario)
//   const AsignacionForm = () => (
//     <div className="p-fluid">
//       <div className="field">
//         <label htmlFor="supervisor">Supervisor</label>
//         <select id="supervisor" className="p-inputtext">
//           <option value="">Seleccionar supervisor</option>
//           {/* Aquí irían las opciones de supervisores */}
//         </select>
//       </div>
//       <div className="field">
//         <label htmlFor="tecnico">Técnico</label>
//         <select id="tecnico" className="p-inputtext">
//           <option value="">Seleccionar técnico</option>
//           {/* Aquí irían las opciones de técnicos disponibles */}
//         </select>
//       </div>
//       <div className="flex justify-content-end gap-2 mt-4">
//         <Button 
//           label="Cancelar" 
//           icon="pi pi-times" 
//           className="p-button-text" 
//           onClick={() => setVisibleAsignacion(false)} 
//         />
//         <Button 
//           label="Asignar" 
//           icon="pi pi-check" 
//           onClick={handleAsignacionExitosa} 
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className="surface-ground min-h-screen p-4">
//       <h2 className="text-xl font-bold mb-4">Gestión de Asignaciones Supervisor-Técnico</h2>

//       {/* Confirm Dialog para acciones */}
//       <ConfirmDialog />

//       <Toast ref={toast} position="top-right" />

//       <div className="mb-4">
//         <Button 
//           icon="pi pi-plus"
//           className="p-button"
//           onClick={() => setVisibleAsignacion(true)}
//           label="Nueva Asignación"
//         />
//       </div>

//       {/* Diálogo para Nueva Asignación */}
//       <Dialog
//         header="Nueva Asignación Técnico-Supervisor"
//         visible={visibleAsignacion}
//         modal
//         style={{ width: '50vw' }}
//         onHide={() => setVisibleAsignacion(false)}
//       >
//         <AsignacionForm />
//       </Dialog>

//       {/* TreeTable de asignaciones */}
//       <div>
//         {loading ? (
//           <div className="flex justify-content-center align-items-center p-4">
//             <i className="pi pi-spin pi-spinner mr-2"></i>
//             <p>Cargando asignaciones...</p>
//           </div>
//         ) : error ? (
//           <div className="p-4 border-round bg-red-50 text-red-700 flex justify-content-between align-items-center">
//             <div>
//               <i className="pi pi-exclamation-triangle mr-2"></i>
//               <span>Error: {error}</span>
//             </div>
//             <Button 
//               icon="pi pi-refresh" 
//               label="Reintentar" 
//               onClick={cargarDatos}
//               className="p-button-outlined p-button-sm"
//             />
//           </div>
//         ) : (
//           <div className="card">
//             <TreeTable 
//               value={nodes} 
//               paginator 
//               rows={10}
//               rowsPerPageOptions={[5, 10, 25]}
//               tableStyle={{ minWidth: '60rem' }}
//               emptyMessage="No se encontraron asignaciones de técnicos a supervisores"
//               className="p-treetable-sm"
//             >
//               <Column 
//                 field="nombre" 
//                 header="Nombre" 
//                 expander 
//                 style={{ width: '35%' }}
//                 body={nombreTemplate}
//               ></Column>
//               <Column field="rol" header="Rol" style={{ width: '20%' }}></Column>
//               <Column 
//                 field="tipo" 
//                 header="Tipo" 
//                 style={{ width: '15%' }}
//                 body={tipoTemplate}
//               ></Column>
//               <Column 
//                 field="cantidadTecnicos" 
//                 header="Técnicos" 
//                 style={{ width: '15%' }}
//                 body={cantidadTecnicosTemplate}
//               ></Column>
//               <Column 
//                 field="fechaAsignacion" 
//                 header="Fecha Asignación" 
//                 style={{ width: '20%' }}
//                 body={fechaAsignacionTemplate}
//               ></Column>
//             </TreeTable>

//             <div className="mt-4 p-3 border-round bg-gray-50 flex justify-content-between">
//               <div>
//                 <strong>Resumen:</strong> 
//                 <span className="ml-2">{nodes.length} supervisores</span>
//                 <span className="mx-2">•</span>
//                 <span>{nodes.reduce((total, supervisor) => total + (supervisor.children?.length || 0), 0)} técnicos asignados</span>
//               </div>
//               <div className="text-sm text-gray-500">
//                 Última actualización: {new Date().toLocaleTimeString()}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AsignarTecnicosSupervisoresPage;