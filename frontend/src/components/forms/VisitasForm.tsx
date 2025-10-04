import { use, useEffect, useRef, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { listarSupervisores, listarTecnicos, listarClientesVisitas, crearVisita } from '../../services/VisitasService'
import type { EntidadListado, EstadoVisita } from '../../services/VisitasService'
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from 'primereact/toast';
const estados = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Progreso', value: 'En Progreso' },
  { label: 'Completada', value: 'Completada' },
  { label: 'Cancelada', value: 'Cancelada' },
]

const VisitasForm = () => {
  const [supervisores, setSupervisores] = useState<EntidadListado[]>([])
  const [tecnicos, setTecnicos] = useState<EntidadListado[]>([])
  const [clientes, setClientes] = useState<EntidadListado[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useRef(null);

  const [selectedSupervisor, setSelectedSupervisor] = useState<EntidadListado | null>(null)
  const [selectedTecnico, setSelectedTecnico] = useState<EntidadListado | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<EntidadListado | null>(null)
  const [estadoVisita, setEstadoVisita] = useState<EstadoVisita>('Pendiente' as EstadoVisita)
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [horaProgramada, setHoraProgramada] = useState('')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const [sup, tec, cli] = await Promise.all([
          listarSupervisores(),
          listarTecnicos(),
          listarClientesVisitas(),
        ])
        setSupervisores(sup)
        setTecnicos(tec)
        setClientes(cli)
      } catch (e) {
        console.error('Error cargando entidades:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchEntidades()
  }, [])


  const valueTemplate = (ent: EntidadListado | null, placeholder: string) =>
    ent ? <span>{ent.nombre_completo}</span> : <span className="text-color-secondary">{placeholder}</span>

  const itemTemplate = (ent: EntidadListado) => (
    <div className="flex flex-column">
      <span className="font-semibold">{ent.nombre_completo}</span>
      <small className="text-color-secondary">{ent.rol}</small>
    </div>
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !selectedCliente?.id ||
      !selectedSupervisor?.id ||
      !selectedTecnico?.id
    ) {
      if (toast.current) {
        (toast.current as Toast).show({
          severity: 'error',
          summary: 'Debe seleccionar cliente, supervisor y técnico',
        });
      }
      return;
    }
    const payload = {
      clienteId: selectedCliente.id,
      supervisorId: selectedSupervisor.id,
      tecnicoId: selectedTecnico.id,
      fechaProgramada,
      horaProgramada,
      estadoVisita,
      observaciones,
    }
    console.log('Enviar payload:', payload)
    const { mensaje } = await crearVisita(payload)
    if (toast.current) {
      (toast.current as Toast).show({ severity: 'success', summary: mensaje || 'Visita creada' });
    }
  }

  if (loading) return <p>Cargando datos...</p>

  return (
    <form onSubmit={submit} className="p-fluid grid formgrid gap-3">
      <Toast ref={toast} />
      {/* Cliente */}
      <div className="field col-12 md:col-4">
        <label className="block mb-2">Cliente</label>
        <Dropdown
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.value)}
          options={clientes}
          optionLabel="nombre_completo"
          placeholder="Seleccione cliente"
          filter
          showClear
          className="w-full"
          valueTemplate={(v) => valueTemplate(v, 'Seleccione cliente')}
          itemTemplate={itemTemplate}
        />
      </div>

      {/* Supervisor */}
      <div className="field col-12 md:col-4">
        <label className="block mb-2">Supervisor</label>
        <Dropdown
          value={selectedSupervisor}
          onChange={(e) => setSelectedSupervisor(e.value)}
          options={supervisores}
          optionLabel="nombre_completo"
          placeholder="Seleccione supervisor"
          filter
          showClear
          className="w-full"
          valueTemplate={(v) => valueTemplate(v, 'Seleccione supervisor')}
          itemTemplate={itemTemplate}
        />
      </div>

      {/* Técnico */}
      <div className="field col-12 md:col-4">
        <label className="block mb-2">Técnico</label>
        <Dropdown
          value={selectedTecnico}
          onChange={(e) => setSelectedTecnico(e.value)}
          options={tecnicos}
          optionLabel="nombre_completo"
          placeholder="Seleccione técnico"
          filter
          showClear
          className="w-full"
          valueTemplate={(v) => valueTemplate(v, 'Seleccione técnico')}
          itemTemplate={itemTemplate}
        />
      </div>

      {/* Fecha */}
      <div className="field col-12 md:col-3">
        <label className="block mb-2">Fecha</label>
        <input
          type="date"
          className="w-full p-2 border-round border-1"
          value={fechaProgramada}
          onChange={(e) => setFechaProgramada(e.target.value)}
          required
          name="fechaProgramada"
        />
      </div>

      {/* Hora */}
      <div className="field col-12 md:col-3">
        <label className="block mb-2">Hora</label>
        <input
          type="time"
          className="w-full p-2 border-round border-1"
          value={horaProgramada}
          onChange={(e) => setHoraProgramada(e.target.value)}
          required
          name="horaProgramada"
        />
      </div>

      {/* Estado */}
      <div className="field col-12 md:col-3">
        <label className="block mb-2">Estado</label>
        <Dropdown
          value={estadoVisita}
          onChange={(e) => setEstadoVisita(e.value)}
          options={estados}
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione estado"
          className="w-full"
          name="estadoVisita"
        />
      </div>

      {/* Observaciones */}
      <div className="field col-12">
        <label className="block mb-2">Observaciones</label>
        <InputTextarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={5} cols={30} />
        {/* <textarea
          className="w-full p-2 border-round border-1"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          name="observaciones"
          placeholder="Detalles adicionales..."
        /> */}
      </div>

      <div className="col-12">
        <button type="submit" className="p-button p-component">Guardar</button>
      </div>
    </form>
  )
}

export default VisitasForm
function showToast(arg0: { severity: string; summary: any; }) {
  throw new Error('Function not implemented.');
}

