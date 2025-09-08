import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="layout">
      <Navbar setVisible={setVisible} /> {/* quitado visible */}
      <div className="flex">
        <Sidebar visible={visible} setVisible={setVisible} />
        <main className="content flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;