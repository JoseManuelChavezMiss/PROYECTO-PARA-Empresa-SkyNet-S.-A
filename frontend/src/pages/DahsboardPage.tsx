import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import logo from '../assets/logo.png';
import { Chart } from 'primereact/chart';
import { useEffect, useState } from 'react';

const DashboardPage = () => {

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [540, 325, 702],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--green-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--green-400')
                    ]
                }
            ]
        }
        const options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, []);


    return (
        <div className="surface-ground min-h-screen p-3">
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

            {/* Métricas */}
            <div className="grid">
                <div className="col-12 md:col-4">
                    <Card className="shadow-2 border-round text-center p-4 h-full">
                        <h4 className="text-gray-700 m-0 mb-3">Usuarios Activos</h4>
                        <p className="text-3xl font-bold text-green-600 m-0">120</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="shadow-2 border-round text-center p-4 h-full">
                        <h4 className="text-gray-700 m-0 mb-3">Visitas del Mes</h4>
                        <Chart
                            type="pie"
                            data={chartData}
                            options={chartOptions}
                            className="w-full"
                            style={{ width: '15rem', height: '15rem' }}
                        />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="shadow-2 border-round text-center p-4 h-full">
                        <h4 className="text-gray-700 m-0 mb-3">Ingresos del Mes</h4>
                        <p className="text-3xl font-bold text-green-700 m-0">Q 25,400</p>
                    </Card>
                </div>
            </div>

            {/* Accesos rápidos */}
            <Card className="mt-5 p-4 shadow-2 border-round">
                <h3 className="text-lg font-bold mb-4">Accesos rápidos</h3>
                <div className="grid">
                    <div className="col-6 md:col-3">
                        <Button label="Usuarios" icon="pi pi-users" className="w-full p-3 shadow-2 border-round" />
                    </div>
                    <div className="col-6 md:col-3">
                        <Button label="Clientes" icon="pi pi-building" className="w-full p-3 shadow-2 border-round" />
                    </div>
                    <div className="col-6 md:col-3">
                        <Button label="Visitas" icon="pi pi-calendar" className="w-full p-3 shadow-2 border-round" />
                    </div>
                    <div className="col-6 md:col-3">
                        <Button label="Reportes" icon="pi pi-chart-line" className="w-full p-3 shadow-2 border-round" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;
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