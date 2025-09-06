import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import Layout from './components/layout/Layout';
import UsuariosPage from './pages/UsuariosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/clientes" element={<UsuariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;