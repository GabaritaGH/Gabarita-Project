// Gabarita/client/src/components/Sidebar/Sidebar.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import './Sidebar.css';
import Logo from '../../assets/images/logo_gabarita.png';

import { 
  AiOutlineHome, 
  AiOutlineCalendar, 
  AiOutlineEdit, 
  AiOutlineBarChart, 
  AiOutlineRight,
  AiOutlineLogout // Adicionado ícone de logout
} from 'react-icons/ai';
import { BsLayoutSidebar, BsLayoutSidebarReverse } from 'react-icons/bs';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => { 
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redirecionar

  const navItems = [
    { name: 'Comunidade', path: '/home', icon: AiOutlineHome },
    { name: 'Banco de questões', path: '/questions', icon: AiOutlineCalendar },
    { name: 'Simulados', path: '/simulados', icon: AiOutlineEdit },
    { name: 'Estatísticas', path: '/statistics', icon: AiOutlineBarChart },
  ];

  const ToggleIcon = isSidebarOpen ? BsLayoutSidebarReverse : BsLayoutSidebar;

  // Função de Logout
  const handleLogout = () => {
    // 1. Limpa os dados do usuário do armazenamento local
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); // Ou 'userId', dependendo de como você salvou no Login
    
    // 2. Redireciona para a tela de login
    navigate('/'); 
  };

  return (
    <div className={`sidebar-container ${isSidebarOpen ? '' : 'closed'}`}> 
      
      {/* --- PARTE SUPERIOR (Header e Nav) --- */}
      <div className="sidebar-top-content">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={Logo} alt="Gabarita+ Logo" className="logo-img" />
          </div>
          <div className="sidebar-menu-icon" onClick={toggleSidebar}> 
            <ToggleIcon size={24} />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="sidebar-item-content">
                <item.icon size={24} className="sidebar-icon" />
                {isSidebarOpen && <span className="sidebar-item-text">{item.name}</span>} 
              </div>
              {isSidebarOpen && <AiOutlineRight size={16} />} 
            </Link>
          ))}
        </nav>
      </div>

      {/* --- PARTE INFERIOR (Logout) --- */}
      <div className="sidebar-footer">
        {/* Usamos uma div com onClick pois não é uma navegação de rota, é uma ação */}
        <div className="sidebar-item logout-btn" onClick={handleLogout}>
          <div className="sidebar-item-content">
            <AiOutlineLogout size={24} className="sidebar-icon" />
            {isSidebarOpen && <span className="sidebar-item-text">Sair</span>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;