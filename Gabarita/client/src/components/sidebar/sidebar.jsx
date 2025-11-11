import React, { useState } from "react";
import "./Sidebar.css";
import {
  Home,
  BookOpen,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Topo */}
      <div className="sidebar-top">
        <h2 className="logo">Gabarita</h2>
        <button className="collapse-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/comunidade">
              <Home size={20} />
              <span>Comunidade</span>
            </Link>
          </li>
          <li>
            <Link to="/banco">
              <BookOpen size={20} />
              <span>Banco de Questões</span>
            </Link>
          </li>
          <li>
            <Link to="/simulados">
              <ClipboardList size={20} />
              <span>Simulados</span>
            </Link>
          </li>
          <li>
            <Link to="/estatisticas">
              <BarChart2 size={20} />
              <span>Estatísticas</span>
            </Link>
          </li>
          <li>
            <Link to="/configuracoes">
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Rodapé */}
      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
