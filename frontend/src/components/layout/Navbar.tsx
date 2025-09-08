
import React from 'react';
import { Button } from 'primereact/button';

interface NavbarProps {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ setVisible }) => {
  return (
    <header className="flex align-items-center justify-content-between px-3 py-2 shadow-2 bg-white">
      <h1 className="text-lg text-gray-600 font-semibold m-0">SkyNet S. A</h1>
      <Button
        icon="pi pi-bars"
        text
        severity="secondary"
        aria-label="Abrir menú"
        onClick={() => setVisible(true)}
      />
    </header>
  );
};

export default Navbar;