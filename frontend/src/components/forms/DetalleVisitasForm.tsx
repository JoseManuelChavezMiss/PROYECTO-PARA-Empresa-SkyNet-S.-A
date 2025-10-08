import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

// PASO 1: Define una nueva interface local para el formulario.
// Esta es la "forma" de los datos que este componente espera.
// La exportamos para poder usarla en el componente padre.
export interface VisitaParaForm {
  id_visita: string; // La propiedad que faltaba en el tipo del servicio
  estado_visita: string;
  fecha_programada: string;
  hora_programada: string;
  observaciones?: string; // Opcional
}

// PASO 2: La interfaz de las props ahora usa nuestra nueva interface local.
interface DetalleVisitasFormProps {
  visita: VisitaParaForm | null;
}

const DetalleVisitasForm: React.FC<DetalleVisitasFormProps> = ({ visita }) => {
  // El resto del componente funciona perfectamente porque la prop `visita`
  // ahora coincide con la `VisitaParaForm` que sí tiene `id_visita`.
  const [idVisita, setIdVisita] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState<string | null>(null);
  const [fechaHora, setFechaHora] = useState<Date | null>(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (visita) {
      setIdVisita(visita.id_visita);
      setTipoRegistro(visita.estado_visita);
      setObservaciones(visita.observaciones || '');

    //   const fechaISO = visita.fecha_programada.split('T')[0];
    //   const fechaCompleta = new Date(`${fechaISO}T${visita.hora_programada}`);
      setFechaHora(new Date());
    } else {
      setIdVisita('');
      setTipoRegistro(null);
      setFechaHora(null);
      setObservaciones('');
    }
  }, [visita]);

  const tiposDeRegistro = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Completada', value: 'Completada' },
    { label: 'Cancelada', value: 'Cancelada' }
  ];

  const guardarDatos = () => {
    const datos = {
      id_visita: idVisita,
      estado_visita: tipoRegistro,
      fecha_hora: fechaHora ? fechaHora.toISOString() : null,
      observaciones: observaciones
    };
    console.log('Datos a guardar:', datos);
  };

  return (
    <div className="p-fluid">
        {/* Tu JSX no necesita cambios */}
        <div className="p-field mb-3">
            <label htmlFor="idvisita">ID Visita</label>
            <InputText id="idvisita" value={idVisita} disabled />
        </div>
        <div className="p-field mb-3">
            <label htmlFor="tipo_registro">Estado de la Visita</label>
            <Dropdown id="tipo_registro" value={tipoRegistro} options={tiposDeRegistro} onChange={(e) => setTipoRegistro(e.value)} placeholder="Seleccione un estado" />
        </div>
        <div className="p-field mb-3">
            <label htmlFor="fecha_hora">Fecha y Hora</label>
            <Calendar id="fecha_hora" value={fechaHora} onChange={(e) => setFechaHora(e.value as Date | null)} showTime hourFormat="24" disabled/>
        </div>
        <div className="p-field mb-3">
            <label htmlFor="observaciones">Observaciones</label>
            <InputTextarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={4} />
        </div>
        <div className="p-d-flex p-jc-end">
            <Button label="Guardar Cambios" icon="pi pi-check" onClick={guardarDatos} />
        </div>
    </div>
  );
}

export default DetalleVisitasForm;