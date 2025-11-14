// Gabarita/client/src/components/Layout/Layout.jsx

import React, { useState } from 'react';
import Sidebar from '../sidebar/sidebar.jsx';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado inicial: aberta

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    // Adiciona a classe 'sidebar-closed' ao layout quando fechada
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}> 
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
