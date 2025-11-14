// Gabarita/client/src/components/Sidebar/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

// Importando ícones da biblioteca react-icons
import { 
  AiOutlineHome, 
  AiOutlineCalendar, 
  AiOutlineEdit, 
  AiOutlineBarChart, 
  AiOutlineSetting,
  AiOutlineRight 
} from 'react-icons/ai';
import { BsLayoutSidebar, BsLayoutSidebarReverse } from 'react-icons/bs'; // Novos ícones

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => { // Recebe props
  const location = useLocation();

  const navItems = [
    { name: 'Comunidade', path: '/home', icon: AiOutlineHome },
    { name: 'Banco de questões', path: '/questions', icon: AiOutlineCalendar },
    { name: 'Simulados', path: '/simulations', icon: AiOutlineEdit },
    { name: 'Estatísticas', path: '/stats', icon: AiOutlineBarChart },
    { name: 'Configurações', path: '/settings', icon: AiOutlineSetting },
  ];

  // Determina qual ícone de toggle usar
  const ToggleIcon = isSidebarOpen ? BsLayoutSidebarReverse : BsLayoutSidebar;

  return (
    // Adiciona a classe 'closed' quando a sidebar está fechada
    <div className={`sidebar-container ${isSidebarOpen ? '' : 'closed'}`}> 
      {/* Cabeçalho com Logo e Ícone de Menu */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src=".../assets/images/logo_gabarita.png" alt="Gabarita+ Logo" className="logo-img" />
          <span>Gabarita+</span>
        </div>
        {/* Adiciona o evento onClick para o toggle */}
        <div className="sidebar-menu-icon" onClick={toggleSidebar}> 
          <ToggleIcon size={24} />
        </div>
      </div>

      {/* Itens de Navegação */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="sidebar-item-content">
              <item.icon size={24} className="sidebar-icon" />
              {/* Mostra o texto apenas se a sidebar estiver aberta */}
              {isSidebarOpen && <span className="sidebar-item-text">{item.name}</span>} 
            </div>
            {/* Mostra a seta apenas se a sidebar estiver aberta */}
            {isSidebarOpen && <AiOutlineRight size={16} />} 
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
