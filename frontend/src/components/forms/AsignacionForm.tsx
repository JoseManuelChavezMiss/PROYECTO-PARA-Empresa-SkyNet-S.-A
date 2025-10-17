import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { type AsignacionFormProps } from '../types/asignaciones';

const AsignacionForm = ({
  formData,
  supervisoresActivos,
  tecnicosDisponibles,
  cargandoSupervisores,
  cargandoTecnicos,
  onFormChange,
  onAsignar,
  onCancel
}: AsignacionFormProps) => {
  const handleSupervisorChange = (supervisorId: number | null) => {
    onFormChange({
      supervisor_id: supervisorId,
      tecnico_id: null
    });
  };

  const handleTecnicoChange = (tecnicoId: number | null) => {
    onFormChange({
      ...formData,
      tecnico_id: tecnicoId
    });
  };

  return (
    <div className="p-fluid">
      <div className="field">
        <label htmlFor="supervisor" className="font-medium">Supervisor *</label>
        <Dropdown
          id="supervisor"
          value={formData.supervisor_id}
          options={supervisoresActivos.map(sup => ({
            label: `${sup.nombre} - ${sup.rol}`,
            value: sup.id
          }))}
          onChange={(e) => handleSupervisorChange(e.value)}
          placeholder="Seleccionar supervisor"
          loading={cargandoSupervisores}
          filter
          showClear
          className="w-full"
          filterPlaceholder="Buscar supervisor..."
        />
        <small className="text-gray-500">
          {supervisoresActivos.length} supervisores disponibles
        </small>
      </div>
      
      <div className="field">
        <label htmlFor="tecnico" className="font-medium">Técnico *</label>
        <Dropdown
          id="tecnico"
          value={formData.tecnico_id}
          options={tecnicosDisponibles.map(tec => ({
            label: `${tec.nombre} - ${tec.rol}${tec.especialidad ? ` (${tec.especialidad})` : ''}`,
            value: tec.id
          }))}
          onChange={(e) => handleTecnicoChange(e.value)}
          placeholder={formData.supervisor_id ? "Seleccionar técnico" : "Primero seleccione un supervisor"}
          disabled={!formData.supervisor_id || cargandoTecnicos}
          loading={cargandoTecnicos}
          filter
          showClear
          className="w-full"
          filterPlaceholder="Buscar técnico..."
        />
        <small className="text-gray-500">
          {tecnicosDisponibles.length} técnicos disponibles para asignar
        </small>
      </div>

      {formData.supervisor_id && formData.tecnico_id && (
        <div className="p-3 border-round bg-blue-50 text-blue-800 mt-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-info-circle"></i>
            <span className="text-sm">
              Se asignará el técnico seleccionado al supervisor {supervisoresActivos.find(s => s.id === formData.supervisor_id)?.nombre}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-content-end gap-2 mt-4">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          className="p-button-text" 
          onClick={onCancel}
        />
        <Button 
          label="Asignar Técnico" 
          icon="pi pi-user-plus" 
          onClick={onAsignar}
          disabled={!formData.supervisor_id || !formData.tecnico_id}
          loading={cargandoTecnicos || cargandoSupervisores}
        />
      </div>
    </div>
  );
};

export default AsignacionForm;