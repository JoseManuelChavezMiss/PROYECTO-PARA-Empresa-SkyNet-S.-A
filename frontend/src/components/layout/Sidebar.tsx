import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from 'primereact/menuitem';

interface AppSidebarProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ visible, setVisible }) => {
  const navigate = useNavigate();

  const go = (ruta: string) => {
    setVisible(false);
    navigate(ruta);
  };

  // Solo 2 items simples
  const items: MenuItem[] = [
    {
      label: 'Clientes',
      icon: 'pi pi-users',
      command: () => go('/clientes')
    },
    {
      label: 'Reservaciones',
      icon: 'pi pi-calendar',
      command: () => go('/reservaciones')
    }
  ];

  return (
    <Sidebar
      visible={visible}
      onHide={() => setVisible(false)}
      position="left"
      className="p-0"
    >
      <PanelMenu model={items} className="border-none w-15rem" />
    </Sidebar>
  );
};

export default AppSidebar;