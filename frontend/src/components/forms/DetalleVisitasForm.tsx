import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { crearDetalleVisita, type CrearDetalleVisitaPayload, type EstadoDetalleVisita } from '../../services/VisitasService';
import { Toast } from 'primereact/toast'
import ReportesVisitaForm, { type ReportesVisitaFormHandle } from './ReportesVisitaForm';

export interface VisitaParaForm {
  id_visita: string;
  estado_visita: string;
  fecha_programada: string;
  hora_programada: string;
  observaciones?: string;
  email?: string;
}

interface DetalleVisitasFormProps {
  visita: VisitaParaForm | null;
}

const DetalleVisitasForm: React.FC<DetalleVisitasFormProps> = ({ visita }) => {
  const [idVisita, setIdVisita] = useState('');
  const [email, setEmail] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState<EstadoDetalleVisita | null>(null)
  const [fechaHora, setFechaHora] = useState<Date | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const toast = useRef(null);
  const reporteRef = useRef<ReportesVisitaFormHandle | null>(null)

  useEffect(() => {
    if (visita) {
      setIdVisita(visita.id_visita)
      setEmail(visita.email || '')
      console.log('Cargando visita en formulario:', visita)
      const isEstadoDetalle = (v: string): v is EstadoDetalleVisita =>
        ['En Progreso', 'Completada', 'Cancelada'].includes(v)
      setTipoRegistro(isEstadoDetalle(visita.estado_visita) ? visita.estado_visita : null)
      setObservaciones(visita.observaciones || '')
      setFechaHora(new Date())
    } else {
      setIdVisita('')
      setTipoRegistro(null)
      setFechaHora(null)
      setObservaciones('')
    }
  }, [visita])

  const tiposDeRegistro: { label: string; value: EstadoDetalleVisita }[] = [
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Completada', value: 'Completada' },
    { label: 'Cancelada', value: 'Cancelada' }
  ]

  const showSuccess = () => {
    // @ts-ignore
    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Detalle de visita creado', life: 3000 });
  }

  const showError = () => {
    // @ts-ignore
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al crear detalle de visita', life: 3000 });
  }

  const guardarDatos = async () => {
    if (!tipoRegistro) {
      console.error('Seleccione un tipo de registro')
      return
    }
    if (!fechaHora) {
      console.error('Fecha/hora no válida')
      return
    }

    const payload: CrearDetalleVisitaPayload = {
      idVisita: Number(idVisita),
      tipoRegistro,
      fechaHora: fechaHora.toISOString(),
      observaciones: observaciones || null
    }

    console.log('Enviando:', payload)
    const resp = await crearDetalleVisita(payload)
    if (resp.ok) {
      showSuccess()
    } else {
      showError()
    }
    if (tipoRegistro === 'Completada') {
        debugger
      const rep = await reporteRef.current?.submit()
      if (!rep?.ok) {
        showError()
        return
      }
    }
  }
  return (
    <div className="p-fluid">
      <Toast ref={toast} />
      <div className="p-field mb-3">
        <label htmlFor="idvisita">ID Visita</label>
        <InputText id="idvisita" value={idVisita} disabled />
      </div>
      <div className="p-field mb-3">
        <label htmlFor="tipo_registro">Estado de la Visita</label>
        <Dropdown id="tipo_registro" value={tipoRegistro} options={tiposDeRegistro} onChange={(e) => setTipoRegistro(e.value)} placeholder="Seleccione un estado" />
      </div>
      {tipoRegistro === 'Completada' && (
        <div className="card p-3 my-3" style={{ border: '1px solid #ddd', borderRadius: '6px' }}>
          <ReportesVisitaForm ref={reporteRef} numero={Number(idVisita)} email={email} />
        </div>
      )}
      <div className="p-field mb-3">
        <label htmlFor="fecha_hora">Fecha y Hora</label>
        <Calendar id="fecha_hora" value={fechaHora} onChange={(e) => setFechaHora(e.value as Date | null)} showTime hourFormat="24" disabled />
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