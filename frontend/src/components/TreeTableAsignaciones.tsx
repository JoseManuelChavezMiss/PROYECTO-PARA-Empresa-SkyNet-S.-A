import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { type TreeTableAsignacionesProps, type TreeNode, type SupervisorNodeData, type TecnicoNodeData } from '../components/types/asignaciones';

const TreeTableAsignaciones = ({ nodes, onEliminarAsignacion }: TreeTableAsignacionesProps) => {
  const nombreTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={rowData.data.icon}></i>
        <span>{rowData.data.nombre}</span>
      </div>
    );
  };

  const tipoTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
    const tipo = rowData.data.tipo;
    const badgeClass = tipo === 'Supervisor' 
      ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
      : 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs';
    
    return <span className={badgeClass}>{tipo}</span>;
  };

  const cantidadTecnicosTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
    const data = rowData.data as SupervisorNodeData;
    return data.tipo === 'Supervisor' 
      ? <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-bold">{data.cantidadTecnicos}</span>
      : '-';
  };

  const fechaAsignacionTemplate = (rowData: { data: SupervisorNodeData | TecnicoNodeData }) => {
    const data = rowData.data as TecnicoNodeData;
    return data.tipo === 'Técnico' ? data.fechaAsignacion : '-';
  };

  const accionesTemplate = (rowData: { key: string; data: SupervisorNodeData | TecnicoNodeData }) => {
    const data = rowData.data;
    
    if (data.tipo === 'Técnico') {
      const supervisorPadre = nodes.find(supervisor => 
        supervisor.children?.some(tecnico => tecnico.key === rowData.key)
      );
      
      return (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-outlined p-button-sm"
          tooltip="Desasignar técnico"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEliminarAsignacion(
            data.id, // asignacion_id
            data.nombre,
            supervisorPadre?.data.nombre || 'Supervisor'
          )}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="card">
      <TreeTable 
        value={nodes} 
        paginator 
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        tableStyle={{ minWidth: '70rem' }}
        emptyMessage="No se encontraron asignaciones de técnicos a supervisores"
        className="p-treetable-sm"
      >
        <Column 
          field="nombre" 
          header="Nombre" 
          expander 
          style={{ width: '25%' }}
          body={nombreTemplate}
        />
        <Column field="rol" header="Rol" style={{ width: '20%' }} />
        <Column 
          field="tipo" 
          header="Tipo" 
          style={{ width: '15%' }}
          body={tipoTemplate}
        />
        <Column 
          field="cantidadTecnicos" 
          header="Técnicos" 
          style={{ width: '10%' }}
          body={cantidadTecnicosTemplate}
        />
        <Column 
          field="fechaAsignacion" 
          header="Fecha Asignación" 
          style={{ width: '20%' }}
          body={fechaAsignacionTemplate}
        />
        <Column 
          header="Acciones" 
          style={{ width: '10%' }}
          body={accionesTemplate}
        />
      </TreeTable>

      <div className="mt-4 p-3 border-round bg-gray-50 flex justify-content-between">
        <div>
          <strong>Resumen:</strong> 
          <span className="ml-2">{nodes.length} supervisores</span>
          <span className="mx-2">•</span>
          <span>{nodes.reduce((total, supervisor) => total + (supervisor.children?.length || 0), 0)} técnicos asignados</span>
        </div>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default TreeTableAsignaciones;