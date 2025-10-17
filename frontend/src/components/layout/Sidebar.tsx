import React, { useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Ripple } from 'primereact/ripple';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { logout, getUserRole, isAdministrador, isSupervisor, isTecnico } from '../../services/AuthService';

interface AppSidebarProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ visible, setVisible }) => {
  const navigate = useNavigate();
  const btnRef = useRef<Button>(null);

  const userRole = getUserRole();
  const isAdmin = isAdministrador();
  const supervisor = isSupervisor();
  const tecnico = isTecnico();

  const go = (ruta: string) => {
    setVisible(false);
    navigate(ruta);
  };

  const handleLogout = async () => {
    setVisible(false);
    const res = await logout();
    if (res.ok) {
      navigate('/');
    } else {
      alert('Error al cerrar sesión: ' + res.mensaje);
    }
  };

  return (
    <Sidebar
      visible={visible}
      onHide={() => setVisible(false)}
      position="left"
      className="p-0"
      content={({ hide }) => (
        <div className="min-h-screen flex relative surface-ground">
          <div className="surface-section h-screen flex-shrink-0 left-0 top-0 z-1 border-right-1 surface-border select-none" style={{ width: '280px' }}>
            <div className="flex flex-column h-full">
              {/* ENCABEZADO */}
              <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                <span className="inline-flex align-items-center gap-2">
                  <i className="pi pi-briefcase text-primary text-2xl"></i>
                  <span className="font-semibold text-2xl text-primary">SkyNet</span>
                </span>
                <Button
                  type="button"
                  ref={btnRef}
                  onClick={(e) => hide(e)}
                  icon="pi pi-times"
                  rounded
                  outlined
                  className="h-2rem w-2rem"
                />
              </div>

              {/* MENÚ PRINCIPAL */}
              <div className="overflow-y-auto mt-4">
                <ul className="list-none p-3 m-0">

                  {/* DASHBOARD  solo visible para el administrador*/}
                  {isAdmin && (
                    <li>
                      <a
                        onClick={() => go('/dashboard')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-th-large mr-2"></i>
                        <span className="font-medium">Dashboard</span>
                        <Ripple />
                      </a>
                    </li>
                  )}

                  {/* VISITAS - solo para Administrador y Supervisor */}
                  {(isAdmin || supervisor) && (
                    <li>
                      <a
                        onClick={() => go('/visitas')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-map-marker mr-2"></i>
                        <span className="font-medium">Visitas</span>
                        <Ripple />
                      </a>
                    </li>
                  )}

                  {/* MIS VISITAS - solo para Técnicos */}
                  {tecnico && (
                    <li>
                      <a
                        onClick={() => go('/visitas-tecnico')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-wrench mr-2"></i>
                        <span className="font-medium">Mis Visitas</span>
                        <Ripple />
                      </a>
                    </li>
                  )}

                  {/* CLIENTES - visible para Administrador y Supervisor */}
                  {(isAdmin || supervisor) && (
                    <li>
                      <a
                        onClick={() => go('/clientes')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-users mr-2"></i>
                        <span className="font-medium">Clientes</span>
                        <Ripple />
                      </a>
                    </li>
                  )}
                  {/* ASIGNAR TÉCNICO A SUPERVISOR - solo Administrador */}
                  {isAdmin && (
                    <li>
                      <a
                        onClick={() => go('/asignar-tecnico-supervisor')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-user-plus mr-2"></i>
                        <span className="font-medium">Asignar Técnico a Supervisor</span>
                        <Ripple />
                      </a>
                    </li>
                  )}

                  {/* USUARIOS - solo Administrador */}
                  {isAdmin && (
                    <li>
                      <a
                        onClick={() => go('/usuarios')}
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        <i className="pi pi-id-card mr-2"></i>
                        <span className="font-medium">Usuarios</span>
                        <Ripple />
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* FOOTER Y CERRAR SESIÓN */}
              <div className="mt-auto">
                <hr className="mb-3 mx-3 border-top-1 surface-border" />
                <ul className="list-none p-3 m-0">
                  <li className="m-3 flex align-items-center gap-2 text-700">
                    <i className="pi pi-user text-primary"></i>
                    <span className="font-bold">{userRole}</span>
                  </li>
                  <li>
                    <a
                      onClick={handleLogout}
                      className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                    >
                      <i className="pi pi-sign-out mr-2"></i>
                      <span className="font-medium">Cerrar Sesión</span>
                      <Ripple />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default AppSidebar;

// import React, { useRef } from 'react';
// import { Sidebar } from 'primereact/sidebar';
// import { Ripple } from 'primereact/ripple';
// import { Button } from 'primereact/button';
// import { useNavigate } from 'react-router-dom';
// import { logout } from '../../services/AuthService';

// interface AppSidebarProps {
//   visible: boolean;
//   setVisible: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const AppSidebar: React.FC<AppSidebarProps> = ({ visible, setVisible }) => {
//   const navigate = useNavigate();
//   const btnRef = useRef<Button>(null);

//   const go = (ruta: string) => {
//     setVisible(false);
//     navigate(ruta);
//   };

//   const handleLogout = async () => {
//     setVisible(false);
//     const res = await logout();
//     if (res.ok) {
//       navigate('/');
//     } else {
//       alert('Error al cerrar sesión: ' + res.mensaje);
//     }
//   };

//   return (
//     <Sidebar
//       visible={visible}
//       onHide={() => setVisible(false)}
//       position="left"
//       className="p-0"
//       content={({ hide }) => (
//         <div className="min-h-screen flex relative surface-ground">
//           <div className="surface-section h-screen flex-shrink-0 left-0 top-0 z-1 border-right-1 surface-border select-none" style={{ width: '280px' }}>
//             <div className="flex flex-column h-full">
//               {/* ENCABEZADO */}
//               <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
//                 <span className="inline-flex align-items-center gap-2">
//                   <i className="pi pi-briefcase text-primary text-2xl"></i>
//                   <span className="font-semibold text-2xl text-primary">SkyNet</span>
//                 </span>
//                 <Button
//                   type="button"
//                   ref={btnRef}
//                   onClick={(e) => hide(e)}
//                   icon="pi pi-times"
//                   rounded
//                   outlined
//                   className="h-2rem w-2rem"
//                 />
//               </div>

//               {/* MENÚ PRINCIPAL */}
//               <div className="overflow-y-auto mt-4">
//                 <ul className="list-none p-3 m-0">
//                   {/* DASHBOARD */}
//                   <li>
//                     <a
//                       onClick={() => go('/dashboard')}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-th-large mr-2"></i>
//                       <span className="font-medium">Dashboard</span>
//                       <Ripple />
//                     </a>
//                   </li>

//                   {/* VISITAS */}
//                   <li>
//                     <a
//                       onClick={() => go('/visitas')}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-map-marker mr-2"></i>
//                       <span className="font-medium">Visitas</span>
//                       <Ripple />
//                     </a>
//                   </li>

//                   {/* VISITAS TÉCNICO */}
//                   <li>
//                     <a
//                       onClick={() => go('/visitas-tecnico')}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-wrench mr-2"></i>
//                       <span className="font-medium">Mis Visitas</span>
//                       <Ripple />
//                     </a>
//                   </li>

//                   {/* CLIENTES */}
//                   <li>
//                     <a
//                       onClick={() => go('/clientes')}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-users mr-2"></i>
//                       <span className="font-medium">Clientes</span>
//                       <Ripple />
//                     </a>
//                   </li>

//                   {/* USUARIOS */}
//                   <li>
//                     <a
//                       onClick={() => go('/usuarios')}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-id-card mr-2"></i>
//                       <span className="font-medium">Usuarios</span>
//                       <Ripple />
//                     </a>
//                   </li>
//                 </ul>
//               </div>

//               {/* FOOTER Y CERRAR SESIÓN */}
//               <div className="mt-auto">
//                 <hr className="mb-3 mx-3 border-top-1 surface-border" />
//                 <ul className="list-none p-3 m-0">
//                   <li className="m-3 flex align-items-center gap-2 text-700">
//                     <i className="pi pi-user text-primary"></i>
//                     <span className="font-bold">Usuario</span>
//                   </li>
//                   <li>
//                     <a
//                       onClick={handleLogout}
//                       className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
//                     >
//                       <i className="pi pi-sign-out mr-2"></i>
//                       <span className="font-medium">Cerrar Sesión</span>
//                       <Ripple />
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     />
//   );
// };

// export default AppSidebar;



// import React from 'react';
// import { Sidebar } from 'primereact/sidebar';
// import { PanelMenu } from 'primereact/panelmenu';
// import { useNavigate } from 'react-router-dom';
// import type { MenuItem } from 'primereact/menuitem';

// interface AppSidebarProps {
//   visible: boolean;
//   setVisible: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const AppSidebar: React.FC<AppSidebarProps> = ({ visible, setVisible }) => {
//   const navigate = useNavigate();

//   const go = (ruta: string) => {
//     setVisible(false);
//     navigate(ruta);
//   };

//   // Solo 2 items simples
//   const items: MenuItem[] = [
//     {
//       label: 'Clientes',
//       icon: 'pi pi-users',
//       command: () => go('/clientes')
//     },
//     {
//       label: 'Reservaciones',
//       icon: 'pi pi-calendar',
//       command: () => go('/reservaciones')
//     }
//   ];

//   return (
//     <Sidebar
//       visible={visible}
//       onHide={() => setVisible(false)}
//       position="left"
//       className="p-0"
//     >
//       <PanelMenu model={items} className="border-none w-15rem" />
//     </Sidebar>
//   );
// };

// export default AppSidebar;