import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/loginPage';
import DashboardPage from "./pages/DahsboardPage";
import Layout from "./components/layout/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import UsuariosPage from "./pages/UsuariosPage";
import ClientesPage from "./pages/ClientesPage";
import VisitasPage from "./pages/VisitasPage";
import VisitasTecnico from "./pages/VisitasTecnico";
import AsignarTecnicosSupervisoresPage from "./pages/AsignarTecnicosSupervisoresPage";
import VisitasSupervisorPage from "./pages/VisitasSupervisorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<LoginPage />} />

        {/* Rutas privadas */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["Administrador", "Supervisor"]}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
           <Route
            path="/usuarios"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <UsuariosPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <ClientesPage />
              </PrivateRoute>
            }
          />
         
          <Route
            path="/visitas"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <VisitasPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/visitas-tecnico"
            element={
              <PrivateRoute roles={["Tecnico"]}>
                <VisitasTecnico />
              </PrivateRoute>
            }
          />
          <Route
            path="/asignar-tecnico-supervisor"
            element={
              <PrivateRoute roles={["Administrador"]}>
                <AsignarTecnicosSupervisoresPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/visitas-supervisor"
            element={
              <PrivateRoute roles={["Supervisor"]}>
                <VisitasSupervisorPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Página de error si no tiene permisos */}
        <Route path="/unauthorized" element={<h1>No autorizado</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// import 'primereact/resources/themes/saga-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/loginPage';
// import Layout from './components/layout/Layout';
// import UsuariosPage from './pages/UsuariosPage';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route element={<Layout />}>
//           <Route path="/clientes" element={<UsuariosPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;