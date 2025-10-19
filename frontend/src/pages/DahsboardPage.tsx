import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import logo from '../assets/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  obtenerDashboardActual, 
  obtenerEficienciaTecnicos,
  obtenerMetricasPeriodo,
  obtenerClientesActivos,
  obtenerTendenciasMensuales,
  obtenerReporteGeneral,
  type DashboardActual,
  type EficienciaTecnico,
  type ClienteActivo,
  type MetricasPeriodo,
  type TendenciaMensual,
  type VisitaReporteGeneral
} from '../services/ReportesService';
import { useNavigate } from 'react-router-dom';

// Definir tipos para los datos del dashboard
interface VisitaPeriodo {
  periodo: string;
  total: number;
  completadas: number;
  en_progreso: number;
  pendientes: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
    hoverBackgroundColor: string[];
  }>;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [pieChartData, setPieChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [barChartData, setBarChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [lineChartData, setLineChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [pieChartOptions, setPieChartOptions] = useState({});
  const [barChartOptions, setBarChartOptions] = useState({});
  const [lineChartOptions, setLineChartOptions] = useState({});
  
  const [dashboardData, setDashboardData] = useState<DashboardActual | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const toast = useRef<Toast>(null);

  // Opciones de reportes
  const reportOptions = [
    { label: 'Dashboard General', value: 'dashboard' },
    { label: 'Eficiencia de Técnicos', value: 'eficiencia' },
    { label: 'Clientes Más Activos', value: 'clientes' },
    { label: 'Métricas por Período', value: 'metricas' },
    { label: 'Tendencias Mensuales', value: 'tendencias' },
    { label: 'Reporte General', value: 'general' }
  ];

  useEffect(() => {
    cargarDashboard();
    configurarGraficosIniciales();
  }, []);

  const mostrarError = (mensaje: string) => {
    if (toast.current) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: mensaje,
        life: 5000
      });
    }
  };

  const mostrarExito = (mensaje: string) => {
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: mensaje,
        life: 3000
      });
    }
  };

  const cargarDashboard = async () => {
    setLoading(true);
    try {
      const resultado = await obtenerDashboardActual();
      if (resultado.ok && resultado.data) {
        setDashboardData(resultado.data);
        actualizarGraficos(resultado.data);
      } else {
        mostrarError(resultado.mensaje || 'Error al cargar el dashboard');
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      mostrarError('Error inesperado al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const configurarGraficosIniciales = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Gráfico de Pie (Visitas de Hoy)
    const pieData: ChartData = {
      labels: ['Completadas', 'En Progreso', 'Pendientes'],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: [
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400')
          ]
        }
      ]
    };
    
    // Gráfico de Barras (Técnicos Activos)
    const barData: ChartData = {
      labels: ['Técnicos Activos'],
      datasets: [
        {
          label: 'Técnicos',
          data: [0],
          backgroundColor: [
            documentStyle.getPropertyValue('--indigo-500')
          ],
          borderColor: [
            documentStyle.getPropertyValue('--indigo-700')
          ],
          borderWidth: 1,
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--indigo-400')
          ]
        }
      ]
    };
    
    // Gráfico de Líneas (Visitas Semanales)
    const lineData: ChartData = {
      labels: ['Semana Actual'],
      datasets: [
        {
          label: 'Visitas',
          data: [0],
          backgroundColor: [
            documentStyle.getPropertyValue('--pink-500')
          ],
          borderColor: [
            documentStyle.getPropertyValue('--pink-700')
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--pink-400')
          ]
        }
      ]
    };

    const pieOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true
          }
        }
      }
    };

    const barOptions = {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };

    const lineOptions = {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };

    setPieChartData(pieData);
    setBarChartData(barData);
    setLineChartData(lineData);
    setPieChartOptions(pieOptions);
    setBarChartOptions(barOptions);
    setLineChartOptions(lineOptions);
  };

  const actualizarGraficos = (data: DashboardActual) => {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Actualizar gráfico de Pie (Visitas de Hoy)
    if (data.visitas && data.visitas.length > 0) {
      const visitasHoy = data.visitas.find((v: VisitaPeriodo) => v.periodo === 'Hoy') || data.visitas[0];
      
      setPieChartData({
        labels: ['Completadas', 'En Progreso', 'Pendientes'],
        datasets: [
          {
            data: [
              visitasHoy.completadas || 0,
              visitasHoy.en_progreso || 0,
              visitasHoy.pendientes || 0
            ],
            backgroundColor: [
              documentStyle.getPropertyValue('--green-500'),
              documentStyle.getPropertyValue('--blue-500'),
              documentStyle.getPropertyValue('--yellow-500')
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--green-400'),
              documentStyle.getPropertyValue('--blue-400'),
              documentStyle.getPropertyValue('--yellow-400')
            ]
          }
        ]
      });
    }

    // Actualizar gráfico de Barras (Técnicos Activos)
    setBarChartData({
      labels: ['Técnicos Activos'],
      datasets: [
        {
          label: 'Técnicos',
          data: [data.tecnicos_activos || 0],
          backgroundColor: [
            documentStyle.getPropertyValue('--indigo-500')
          ],
          borderColor: [
            documentStyle.getPropertyValue('--indigo-700')
          ],
          borderWidth: 1,
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--indigo-400')
          ]
        }
      ]
    });

    // Actualizar gráfico de Líneas (Visitas Semanales)
    if (data.visitas && data.visitas.length > 0) {
      const visitasSemana = data.visitas.find((v: VisitaPeriodo) => v.periodo === 'Esta Semana') || data.visitas[0];
      
      setLineChartData({
        labels: ['Visitas Esta Semana'],
        datasets: [
          {
            label: 'Visitas',
            data: [visitasSemana.total || 0],
            backgroundColor: [
              documentStyle.getPropertyValue('--pink-500')
            ],
            borderColor: [
              documentStyle.getPropertyValue('--pink-700')
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--pink-400')
            ]
          }
        ]
      });
    }
  };

  const generarReportePDF = async () => {
    setLoading(true);
    try {
      let resultado;
      
      switch (selectedReport) {
        case 'dashboard':
          resultado = await obtenerDashboardActual();
          break;
        case 'eficiencia':
          resultado = await obtenerEficienciaTecnicos();
          break;
        case 'clientes':
          resultado = await obtenerClientesActivos();
          break;
        case 'metricas':
          resultado = await obtenerMetricasPeriodo();
          break;
        case 'tendencias':
          resultado = await obtenerTendenciasMensuales({ meses: 6 });
          break;
        case 'general':
          const filtros: any = {};
          if (fechaInicio) filtros.fechaInicio = fechaInicio.toISOString().split('T')[0];
          if (fechaFin) filtros.fechaFin = fechaFin.toISOString().split('T')[0];
          resultado = await obtenerReporteGeneral(filtros);
          break;
        default:
          mostrarError('Por favor selecciona un tipo de reporte');
          return;
      }

      if (resultado.ok && resultado.data) {
        const pdfGenerado = await crearPDF(selectedReport, resultado.data);
        if (pdfGenerado) {
          mostrarExito('Reporte PDF generado correctamente');
        } else {
          mostrarError('Error al generar el PDF');
        }
      } else {
        mostrarError(resultado.mensaje || `Error al generar el reporte ${selectedReport}`);
      }
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      mostrarError('Error inesperado al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const crearPDF = (
    tipoReporte: string, 
    data: DashboardActual | EficienciaTecnico[] | ClienteActivo[] | MetricasPeriodo[] | TendenciaMensual[] | VisitaReporteGeneral[]
  ): boolean => {
    try {
      console.log(`Generando PDF para: ${tipoReporte}`, data);
      
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString('es-GT');
      
      // Encabezado
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('SkyNet S.A. - Reporte del Sistema', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${fecha}`, 105, 22, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(13, 96, 45);
      const reportLabel = reportOptions.find(r => r.value === tipoReporte)?.label || 'Reporte';
      doc.text(`Reporte: ${reportLabel}`, 105, 32, { align: 'center' });
      
      let yPosition = 45;

      switch (tipoReporte) {
        case 'dashboard':
          generarPDFDashboard(doc, data as DashboardActual, yPosition);
          break;
        case 'eficiencia':
          generarPDFEficiencia(doc, data as EficienciaTecnico[], yPosition);
          break;
        case 'clientes':
          generarPDFClientes(doc, data as ClienteActivo[], yPosition);
          break;
        case 'metricas':
          generarPDFMetricas(doc, data as MetricasPeriodo[], yPosition);
          break;
        case 'tendencias':
          generarPDFTendencias(doc, data as TendenciaMensual[], yPosition);
          break;
        case 'general':
          generarPDFGeneral(doc, data as VisitaReporteGeneral[], yPosition);
          break;
        default:
          console.error('Tipo de reporte no reconocido:', tipoReporte);
          return false;
      }

      // Guardar el PDF
      doc.save(`reporte-${tipoReporte}-${fecha.replace(/\//g, '-')}.pdf`);
      return true;
    } catch (error) {
      console.error('Error en crearPDF:', error);
      return false;
    }
  };

  const generarPDFDashboard = (doc: jsPDF, data: DashboardActual, yPosition: number) => {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumen del Dashboard', 20, yPosition);
    
    yPosition += 10;
    
    if (data.visitas) {
      data.visitas.forEach((periodo: VisitaPeriodo) => {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Período: ${periodo.periodo}`, 25, yPosition);
        doc.text(`Total: ${periodo.total} | Completadas: ${periodo.completadas} | En Progreso: ${periodo.en_progreso} | Pendientes: ${periodo.pendientes}`, 25, yPosition + 5);
        yPosition += 15;
      });
    }
    
    doc.text(`Técnicos Activos: ${data.tecnicos_activos || 0}`, 25, yPosition);
  };

  const generarPDFEficiencia = (doc: jsPDF, data: EficienciaTecnico[], yPosition: number) => {
    if (!data || data.length === 0) {
      doc.text('No hay datos disponibles', 20, yPosition);
      return;
    }

    const headers = [['Técnico', 'Total Visitas', 'Completadas', 'Tasa Éxito %']];
    const rows = data.map(tecnico => [
      `${tecnico.nombreTecnico} ${tecnico.apellidoTecnico}`,
      tecnico.total_visitas.toString(),
      tecnico.visitas_completadas.toString(),
      `${tecnico.tasa_exito_porcentaje}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [13, 96, 45] },
      styles: { fontSize: 9 }
    });
  };

  const generarPDFClientes = (doc: jsPDF, data: ClienteActivo[], yPosition: number) => {
    if (!data || data.length === 0) {
      doc.text('No hay datos disponibles', 20, yPosition);
      return;
    }

    const headers = [['Cliente', 'Email', 'Total Visitas', 'Última Visita']];
    const rows = data.map(cliente => [
      `${cliente.nombre} ${cliente.apellido}`,
      cliente.email,
      cliente.total_visitas.toString(),
      cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString('es-GT') : 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [13, 96, 45] },
      styles: { fontSize: 8 }
    });
  };

  const generarPDFMetricas = (doc: jsPDF, data: MetricasPeriodo[], yPosition: number) => {
    if (!data || data.length === 0) {
      doc.text('No hay datos disponibles', 20, yPosition);
      return;
    }

    const headers = [['Mes', 'Total', 'Completadas', 'Canceladas', 'Pendientes']];
    const rows = data.map(metrica => [
      metrica.mes,
      metrica.total_visitas.toString(),
      metrica.completadas.toString(),
      metrica.canceladas.toString(),
      metrica.pendientes.toString()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [13, 96, 45] },
      styles: { fontSize: 9 }
    });
  };

  const generarPDFTendencias = (doc: jsPDF, data: TendenciaMensual[], yPosition: number) => {
    if (!data || data.length === 0) {
      doc.text('No hay datos disponibles', 20, yPosition);
      return;
    }

    const headers = [['Mes', 'Total Visitas', 'Tasa Completación %', 'Técnicos Activos', 'Clientes Visitados']];
    const rows = data.map(tendencia => [
      tendencia.mes,
      tendencia.total_visitas.toString(),
      `${tendencia.tasa_completacion}%`,
      tendencia.tecnicos_activos.toString(),
      tendencia.clientes_visitados.toString()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [13, 96, 45] },
      styles: { fontSize: 9 }
    });
  };

  const generarPDFGeneral = (doc: jsPDF, data: VisitaReporteGeneral[], yPosition: number) => {
    if (!data || data.length === 0) {
      doc.text('No hay datos disponibles', 20, yPosition);
      return;
    }

    const headers = [['Fecha', 'Cliente', 'Técnico', 'Estado', 'Supervisor']];
    const rows = data.map(visita => [
      new Date(visita.fecha_programada).toLocaleDateString('es-GT'),
      visita.cliente_nombre,
      visita.tecnico_nombre,
      visita.estado_visita,
      visita.supervisor_nombre || 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [13, 96, 45] },
      styles: { fontSize: 8 }
    });
  };

  const abrirDialogoReporte = () => {
    setShowReportDialog(true);
    setSelectedReport('');
    setFechaInicio(null);
    setFechaFin(null);
  };

  return (
    <div className="surface-ground min-h-screen p-3">
      <Toast ref={toast} />
      
      {/* Card Encabezado */}
      <Card className="w-full mb-4 shadow-2 border-round p-5">
        <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
          <div className="flex-shrink-0">
            <Image
              src={logo}
              alt="Logo"
              width="180"
              className="border-round shadow-2"
              style={{ background: 'linear-gradient(#f8f8f8,#f1f1f1)' }}
            />
          </div>
          <div className="flex-1 w-full">
            <h2 className="m-0 text-3xl font-bold" style={{ color: '#0d602d' }}>
              Bienvenido al Sistema de Gestión
            </h2>
            <p className="mt-2 mb-4 text-lg" style={{ color: '#256c3a' }}>
              SkyNet S.A. – Control integral de producción y administración.
            </p>
            <div className="flex align-items-stretch" style={{ maxWidth: 620 }}>
              <div style={{ width: 4, background: '#16a34a', borderRadius: 2 }} />
              <div className="flex align-items-center px-3 py-3 bg-green-50 text-green-700 text-sm font-medium w-full border-round-right">
                Sistema actualizado - {new Date().toLocaleDateString('es-GT')}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Métricas con Gráficos Mejorados */}
      <div className="grid">
        {/* Técnicos Activos - Gráfico de Barras */}
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round text-center p-4 h-full">
            <h4 className="text-gray-700 m-0 mb-3">Técnicos Activos</h4>
            {loading ? (
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            ) : (
              <Chart
                type="bar"
                data={barChartData}
                options={barChartOptions}
                className="w-full"
                style={{ height: '200px' }}
              />
            )}
          </Card>
        </div>

        {/* Visitas de Hoy - Gráfico de Pie */}
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round text-center p-4 h-full">
            <h4 className="text-gray-700 m-0 mb-3">Visitas de Hoy</h4>
            {loading ? (
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            ) : (
              <Chart
                type="pie"
                data={pieChartData}
                options={pieChartOptions}
                className="w-full"
                style={{ height: '200px' }}
              />
            )}
          </Card>
        </div>

        {/* Total Visitas Semana - Gráfico de Líneas */}
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round text-center p-4 h-full">
            <h4 className="text-gray-700 m-0 mb-3">Total Visitas Semana</h4>
            {loading ? (
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            ) : (
              <Chart
                type="line"
                data={lineChartData}
                options={lineChartOptions}
                className="w-full"
                style={{ height: '200px' }}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Accesos rápidos */}
      <Card className="mt-5 p-4 shadow-2 border-round">
        <h3 className="text-lg font-bold mb-4">Accesos rápidos</h3>
        <div className="grid">
          <div className="col-6 md:col-3">
            <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" onClick={() => navigate('/usuarios')} />
          </div>
          <div className="col-6 md:col-3">
            <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" onClick={() => navigate('/clientes')} />
          </div>
          <div className="col-6 md:col-3">
            <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" onClick={() => navigate('/visitas')} />
          </div>
          <div className="col-6 md:col-3">
            <Button 
              label="Generar Reportes PDF" 
              icon="pi pi-file-pdf" 
              className="w-full p-3 shadow-2 border-round" 
              onClick={abrirDialogoReporte}
            />
          </div>
        </div>
      </Card>

      {/* Diálogo para generar reportes PDF */}
      <Dialog 
        header="Generar Reporte PDF" 
        visible={showReportDialog} 
        style={{ width: '500px' }}
        onHide={() => setShowReportDialog(false)}
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="reporte">Seleccionar Reporte</label>
            <Dropdown
              id="reporte"
              value={selectedReport}
              options={reportOptions}
              onChange={(e) => setSelectedReport(e.value)}
              placeholder="Seleccione un reporte"
            />
          </div>

          {selectedReport === 'general' && (
            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label htmlFor="fechaInicio">Fecha Inicio</label>
                  <Calendar
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label htmlFor="fechaFin">Fecha Fin</label>
                  <Calendar
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-content-end gap-2 mt-4">
            <Button 
              label="Cancelar" 
              icon="pi pi-times" 
              className="p-button-secondary" 
              onClick={() => setShowReportDialog(false)}
            />
            <Button 
              label="Generar PDF" 
              icon="pi pi-download" 
              className="p-button-success"
              onClick={generarReportePDF}
              disabled={!selectedReport || loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
// import { Card } from 'primereact/card';
// import { Image } from 'primereact/image';
// import { Button } from 'primereact/button';
// import { Chart } from 'primereact/chart';
// import { useEffect, useRef, useState } from 'react';
// import { Dialog } from 'primereact/dialog';
// import { Dropdown } from 'primereact/dropdown';
// import { Calendar } from 'primereact/calendar';
// import { ProgressSpinner } from 'primereact/progressspinner';
// import { Toast } from 'primereact/toast';
// import logo from '../assets/logo.png';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { 
//   obtenerDashboardActual, 
//   obtenerEficienciaTecnicos,
//   obtenerMetricasPeriodo,
//   obtenerClientesActivos,
//   obtenerTendenciasMensuales,
//   obtenerReporteGeneral,
//   type DashboardActual,
//   type EficienciaTecnico,
//   type ClienteActivo,
//   type MetricasPeriodo,
//   type TendenciaMensual,
//   type VisitaReporteGeneral
// } from '../services/ReportesService';

// // Definir tipos para los datos del dashboard
// interface VisitaPeriodo {
//   periodo: string;
//   total: number;
//   completadas: number;
//   en_progreso: number;
//   pendientes: number;
// }

// interface ChartData {
//   labels: string[];
//   datasets: Array<{
//     data: number[];
//     backgroundColor: string[];
//     hoverBackgroundColor: string[];
//   }>;
// }

// const DashboardPage = () => {
//   const [chartData, setChartData] = useState<ChartData>({
//     labels: [],
//     datasets: []
//   });
//   const [chartOptions, setChartOptions] = useState({});
//   const [dashboardData, setDashboardData] = useState<DashboardActual | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showReportDialog, setShowReportDialog] = useState(false);
//   const [selectedReport, setSelectedReport] = useState('');
//   const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
//   const [fechaFin, setFechaFin] = useState<Date | null>(null);
//   const toast = useRef<Toast>(null);

//   // Opciones de reportes
//   const reportOptions = [
//     { label: 'Dashboard General', value: 'dashboard' },
//     { label: 'Eficiencia de Técnicos', value: 'eficiencia' },
//     { label: 'Clientes Más Activos', value: 'clientes' },
//     { label: 'Métricas por Período', value: 'metricas' },
//     { label: 'Tendencias Mensuales', value: 'tendencias' },
//     { label: 'Reporte General', value: 'general' }
//   ];

//   useEffect(() => {
//     cargarDashboard();
//     configurarGraficoInicial();
//   }, []);

//   const mostrarError = (mensaje: string) => {
//     if (toast.current) {
//       toast.current.show({
//         severity: 'error',
//         summary: 'Error',
//         detail: mensaje,
//         life: 5000
//       });
//     }
//   };

//   const mostrarExito = (mensaje: string) => {
//     if (toast.current) {
//       toast.current.show({
//         severity: 'success',
//         summary: 'Éxito',
//         detail: mensaje,
//         life: 3000
//       });
//     }
//   };

//   const cargarDashboard = async () => {
//     setLoading(true);
//     try {
//       const resultado = await obtenerDashboardActual();
//       if (resultado.ok && resultado.data) {
//         setDashboardData(resultado.data);
//         actualizarGrafico(resultado.data);
//       } else {
//         mostrarError(resultado.mensaje || 'Error al cargar el dashboard');
//       }
//     } catch (error) {
//       console.error('Error cargando dashboard:', error);
//       mostrarError('Error inesperado al cargar el dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const configurarGraficoInicial = () => {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const data: ChartData = {
//       labels: ['Completadas', 'En Progreso', 'Pendientes'],
//       datasets: [
//         {
//           data: [0, 0, 0],
//           backgroundColor: [
//             documentStyle.getPropertyValue('--green-500'),
//             documentStyle.getPropertyValue('--blue-500'),
//             documentStyle.getPropertyValue('--yellow-500')
//           ],
//           hoverBackgroundColor: [
//             documentStyle.getPropertyValue('--green-400'),
//             documentStyle.getPropertyValue('--blue-400'),
//             documentStyle.getPropertyValue('--yellow-400')
//           ]
//         }
//       ]
//     };
//     const options = {
//       plugins: {
//         legend: {
//           labels: {
//             usePointStyle: true
//           }
//         }
//       }
//     };
//     setChartData(data);
//     setChartOptions(options);
//   };

//   const actualizarGrafico = (data: DashboardActual) => {
//     if (data.visitas && data.visitas.length > 0) {
//       const visitasHoy = data.visitas.find((v: VisitaPeriodo) => v.periodo === 'Hoy') || data.visitas[0];
//       const documentStyle = getComputedStyle(document.documentElement);
      
//       setChartData({
//         labels: ['Completadas', 'En Progreso', 'Pendientes'],
//         datasets: [
//           {
//             data: [
//               visitasHoy.completadas || 0,
//               visitasHoy.en_progreso || 0,
//               visitasHoy.pendientes || 0
//             ],
//             backgroundColor: [
//               documentStyle.getPropertyValue('--green-500'),
//               documentStyle.getPropertyValue('--blue-500'),
//               documentStyle.getPropertyValue('--yellow-500')
//             ],
//             hoverBackgroundColor: [
//               documentStyle.getPropertyValue('--green-400'),
//               documentStyle.getPropertyValue('--blue-400'),
//               documentStyle.getPropertyValue('--yellow-400')
//             ]
//           }
//         ]
//       });
//     }
//   };

//   const generarReportePDF = async () => {
//     setLoading(true);
//     try {
//       let resultado;
      
//       switch (selectedReport) {
//         case 'dashboard':
//           resultado = await obtenerDashboardActual();
//           break;
//         case 'eficiencia':
//           resultado = await obtenerEficienciaTecnicos();
//           break;
//         case 'clientes':
//           resultado = await obtenerClientesActivos();
//           break;
//         case 'metricas':
//           resultado = await obtenerMetricasPeriodo();
//           break;
//         case 'tendencias':
//           resultado = await obtenerTendenciasMensuales({ meses: 6 });
//           break;
//         case 'general':
//           const filtros: any = {};
//           if (fechaInicio) filtros.fechaInicio = fechaInicio.toISOString().split('T')[0];
//           if (fechaFin) filtros.fechaFin = fechaFin.toISOString().split('T')[0];
//           resultado = await obtenerReporteGeneral(filtros);
//           break;
//         default:
//           mostrarError('Por favor selecciona un tipo de reporte');
//           return;
//       }

//       if (resultado.ok && resultado.data) {
//         const pdfGenerado = await crearPDF(selectedReport, resultado.data);
//         if (pdfGenerado) {
//           mostrarExito('Reporte PDF generado correctamente');
//         } else {
//           mostrarError('Error al generar el PDF');
//         }
//       } else {
//         mostrarError(resultado.mensaje || `Error al generar el reporte ${selectedReport}`);
//       }
//     } catch (error: any) {
//       console.error('Error generando reporte:', error);
//       mostrarError('Error inesperado al generar el reporte');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const crearPDF = (
//     tipoReporte: string, 
//     data: DashboardActual | EficienciaTecnico[] | ClienteActivo[] | MetricasPeriodo[] | TendenciaMensual[] | VisitaReporteGeneral[]
//   ): boolean => {
//     try {
//       console.log(`Generando PDF para: ${tipoReporte}`, data);
      
//       const doc = new jsPDF();
//       const fecha = new Date().toLocaleDateString('es-GT');
      
//       // Encabezado
//       doc.setFontSize(20);
//       doc.setTextColor(40, 40, 40);
//       doc.text('SkyNet S.A. - Reporte del Sistema', 105, 15, { align: 'center' });
      
//       doc.setFontSize(12);
//       doc.setTextColor(100, 100, 100);
//       doc.text(`Generado el: ${fecha}`, 105, 22, { align: 'center' });
      
//       doc.setFontSize(16);
//       doc.setTextColor(13, 96, 45);
//       const reportLabel = reportOptions.find(r => r.value === tipoReporte)?.label || 'Reporte';
//       doc.text(`Reporte: ${reportLabel}`, 105, 32, { align: 'center' });
      
//       let yPosition = 45;

//       switch (tipoReporte) {
//         case 'dashboard':
//           generarPDFDashboard(doc, data as DashboardActual, yPosition);
//           break;
//         case 'eficiencia':
//           generarPDFEficiencia(doc, data as EficienciaTecnico[], yPosition);
//           break;
//         case 'clientes':
//           generarPDFClientes(doc, data as ClienteActivo[], yPosition);
//           break;
//         case 'metricas':
//           generarPDFMetricas(doc, data as MetricasPeriodo[], yPosition);
//           break;
//         case 'tendencias':
//           generarPDFTendencias(doc, data as TendenciaMensual[], yPosition);
//           break;
//         case 'general':
//           generarPDFGeneral(doc, data as VisitaReporteGeneral[], yPosition);
//           break;
//         default:
//           console.error('Tipo de reporte no reconocido:', tipoReporte);
//           return false;
//       }

//       // Guardar el PDF
//       doc.save(`reporte-${tipoReporte}-${fecha.replace(/\//g, '-')}.pdf`);
//       return true;
//     } catch (error) {
//       console.error('Error en crearPDF:', error);
//       return false;
//     }
//   };

//   const generarPDFDashboard = (doc: jsPDF, data: DashboardActual, yPosition: number) => {
//     doc.setFontSize(14);
//     doc.setTextColor(40, 40, 40);
//     doc.text('Resumen del Dashboard', 20, yPosition);
    
//     yPosition += 10;
    
//     if (data.visitas) {
//       data.visitas.forEach((periodo: VisitaPeriodo) => {
//         doc.setFontSize(10);
//         doc.setTextColor(80, 80, 80);
//         doc.text(`Período: ${periodo.periodo}`, 25, yPosition);
//         doc.text(`Total: ${periodo.total} | Completadas: ${periodo.completadas} | En Progreso: ${periodo.en_progreso} | Pendientes: ${periodo.pendientes}`, 25, yPosition + 5);
//         yPosition += 15;
//       });
//     }
    
//     doc.text(`Técnicos Activos: ${data.tecnicos_activos || 0}`, 25, yPosition);
//   };

//   const generarPDFEficiencia = (doc: jsPDF, data: EficienciaTecnico[], yPosition: number) => {
//     if (!data || data.length === 0) {
//       doc.text('No hay datos disponibles', 20, yPosition);
//       return;
//     }

//     const headers = [['Técnico', 'Total Visitas', 'Completadas', 'Tasa Éxito %']];
//     const rows = data.map(tecnico => [
//       `${tecnico.nombreTecnico} ${tecnico.apellidoTecnico}`,
//       tecnico.total_visitas.toString(),
//       tecnico.visitas_completadas.toString(),
//       `${tecnico.tasa_exito_porcentaje}%`
//     ]);

//     autoTable(doc, {
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFClientes = (doc: jsPDF, data: ClienteActivo[], yPosition: number) => {
//     if (!data || data.length === 0) {
//       doc.text('No hay datos disponibles', 20, yPosition);
//       return;
//     }

//     const headers = [['Cliente', 'Email', 'Total Visitas', 'Última Visita']];
//     const rows = data.map(cliente => [
//       `${cliente.nombre} ${cliente.apellido}`,
//       cliente.email,
//       cliente.total_visitas.toString(),
//       cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString('es-GT') : 'N/A'
//     ]);

//     autoTable(doc, {
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 8 }
//     });
//   };

//   const generarPDFMetricas = (doc: jsPDF, data: MetricasPeriodo[], yPosition: number) => {
//     if (!data || data.length === 0) {
//       doc.text('No hay datos disponibles', 20, yPosition);
//       return;
//     }

//     const headers = [['Mes', 'Total', 'Completadas', 'Canceladas', 'Pendientes']];
//     const rows = data.map(metrica => [
//       metrica.mes,
//       metrica.total_visitas.toString(),
//       metrica.completadas.toString(),
//       metrica.canceladas.toString(),
//       metrica.pendientes.toString()
//     ]);

//     autoTable(doc, {
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFTendencias = (doc: jsPDF, data: TendenciaMensual[], yPosition: number) => {
//     if (!data || data.length === 0) {
//       doc.text('No hay datos disponibles', 20, yPosition);
//       return;
//     }

//     const headers = [['Mes', 'Total Visitas', 'Tasa Completación %', 'Técnicos Activos', 'Clientes Visitados']];
//     const rows = data.map(tendencia => [
//       tendencia.mes,
//       tendencia.total_visitas.toString(),
//       `${tendencia.tasa_completacion}%`,
//       tendencia.tecnicos_activos.toString(),
//       tendencia.clientes_visitados.toString()
//     ]);

//     autoTable(doc, {
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFGeneral = (doc: jsPDF, data: VisitaReporteGeneral[], yPosition: number) => {
//     if (!data || data.length === 0) {
//       doc.text('No hay datos disponibles', 20, yPosition);
//       return;
//     }

//     const headers = [['Fecha', 'Cliente', 'Técnico', 'Estado', 'Supervisor']];
//     const rows = data.map(visita => [
//       new Date(visita.fecha_programada).toLocaleDateString('es-GT'),
//       visita.cliente_nombre,
//       visita.tecnico_nombre,
//       visita.estado_visita,
//       visita.supervisor_nombre || 'N/A'
//     ]);

//     autoTable(doc, {
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 8 }
//     });
//   };

//   const abrirDialogoReporte = () => {
//     setShowReportDialog(true);
//     setSelectedReport('');
//     setFechaInicio(null);
//     setFechaFin(null);
//   };

//   return (
//     <div className="surface-ground min-h-screen p-3">
//       <Toast ref={toast} />
      
//       {/* Card Encabezado */}
//       <Card className="w-full mb-4 shadow-2 border-round p-5">
//         <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
//           <div className="flex-shrink-0">
//             <Image
//               src={logo}
//               alt="Logo"
//               width="180"
//               className="border-round shadow-2"
//               style={{ background: 'linear-gradient(#f8f8f8,#f1f1f1)' }}
//             />
//           </div>
//           <div className="flex-1 w-full">
//             <h2 className="m-0 text-3xl font-bold" style={{ color: '#0d602d' }}>
//               Bienvenido al Sistema de Gestión
//             </h2>
//             <p className="mt-2 mb-4 text-lg" style={{ color: '#256c3a' }}>
//               SkyNet S.A. – Control integral de producción y administración.
//             </p>
//             <div className="flex align-items-stretch" style={{ maxWidth: 620 }}>
//               <div style={{ width: 4, background: '#16a34a', borderRadius: 2 }} />
//               <div className="flex align-items-center px-3 py-3 bg-green-50 text-green-700 text-sm font-medium w-full border-round-right">
//                 Sistema actualizado - {new Date().toLocaleDateString('es-GT')}
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Métricas */}
//       <div className="grid">
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Técnicos Activos</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <p className="text-3xl font-bold text-green-600 m-0">
//                 {dashboardData?.tecnicos_activos || 0}
//               </p>
//             )}
//           </Card>
//         </div>
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Visitas de Hoy</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <Chart
//                 type="pie"
//                 data={chartData}
//                 options={chartOptions}
//                 className="w-full"
//                 style={{ width: '15rem', height: '15rem' }}
//               />
//             )}
//           </Card>
//         </div>
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Total Visitas Semana</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <p className="text-3xl font-bold text-green-700 m-0">
//                 {dashboardData?.visitas?.find((v: VisitaPeriodo) => v.periodo === 'Esta Semana')?.total || 0}
//               </p>
//             )}
//           </Card>
//         </div>
//       </div>

//       {/* Accesos rápidos */}
//       <Card className="mt-5 p-4 shadow-2 border-round">
//         <h3 className="text-lg font-bold mb-4">Accesos rápidos</h3>
//         <div className="grid">
//           <div className="col-6 md:col-3">
//             <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button 
//               label="Generar Reportes PDF" 
//               icon="pi pi-file-pdf" 
//               className="w-full p-3 shadow-2 border-round" 
//               onClick={abrirDialogoReporte}
//             />
//           </div>
//         </div>
//       </Card>

//       {/* Diálogo para generar reportes PDF */}
//       <Dialog 
//         header="Generar Reporte PDF" 
//         visible={showReportDialog} 
//         style={{ width: '500px' }}
//         onHide={() => setShowReportDialog(false)}
//       >
//         <div className="p-fluid">
//           <div className="field">
//             <label htmlFor="reporte">Seleccionar Reporte</label>
//             <Dropdown
//               id="reporte"
//               value={selectedReport}
//               options={reportOptions}
//               onChange={(e) => setSelectedReport(e.value)}
//               placeholder="Seleccione un reporte"
//             />
//           </div>

//           {selectedReport === 'general' && (
//             <div className="grid">
//               <div className="col-6">
//                 <div className="field">
//                   <label htmlFor="fechaInicio">Fecha Inicio</label>
//                   <Calendar
//                     id="fechaInicio"
//                     value={fechaInicio}
//                     onChange={(e) => setFechaInicio(e.value as Date)}
//                     dateFormat="dd/mm/yy"
//                     showIcon
//                   />
//                 </div>
//               </div>
//               <div className="col-6">
//                 <div className="field">
//                   <label htmlFor="fechaFin">Fecha Fin</label>
//                   <Calendar
//                     id="fechaFin"
//                     value={fechaFin}
//                     onChange={(e) => setFechaFin(e.value as Date)}
//                     dateFormat="dd/mm/yy"
//                     showIcon
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-content-end gap-2 mt-4">
//             <Button 
//               label="Cancelar" 
//               icon="pi pi-times" 
//               className="p-button-secondary" 
//               onClick={() => setShowReportDialog(false)}
//             />
//             <Button 
//               label="Generar PDF" 
//               icon="pi pi-download" 
//               className="p-button-success"
//               onClick={generarReportePDF}
//               disabled={!selectedReport || loading}
//             />
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// };

// export default DashboardPage;

// import { Card } from 'primereact/card';
// import { Image } from 'primereact/image';
// import { Button } from 'primereact/button';
// import { Chart } from 'primereact/chart';
// import { useEffect, useState } from 'react';
// import { Dialog } from 'primereact/dialog';
// import { Dropdown } from 'primereact/dropdown';
// import { Calendar } from 'primereact/calendar';
// import { ProgressSpinner } from 'primereact/progressspinner';
// import logo from '../assets/logo.png';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { 
//   obtenerDashboardActual, 
//   obtenerEficienciaTecnicos,
//   obtenerMetricasPeriodo,
//   obtenerClientesActivos,
//   obtenerTendenciasMensuales,
//   obtenerReporteGeneral,
//   type DashboardActual,
//   type EficienciaTecnico,
//   type ClienteActivo,
//   type MetricasPeriodo,
//   type TendenciaMensual,
//   type VisitaReporteGeneral
// } from '../services/ReportesService';

// // Definir tipos para los datos del dashboard
// interface VisitaPeriodo {
//   periodo: string;
//   total: number;
//   completadas: number;
//   en_progreso: number;
//   pendientes: number;
// }

// interface ChartData {
//   labels: string[];
//   datasets: Array<{
//     data: number[];
//     backgroundColor: string[];
//     hoverBackgroundColor: string[];
//   }>;
// }

// const DashboardPage = () => {
//   const [chartData, setChartData] = useState<ChartData>({
//     labels: [],
//     datasets: []
//   });
//   const [chartOptions, setChartOptions] = useState({});
//   const [dashboardData, setDashboardData] = useState<DashboardActual | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showReportDialog, setShowReportDialog] = useState(false);
//   const [selectedReport, setSelectedReport] = useState('');
//   const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
//   const [fechaFin, setFechaFin] = useState<Date | null>(null);

//   // Opciones de reportes
//   const reportOptions = [
//     { label: 'Dashboard General', value: 'dashboard' },
//     { label: 'Eficiencia de Técnicos', value: 'eficiencia' },
//     { label: 'Clientes Más Activos', value: 'clientes' },
//     { label: 'Métricas por Período', value: 'metricas' },
//     { label: 'Tendencias Mensuales', value: 'tendencias' },
//     { label: 'Reporte General', value: 'general' }
//   ];

//   useEffect(() => {
//     cargarDashboard();
//     configurarGraficoInicial();
//   }, []);

//   const cargarDashboard = async () => {
//     setLoading(true);
//     try {
//       const resultado = await obtenerDashboardActual();
//       if (resultado.ok && resultado.data) {
//         setDashboardData(resultado.data);
//         actualizarGrafico(resultado.data);
//       }
//     } catch (error) {
//       console.error('Error cargando dashboard:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const configurarGraficoInicial = () => {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const data: ChartData = {
//       labels: ['Completadas', 'En Progreso', 'Pendientes'],
//       datasets: [
//         {
//           data: [0, 0, 0],
//           backgroundColor: [
//             documentStyle.getPropertyValue('--green-500'),
//             documentStyle.getPropertyValue('--blue-500'),
//             documentStyle.getPropertyValue('--yellow-500')
//           ],
//           hoverBackgroundColor: [
//             documentStyle.getPropertyValue('--green-400'),
//             documentStyle.getPropertyValue('--blue-400'),
//             documentStyle.getPropertyValue('--yellow-400')
//           ]
//         }
//       ]
//     };
//     const options = {
//       plugins: {
//         legend: {
//           labels: {
//             usePointStyle: true
//           }
//         }
//       }
//     };
//     setChartData(data);
//     setChartOptions(options);
//   };

//   const actualizarGrafico = (data: DashboardActual) => {
//     if (data.visitas && data.visitas.length > 0) {
//       const visitasHoy = data.visitas.find((v: VisitaPeriodo) => v.periodo === 'Hoy') || data.visitas[0];
//       const documentStyle = getComputedStyle(document.documentElement);
      
//       setChartData({
//         labels: ['Completadas', 'En Progreso', 'Pendientes'],
//         datasets: [
//           {
//             data: [
//               visitasHoy.completadas || 0,
//               visitasHoy.en_progreso || 0,
//               visitasHoy.pendientes || 0
//             ],
//             backgroundColor: [
//               documentStyle.getPropertyValue('--green-500'),
//               documentStyle.getPropertyValue('--blue-500'),
//               documentStyle.getPropertyValue('--yellow-500')
//             ],
//             hoverBackgroundColor: [
//               documentStyle.getPropertyValue('--green-400'),
//               documentStyle.getPropertyValue('--blue-400'),
//               documentStyle.getPropertyValue('--yellow-400')
//             ]
//           }
//         ]
//       });
//     }
//   };

//   const generarReportePDF = async () => {
//     setLoading(true);
//     try {
//       let resultado;
      
//       switch (selectedReport) {
//         case 'dashboard':
//           resultado = await obtenerDashboardActual();
//           break;
//         case 'eficiencia':
//           resultado = await obtenerEficienciaTecnicos();
//           break;
//         case 'clientes':
//           resultado = await obtenerClientesActivos();
//           break;
//         case 'metricas':
//           resultado = await obtenerMetricasPeriodo();
//           break;
//         case 'tendencias':
//           resultado = await obtenerTendenciasMensuales({ meses: 6 });
//           break;
//         case 'general':
//           const filtros: any = {};
//           if (fechaInicio) filtros.fechaInicio = fechaInicio.toISOString().split('T')[0];
//           if (fechaFin) filtros.fechaFin = fechaFin.toISOString().split('T')[0];
//           resultado = await obtenerReporteGeneral(filtros);
//           break;
//         default:
//           return;
//       }

//       if (resultado.ok && resultado.data) {
//         crearPDF(selectedReport, resultado.data);
//       }
//     } catch (error) {
//       console.error('Error generando reporte:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const crearPDF = (
//     tipoReporte: string, 
//     data: DashboardActual | EficienciaTecnico[] | ClienteActivo[] | MetricasPeriodo[] | TendenciaMensual[] | VisitaReporteGeneral[]
//   ) => {
//     const doc = new jsPDF();
//     const fecha = new Date().toLocaleDateString('es-GT');
//     debugger;
//     // Encabezado
//     doc.setFontSize(20);
//     doc.setTextColor(40, 40, 40);
//     doc.text('SkyNet S.A. - Reporte del Sistema', 105, 15, { align: 'center' });
    
//     doc.setFontSize(12);
//     doc.setTextColor(100, 100, 100);
//     doc.text(`Generado el: ${fecha}`, 105, 22, { align: 'center' });
    
//     doc.setFontSize(16);
//     doc.setTextColor(13, 96, 45);
//     doc.text(`Reporte: ${reportOptions.find(r => r.value === tipoReporte)?.label}`, 105, 32, { align: 'center' });
    
//     let yPosition = 45;

//     switch (tipoReporte) {
        
//       case 'dashboard':
//         generarPDFDashboard(doc, data as DashboardActual, yPosition);
//         break;
//       case 'eficiencia':
//         generarPDFEficiencia(doc, data as EficienciaTecnico[], yPosition);
//         break;
//       case 'clientes':
//         generarPDFClientes(doc, data as ClienteActivo[], yPosition);
//         break;
//       case 'metricas':
//         generarPDFMetricas(doc, data as MetricasPeriodo[], yPosition);
//         break;
//       case 'tendencias':
//         generarPDFTendencias(doc, data as TendenciaMensual[], yPosition);
//         break;
//       case 'general':
//         generarPDFGeneral(doc, data as VisitaReporteGeneral[], yPosition);
//         break;
//     }

//     doc.save(`reporte-${tipoReporte}-${fecha}.pdf`);
//   };

//   const generarPDFDashboard = (doc: jsPDF, data: DashboardActual, yPosition: number) => {
//     doc.setFontSize(14);
//     doc.setTextColor(40, 40, 40);
//     doc.text('Resumen del Dashboard', 20, yPosition);
    
//     yPosition += 10;
    
//     if (data.visitas) {
//       data.visitas.forEach((periodo: VisitaPeriodo) => {
//         doc.setFontSize(10);
//         doc.setTextColor(80, 80, 80);
//         doc.text(`Período: ${periodo.periodo}`, 25, yPosition);
//         doc.text(`Total: ${periodo.total} | Completadas: ${periodo.completadas} | En Progreso: ${periodo.en_progreso} | Pendientes: ${periodo.pendientes}`, 25, yPosition + 5);
//         yPosition += 15;
//       });
//     }
    
//     doc.text(`Técnicos Activos: ${data.tecnicos_activos || 0}`, 25, yPosition);
//   };

//   const generarPDFEficiencia = (doc: jsPDF, data: EficienciaTecnico[], yPosition: number) => {
//     const headers = [['Técnico', 'Total Visitas', 'Completadas', 'Tasa Éxito %']];
//     const rows = data.map(tecnico => [
//       `${tecnico.nombreTecnico} ${tecnico.apellidoTecnico}`,
//       tecnico.total_visitas.toString(),
//       tecnico.visitas_completadas.toString(),
//       `${tecnico.tasa_exito_porcentaje}%`
//     ]);

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFClientes = (doc: jsPDF, data: ClienteActivo[], yPosition: number) => {
//     const headers = [['Cliente', 'Email', 'Total Visitas', 'Última Visita']];
//     const rows = data.map(cliente => [
//       `${cliente.nombre} ${cliente.apellido}`,
//       cliente.email,
//       cliente.total_visitas.toString(),
//       new Date(cliente.ultima_visita).toLocaleDateString('es-GT')
//     ]);

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFMetricas = (doc: jsPDF, data: MetricasPeriodo[], yPosition: number) => {
//     const headers = [['Mes', 'Total', 'Completadas', 'Canceladas', 'Pendientes']];
//     const rows = data.map(metrica => [
//       metrica.mes,
//       metrica.total_visitas.toString(),
//       metrica.completadas.toString(),
//       metrica.canceladas.toString(),
//       metrica.pendientes.toString()
//     ]);

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFTendencias = (doc: jsPDF, data: TendenciaMensual[], yPosition: number) => {
//     const headers = [['Mes', 'Total Visitas', 'Tasa Completación %', 'Técnicos Activos', 'Clientes Visitados']];
//     const rows = data.map(tendencia => [
//       tendencia.mes,
//       tendencia.total_visitas.toString(),
//       `${tendencia.tasa_completacion}%`,
//       tendencia.tecnicos_activos.toString(),
//       tendencia.clientes_visitados.toString()
//     ]);

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 9 }
//     });
//   };

//   const generarPDFGeneral = (doc: jsPDF, data: VisitaReporteGeneral[], yPosition: number) => {
//     const headers = [['Fecha', 'Cliente', 'Técnico', 'Estado', 'Supervisor']];
//     const rows = data.map(visita => [
//       new Date(visita.fecha_programada).toLocaleDateString('es-GT'),
//       visita.cliente_nombre,
//       visita.tecnico_nombre,
//       visita.estado_visita,
//       visita.supervisor_nombre || 'N/A'
//     ]);

//     (doc as any).autoTable({
//       startY: yPosition,
//       head: headers,
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: [13, 96, 45] },
//       styles: { fontSize: 8 }
//     });
//   };

//   const abrirDialogoReporte = () => {
//     setShowReportDialog(true);
//     setSelectedReport('');
//     setFechaInicio(null);
//     setFechaFin(null);
//   };

//   return (
//     <div className="surface-ground min-h-screen p-3">
//       {/* Card Encabezado */}
//       <Card className="w-full mb-4 shadow-2 border-round p-5">
//         <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
//           <div className="flex-shrink-0">
//             <Image
//               src={logo}
//               alt="Logo"
//               width="180"
//               className="border-round shadow-2"
//               style={{ background: 'linear-gradient(#f8f8f8,#f1f1f1)' }}
//             />
//           </div>
//           <div className="flex-1 w-full">
//             <h2 className="m-0 text-3xl font-bold" style={{ color: '#0d602d' }}>
//               Bienvenido al Sistema de Gestión
//             </h2>
//             <p className="mt-2 mb-4 text-lg" style={{ color: '#256c3a' }}>
//               SkyNet S.A. – Control integral de producción y administración.
//             </p>
//             <div className="flex align-items-stretch" style={{ maxWidth: 620 }}>
//               <div style={{ width: 4, background: '#16a34a', borderRadius: 2 }} />
//               <div className="flex align-items-center px-3 py-3 bg-green-50 text-green-700 text-sm font-medium w-full border-round-right">
//                 Sistema actualizado - {new Date().toLocaleDateString('es-GT')}
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Métricas */}
//       <div className="grid">
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Técnicos Activos</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <p className="text-3xl font-bold text-green-600 m-0">
//                 {dashboardData?.tecnicos_activos || 0}
//               </p>
//             )}
//           </Card>
//         </div>
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Visitas de Hoy</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <Chart
//                 type="pie"
//                 data={chartData}
//                 options={chartOptions}
//                 className="w-full"
//                 style={{ width: '15rem', height: '15rem' }}
//               />
//             )}
//           </Card>
//         </div>
//         <div className="col-12 md:col-4">
//           <Card className="shadow-2 border-round text-center p-4 h-full">
//             <h4 className="text-gray-700 m-0 mb-3">Total Visitas Semana</h4>
//             {loading ? (
//               <ProgressSpinner style={{ width: '50px', height: '50px' }} />
//             ) : (
//               <p className="text-3xl font-bold text-green-700 m-0">
//                 {dashboardData?.visitas?.find((v: VisitaPeriodo) => v.periodo === 'Esta Semana')?.total || 0}
//               </p>
//             )}
//           </Card>
//         </div>
//       </div>

//       {/* Accesos rápidos */}
//       <Card className="mt-5 p-4 shadow-2 border-round">
//         <h3 className="text-lg font-bold mb-4">Accesos rápidos</h3>
//         <div className="grid">
//           <div className="col-6 md:col-3">
//             <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" />
//           </div>
//           <div className="col-6 md:col-3">
//             <Button 
//               label="Generar Reportes PDF" 
//               icon="pi pi-file-pdf" 
//               className="w-full p-3 shadow-2 border-round" 
//               onClick={abrirDialogoReporte}
//             />
//           </div>
//         </div>
//       </Card>

//       {/* Diálogo para generar reportes PDF */}
//       <Dialog 
//         header="Generar Reporte PDF" 
//         visible={showReportDialog} 
//         style={{ width: '500px' }}
//         onHide={() => setShowReportDialog(false)}
//       >
//         <div className="p-fluid">
//           <div className="field">
//             <label htmlFor="reporte">Seleccionar Reporte</label>
//             <Dropdown
//               id="reporte"
//               value={selectedReport}
//               options={reportOptions}
//               onChange={(e) => setSelectedReport(e.value)}
//               placeholder="Seleccione un reporte"
//             />
//           </div>

//           {selectedReport === 'general' && (
//             <div className="grid">
//               <div className="col-6">
//                 <div className="field">
//                   <label htmlFor="fechaInicio">Fecha Inicio</label>
//                   <Calendar
//                     id="fechaInicio"
//                     value={fechaInicio}
//                     onChange={(e) => setFechaInicio(e.value as Date)}
//                     dateFormat="dd/mm/yy"
//                     showIcon
//                   />
//                 </div>
//               </div>
//               <div className="col-6">
//                 <div className="field">
//                   <label htmlFor="fechaFin">Fecha Fin</label>
//                   <Calendar
//                     id="fechaFin"
//                     value={fechaFin}
//                     onChange={(e) => setFechaFin(e.value as Date)}
//                     dateFormat="dd/mm/yy"
//                     showIcon
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-content-end gap-2 mt-4">
//             <Button 
//               label="Cancelar" 
//               icon="pi pi-times" 
//               className="p-button-secondary" 
//               onClick={() => setShowReportDialog(false)}
//             />
//             <Button 
//               label="Generar PDF" 
//               icon="pi pi-download" 
//               className="p-button-success"
//               onClick={generarReportePDF}
//               disabled={!selectedReport || loading}
//             />
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// };

// export default DashboardPage;

// import { Card } from 'primereact/card';
// import { Image } from 'primereact/image';
// import { Button } from 'primereact/button';
// import logo from '../assets/logo.png';
// import { Chart } from 'primereact/chart';
// import { useEffect, useState } from 'react';

// const DashboardPage = () => {

//     const [chartData, setChartData] = useState({});
//     const [chartOptions, setChartOptions] = useState({});

//     useEffect(() => {
//         const documentStyle = getComputedStyle(document.documentElement);
//         const data = {
//             labels: ['A', 'B', 'C'],
//             datasets: [
//                 {
//                     data: [540, 325, 702],
//                     backgroundColor: [
//                         documentStyle.getPropertyValue('--blue-500'),
//                         documentStyle.getPropertyValue('--yellow-500'),
//                         documentStyle.getPropertyValue('--green-500')
//                     ],
//                     hoverBackgroundColor: [
//                         documentStyle.getPropertyValue('--blue-400'),
//                         documentStyle.getPropertyValue('--yellow-400'),
//                         documentStyle.getPropertyValue('--green-400')
//                     ]
//                 }
//             ]
//         }
//         const options = {
//             plugins: {
//                 legend: {
//                     labels: {
//                         usePointStyle: true
//                     }
//                 }
//             }
//         };

//         setChartData(data);
//         setChartOptions(options);
//     }, []);


//     return (
//         <div className="surface-ground min-h-screen p-3">
//             {/* Card Encabezado */}
//             <Card className="w-full mb-4 shadow-2 border-round p-5">
//                 <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
//                     <div className="flex-shrink-0">
//                         <Image
//                             src={logo}
//                             alt="Logo"
//                             width="180"
//                             className="border-round shadow-2"
//                             style={{ background: 'linear-gradient(#f8f8f8,#f1f1f1)' }}
//                         />
//                     </div>
//                     <div className="flex-1 w-full">
//                         <h2 className="m-0 text-3xl font-bold" style={{ color: '#0d602d' }}>
//                             Bienvenido al Sistema de Gestión
//                         </h2>
//                         <p className="mt-2 mb-4 text-lg" style={{ color: '#256c3a' }}>
//                             SkyNet S.A. – Control integral de producción y administración.
//                         </p>
//                         <div className="flex align-items-stretch" style={{ maxWidth: 620 }}>
//                             <div style={{ width: 4, background: '#16a34a', borderRadius: 2 }} />
//                             <div className="flex align-items-center px-3 py-3 bg-green-50 text-green-700 text-sm font-medium w-full border-round-right">
//                                 Sistema actualizado - {new Date().toLocaleDateString('es-GT')}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </Card>

//             {/* Métricas */}
//             <div className="grid">
//                 <div className="col-12 md:col-4">
//                     <Card className="shadow-2 border-round text-center p-4 h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Usuarios Activos</h4>
//                         <p className="text-3xl font-bold text-green-600 m-0">120</p>
//                     </Card>
//                 </div>
//                 <div className="col-12 md:col-4">
//                     <Card className="shadow-2 border-round text-center p-4 h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Visitas del Mes</h4>
//                         <Chart
//                             type="pie"
//                             data={chartData}
//                             options={chartOptions}
//                             className="w-full"
//                             style={{ width: '15rem', height: '15rem' }}
//                         />
//                     </Card>
//                 </div>
//                 <div className="col-12 md:col-4">
//                     <Card className="shadow-2 border-round text-center p-4 h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Ingresos del Mes</h4>
//                         <p className="text-3xl font-bold text-green-700 m-0">Q 25,400</p>
//                     </Card>
//                 </div>
//             </div>

//             {/* Accesos rápidos */}
//             <Card className="mt-5 p-4 shadow-2 border-round">
//                 <h3 className="text-lg font-bold mb-4">Accesos rápidos</h3>
//                 <div className="grid">
//                     <div className="col-6 md:col-3">
//                         <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Reportes" icon="pi pi-chart-line" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// export default DashboardPage;
// import { Image } from 'primereact/image';
// import { Button } from 'primereact/button';
// import logo from '../assets/logo.png';

// const UsuariosPage = () => {
//     return (
//         <div className="surface-ground min-h-screen p-3">
//             {/* Encabezado full width (sin Card) */}
//             <div className="surface-card w-full p-5 shadow-2 border-round">
//                 <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
//                     <div className="flex-shrink-0">
//                         <Image
//                             src={logo}
//                             alt="Logo"
//                             width="180"
//                             className="border-round shadow-2"
//                             style={{ background: 'linear-gradient(#f8f8f8,#f1f1f1)' }}
//                         />
//                     </div>
//                     <div className="flex-1 w-full">
//                         <h2 className="m-0 text-3xl font-bold" style={{ color: '#0d602d' }}>
//                             Bienvenido al Sistema de Gestión
//                         </h2>
//                         <p className="mt-2 mb-4 text-lg" style={{ color: '#256c3a' }}>
//                             SkyNet S.A. – Control integral de producción y administración.
//                         </p>
//                         <div className="flex align-items-stretch" style={{ maxWidth: 620 }}>
//                             <div style={{ width: 4, background: '#16a34a', borderRadius: 2 }} />
//                             <div className="flex align-items-center px-3 py-3 bg-green-50 text-green-700 text-sm font-medium w-full border-round-right">
//                                 Sistema actualizado - {new Date().toLocaleDateString('es-GT')}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Métricas principales (sin Card) */}
//             <div className="grid mt-4">
//                 <div className="col-12 md:col-4">
//                     <div className="surface-card border-round shadow-2 p-4 text-center h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Usuarios Activos</h4>
//                         <p className="text-3xl font-bold text-green-600 m-0">120</p>
//                     </div>
//                 </div>
//                 <div className="col-12 md:col-4">
//                     <div className="surface-card border-round shadow-2 p-4 text-center h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Visitas del Mes</h4>
//                         <p className="text-3xl font-bold text-yellow-600 m-0">350</p>
//                     </div>
//                 </div>
//                 <div className="col-12 md:col-4">
//                     <div className="surface-card border-round shadow-2 p-4 text-center h-full">
//                         <h4 className="text-gray-700 m-0 mb-3">Ingresos del Mes</h4>
//                         <p className="text-3xl font-bold text-green-700 m-0">Q 25,400</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Accesos rápidos */}
//             <div className="mt-4">
//                 <h3 className="text-lg font-bold mb-3">Accesos rápidos</h3>
//                 <div className="grid">
//                     <div className="col-6 md:col-3">
//                         <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                     <div className="col-6 md:col-3">
//                         <Button label="Reportes" icon="pi pi-chart-line" className="w-full p-3 shadow-2 border-round" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UsuariosPage;