import { useEffect, useRef, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { listarClientesVisitas, type EntidadListado, type EstadoVisita, crearVisita } from '../../services/VisitasService'
import VisitasSupervisorService from '../../services/VisitasSupervisorService'
import { InputTextarea } from "primereact/inputtextarea"
import { Toast } from 'primereact/toast'

const estados = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Progreso', value: 'En Progreso' },
  { label: 'Completada', value: 'Completada' },
  { label: 'Cancelada', value: 'Cancelada' },
]

const VisitasSupervisorForm = ({ onVisitaCreada }: { onVisitaCreada?: () => void }) => {
  const [clientes, setClientes] = useState<EntidadListado[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useRef<Toast>(null)

  const [selectedCliente, setSelectedCliente] = useState<EntidadListado | null>(null)
  const [selectedTecnico, setSelectedTecnico] = useState<any>(null)
  const [estadoVisita, setEstadoVisita] = useState<EstadoVisita>('Pendiente')
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [horaProgramada, setHoraProgramada] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const supervisorId = parseInt(localStorage.getItem('idUser') || '0')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesData, tecnicosData] = await Promise.all([
          listarClientesVisitas(),
          VisitasSupervisorService.listarTecnicosPorSupervisor(supervisorId)
        ])
        
        if (Array.isArray(clientesData)) {
          setClientes(clientesData)
        } else {
          setClientes([])
        }

        if (tecnicosData?.data && Array.isArray(tecnicosData.data)) {
          setTecnicos(tecnicosData.data)
        } else {
          setTecnicos([])
        }

      } catch (error) {
        if (toast.current) {
          toast.current.show({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al cargar datos' 
          })
        }
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [supervisorId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !selectedCliente?.id ||
      !selectedTecnico?.tecnico_id
    ) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Debe seleccionar cliente y técnico',
        });
      }
      return;
    }
    const payload = {
      clienteId: selectedCliente.id,
      supervisorId: supervisorId, // Usamos el supervisorId del localStorage
      tecnicoId: selectedTecnico.tecnico_id,
      fechaProgramada,
      horaProgramada,
      estadoVisita,
      observaciones,
    }
    console.log('Enviar payload:', payload)
    const { mensaje } = await crearVisita(payload)
    if (toast.current) {
      toast.current.show({ severity: 'success', summary: mensaje || 'Visita creada' });
    }

    // Limpiar formulario después de éxito
    setSelectedCliente(null)
    setSelectedTecnico(null)
    setFechaProgramada('')
    setHoraProgramada('')
    setEstadoVisita('Pendiente')
    setObservaciones('')

    if (onVisitaCreada) {
      onVisitaCreada()
    }
  }

  // Template para clientes
  const clienteValueTemplate = (ent: EntidadListado | null, placeholder: string) =>
    ent ? <span>{ent.nombre_completo}</span> : <span className="text-color-secondary">{placeholder}</span>

  const clienteItemTemplate = (ent: EntidadListado) => (
    <div className="flex flex-column">
      <span className="font-semibold">{ent.nombre_completo}</span>
      <small className="text-color-secondary">{ent.rol}</small>
    </div>
  )

  // Template para técnicos
  const tecnicoValueTemplate = (tecnico: any | null, placeholder: string) =>
    tecnico ? <span>{tecnico.tecnico_nombre}</span> : <span className="text-color-secondary">{placeholder}</span>

  const tecnicoItemTemplate = (tecnico: any) => (
    <div className="flex flex-column">
      <span className="font-semibold">{tecnico.tecnico_nombre}</span>
      <small className="text-color-secondary">{tecnico.tecnico_rol}</small>
    </div>
  )

  if (loading) return <p>Cargando datos...</p>

  return (
    <form onSubmit={submit} className="p-fluid grid formgrid gap-3">
      <Toast ref={toast} />
      
      {/* Cliente */}
      <div className="field col-12 md:col-6">
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
          valueTemplate={(v) => clienteValueTemplate(v, 'Seleccione cliente')}
          itemTemplate={clienteItemTemplate}
        />
      </div>

      {/* Técnico Asignado */}
      <div className="field col-12 md:col-6">
        <label className="block mb-2">Técnico Asignado</label>
        <Dropdown
          value={selectedTecnico}
          onChange={(e) => setSelectedTecnico(e.value)}
          options={tecnicos}
          optionLabel="tecnico_nombre"
          placeholder={tecnicos.length ? "Seleccione técnico" : "Sin técnicos asignados"}
          filter
          showClear
          className="w-full"
          valueTemplate={(v) => tecnicoValueTemplate(v, 'Seleccione técnico')}
          itemTemplate={tecnicoItemTemplate}
          disabled={!tecnicos.length}
        />
      </div>

      {/* Fecha */}
      <div className="field col-12 md:col-4">
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
      <div className="field col-12 md:col-4">
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
      <div className="field col-12 md:col-4">
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
        <InputTextarea 
          value={observaciones} 
          onChange={(e) => setObservaciones(e.target.value)} 
          rows={5} 
          cols={30} 
        />
      </div>

      <div className="col-12">
        <button type="submit" className="p-button p-component">Guardar</button>
      </div>
    </form>
  )
}

export default VisitasSupervisorForm