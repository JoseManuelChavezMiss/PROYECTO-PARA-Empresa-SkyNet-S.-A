import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Toast } from 'primereact/toast'
import { crearReporteVisita, enviarEmail } from '../../services/VisitasService'

interface ReportesVisitaFormProps {
  numero: number,
  email: string
}

// Exponer un handle para que el padre pueda disparar el guardado
export interface ReportesVisitaFormHandle {
  submit: () => Promise<{ ok: boolean; mensaje: string }>
}

const ReportesVisitaForm = forwardRef<ReportesVisitaFormHandle, ReportesVisitaFormProps>(({ numero, email }, ref) => {
  const [resumenTrabajo, setResumenTrabajo] = useState('')
  const [materialesUtilizados, setMaterialesUtilizados] = useState('')
  const [fechaReporte, setFechaReporte] = useState<Date | null>(new Date())
  const [loading, setLoading] = useState(false)
  const toast = useRef<Toast>(null)

  const notify = (severity: 'success' | 'info' | 'warn' | 'error', detail: string, summary = 'Mensaje') => {
    toast.current?.show({ severity, summary, detail, life: 3500 })
  }

  const submitInternal = async (): Promise<{ ok: boolean; mensaje: string }> => {
    if (!numero) return { ok: false, mensaje: 'ID de visita inválido' }
    if (!resumenTrabajo.trim()) return { ok: false, mensaje: 'El resumen de trabajo es requerido' }
    if (!materialesUtilizados.trim()) return { ok: false, mensaje: 'Los materiales utilizados son requeridos' }
    if (!fechaReporte) return { ok: false, mensaje: 'La fecha del reporte es requerida' }

    const resp = await crearReporteVisita({
      idVisita: numero,
      resumenTrabajo: resumenTrabajo.trim(),
      materialesUtilizados: materialesUtilizados.trim(),
      // El servicio normaliza a ISO local sin "Z"
      fechaReporte: fechaReporte.toISOString(),
    })

    // const reporteEnviarDatosCorreo = {
    //   resumenTrabajo: resumenTrabajo,
    //   materialesUtilizados: materialesUtilizados,
    //   fechaReporte: fechaReporte,

    // }

    const emailResp = await enviarEmail({
      email: email,
      reporte: {
        resumenTrabajo: resumenTrabajo,
        materialesUtilizados: materialesUtilizados,
        fechaReporte: fechaReporte,
      }
    })

    if (!emailResp.ok) {
      notify('error', emailResp.mensaje ?? 'Error al enviar email')
    }

    if (resp.ok) {
      // limpiar campos tras éxito
      setResumenTrabajo('')
      setMaterialesUtilizados('')
      setFechaReporte(new Date())
    }
    return resp
  }

  useImperativeHandle(ref, () => ({
    submit: submitInternal,
  }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const resp = await submitInternal()
    console.log('Respuesta al crear reporte EMAIL:', resp)
    if (resp.ok) {
      notify('success', resp.mensaje ?? 'Reporte creado')
    } else {
      notify('warn', resp.mensaje ?? 'No se pudo crear el reporte')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <h2 className="mb-3">Reporte de Visita</h2>

      <form onSubmit={onSubmit} className="p-fluid">
        <div className="field">
          <label htmlFor="idVisita">ID Visita</label>
          <input id="idVisita" className="p-inputtext p-component" value={numero} readOnly />
        </div>

        <div className="field">
          <label htmlFor="resumenTrabajo">Resumen del trabajo</label>
          <InputTextarea
            id="resumenTrabajo"
            rows={5}
            autoResize
            value={resumenTrabajo}
            onChange={(e) => setResumenTrabajo(e.target.value)}
            placeholder="Describe el trabajo realizado"
          />
        </div>

        <div className="field">
          <label htmlFor="materialesUtilizados">Materiales utilizados</label>
          <InputTextarea
            id="materialesUtilizados"
            rows={4}
            autoResize
            value={materialesUtilizados}
            onChange={(e) => setMaterialesUtilizados(e.target.value)}
            placeholder="- Filtro de aire 20x20&#10;- Aceite lubricante 250ml&#10;- Cinta aislante"
          />
        </div>

        <div className="field">
          <label htmlFor="fechaReporte">Fecha y hora del reporte</label>
          <Calendar
            id="fechaReporte"
            value={fechaReporte}
            onChange={(e) => setFechaReporte(e.value as Date)}
            showIcon
            showTime
            hourFormat="24"
            showSeconds
            dateFormat="yy-mm-dd"
            touchUI
          />
        </div>
      </form>
    </div>
  )
})

export default ReportesVisitaForm