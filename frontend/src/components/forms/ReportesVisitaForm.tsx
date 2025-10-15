import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
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
    //enviar email de notificacion al cliente
    const emailResp = await enviarEmail({ email })
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
        {/* 
        <div className="flex gap-2 mt-3">
          <Button type="submit" label="Guardar reporte" icon="pi pi-save" loading={loading} />
          <Button
            type="button"
            label="Limpiar"
            icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={() => {
              setResumenTrabajo('')
              setMaterialesUtilizados('')
              setFechaReporte(new Date())
            }}
          />
        </div> */}
      </form>
    </div>
  )
})

export default ReportesVisitaForm

// import { useRef, useState } from 'react'
// import { InputTextarea } from 'primereact/inputtextarea'
// import { Calendar } from 'primereact/calendar'
// import { Button } from 'primereact/button'
// import { Toast } from 'primereact/toast'
// import { crearReporteVisita } from '../../services/VisitasService'

// interface ReportesVisitaFormProps {
//   numero: number
// }

// const ReportesVisitaForm = ({ numero }: ReportesVisitaFormProps) => {
//   const [resumenTrabajo, setResumenTrabajo] = useState('')
//   const [materialesUtilizados, setMaterialesUtilizados] = useState('')
//   const [fechaReporte, setFechaReporte] = useState<Date | null>(new Date())
//   const [loading, setLoading] = useState(false)
//   const toast = useRef<Toast>(null)

//   const notify = (severity: 'success' | 'info' | 'warn' | 'error', detail: string, summary = 'Mensaje') => {
//     toast.current?.show({ severity, summary, detail, life: 3500 })
//   }

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!numero) return notify('warn', 'ID de visita inválido')
//     if (!resumenTrabajo.trim()) return notify('warn', 'El resumen de trabajo es requerido')
//     if (!materialesUtilizados.trim()) return notify('warn', 'Los materiales utilizados son requeridos')
//     if (!fechaReporte) return notify('warn', 'La fecha del reporte es requerida')

//     setLoading(true)
//     try {
//       const { ok, mensaje } = await crearReporteVisita({
//         idVisita: numero,
//         resumenTrabajo: resumenTrabajo.trim(),
//         materialesUtilizados: materialesUtilizados.trim(),
//         // Se envía en ISO; el servicio lo normaliza a ISO local sin "Z" para el backend
//         fechaReporte: fechaReporte.toISOString(),
//       })

//       if (ok) {
//         notify('success', mensaje ?? 'Reporte creado')
//         // Opcional: limpiar campos
//         setResumenTrabajo('')
//         setMaterialesUtilizados('')
//         setFechaReporte(new Date())
//       } else {
//         notify('warn', mensaje ?? 'No se pudo crear el reporte')
//       }
//     } catch (err: any) {
//       notify('error', err?.message ?? 'Error al crear el reporte', 'Error')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="card">
//       <Toast ref={toast} />
//       <h2 className="mb-3">Reporte de Visita</h2>

//       <form onSubmit={onSubmit} className="p-fluid">
//         <div className="field">
//           <label htmlFor="idVisita">ID Visita</label>
//           <input id="idVisita" className="p-inputtext p-component" value={numero} readOnly />
//         </div>

//         <div className="field">
//           <label htmlFor="resumenTrabajo">Resumen del trabajo</label>
//           <InputTextarea
//             id="resumenTrabajo"
//             rows={5}
//             autoResize
//             value={resumenTrabajo}
//             onChange={(e) => setResumenTrabajo(e.target.value)}
//             placeholder="Describe el trabajo realizado"
//           />
//         </div>

//         <div className="field">
//           <label htmlFor="materialesUtilizados">Materiales utilizados</label>
//           <InputTextarea
//             id="materialesUtilizados"
//             rows={4}
//             autoResize
//             value={materialesUtilizados}
//             onChange={(e) => setMaterialesUtilizados(e.target.value)}
//             placeholder="- Filtro de aire 20x20&#10;- Aceite lubricante 250ml&#10;- Cinta aislante"
//           />
//         </div>

//         <div className="field">
//           <label htmlFor="fechaReporte">Fecha y hora del reporte</label>
//           <Calendar
//             id="fechaReporte"
//             value={fechaReporte}
//             onChange={(e) => setFechaReporte(e.value as Date)}
//             showIcon
//             showTime
//             hourFormat="24"
//             showSeconds
//             dateFormat="yy-mm-dd"
//             touchUI
//           />
//         </div>

//         <div className="flex gap-2 mt-3">
//           <Button type="submit" label="Guardar reporte" icon="pi pi-save" loading={loading} />
//           <Button
//             type="button"
//             label="Limpiar"
//             icon="pi pi-refresh"
//             className="p-button-secondary"
//             disabled={loading}
//             onClick={() => {
//               setResumenTrabajo('')
//               setMaterialesUtilizados('')
//               setFechaReporte(new Date())
//             }}
//           />
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ReportesVisitaForm
// interface ReportesVisitaFormProps {
//   numero: number;
// }

// const ReportesVisitaForm = ({ numero }: ReportesVisitaFormProps) => {
//   return (
//     <div>
//       <h2>Reporte de Visita</h2>
//       <p>El número de visita recibido es: <strong>{numero}</strong></p>
//     </div>
//   );
// };

// export default ReportesVisitaForm;